import { ChatCompletionRequestMessage } from 'openai';
import { type Request, type Response } from 'express';
import { battleSchema, type Stat } from '@/validations/battle';
import { ZodError } from 'zod';
import {
	battleOut,
	calcStats,
	generateAIResponse,
	getBonusRoll,
	getClassification,
} from '@/helpers/game-mechanics';

export async function battle(req: Request, res: Response) {
	try {
		const { character, mob, bonuses, definedStats, monsterAttack } =
			battleSchema.parse(req.body);

		/* Fetch user input classification */
		const { classification } = monsterAttack
			? { classification: null }
			: await getClassification(character.action, definedStats);

		/* Extract bonuses from equipment */
		const equipmentBonuses: Stat[] = character.equipment.reduce(
			(accumulator: Stat[], curr) => {
				const conversion = curr.Item.Stats.map(({ StatId, Experience }) => ({
					StatId,
					Experience,
				}));
				return [...accumulator, ...conversion];
			},
			[] as Stat[]
		);

		/* 
			if a player has 10 Strength, and they use a strength attack, they should get the roll bonus based on their 10 Str (if such a bonus exists)
		 	Calc total stats of the user and the equipment
		*/
		const totalStats: Stat[] = calcStats(character.stats, equipmentBonuses);

		var statUsed: Stat | undefined = undefined;
		if (classification !== null) {
			statUsed = totalStats.find(({ StatId }) => StatId === classification.id);
		}

		const foundStat = definedStats.find(({ id }) => id === classification?.id);

		/* Check if user has bonus roll */
		const bonusRoll: number = statUsed
			? getBonusRoll(
					classification?.id,
					statUsed?.Experience,
					foundStat?.levelScale ?? 0,
					bonuses
			  )
			: 0;

		// FIGHT!!!!
		const battleOutcome = battleOut(bonusRoll);

		/** Monster response  */
		if (monsterAttack) {
			const { monster } = mob;
			const monstMsgs: ChatCompletionRequestMessage[] = Object.values(
				monster
			).map((content) => ({ role: 'system', content }));

			const aiResponse = await generateAIResponse(
				monstMsgs,
				battleOutcome.playerRoll,
				character.name
			);
			return res.status(200).json({
				damage: battleOutcome.monsterDamage,
				roll: battleOutcome.monsterRoll,
				response: aiResponse.content,
			});
		}

		/** User Response */
		return res.status(200).json({
			damage: battleOutcome.playerDamage,
			roll: battleOutcome.playerRoll,
			classification,
		});

		// Return classifciation & dice roll
	} catch (error) {
		console.log('ERROR', error);
		if (error instanceof ZodError) {
			return res.status(422).json({ message: error.message });
		}
		return res.status(500).json({ message: 'Internal Server Error' });
	}
}
