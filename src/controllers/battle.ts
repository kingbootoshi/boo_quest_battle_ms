import { ChatCompletionRequestMessage } from "openai";
import { type Request, type Response } from "express";
import { battleSchema, type Skill } from "@/validations/battle";
import { ZodError } from "zod";
import {
  battleOut,
  calcStats,
  generateAIResponse,
  getBonusRoll,
  getClassification,
} from "@/helpers/game-mechanics";

export async function battle(req: Request, res: Response) {
  try {
    const { character, mob, bonuses, definedStats, monsterAttack, action } =
      battleSchema.parse(req.body);

    /* Fetch user input classification */
    const { classification } = monsterAttack
      ? { classification: null }
      : await getClassification(action || "", definedStats);

    /* Extract effects from equipment */
    const equipmentEffects = character.equipment
      .map((equipment) => {
        const hey = equipment.effects.map(({ Value, type }) => ({
          Value,
          Key: type.Key,
        }));
        return hey;
      })
      .flat();

    /* 
			if a player has 10 Strength, and they use a strength attack, they should get the roll bonus based on their 10 Str (if such a bonus exists)
		 	Calc total stats of the user and the equipment
		*/
    const totalStats: Skill[] = calcStats(character.skills);

    var statUsed: Skill | undefined = undefined;
    if (classification !== null) {
      statUsed = totalStats.find(({ Skill }) => Skill === classification.id);
    }

    const foundStat = definedStats.find(({ id }) => id === classification?.id);

    /* Check if user has bonus roll */
    let bonusRoll: number = statUsed
      ? getBonusRoll(
          classification?.id,
          statUsed?.Experience,
          foundStat?.levelScale ?? 0,
          bonuses
        )
      : 0;

    equipmentEffects.forEach(({ Key, Value }) => {
      if (classification?.name === Key) {
        bonusRoll += Value;
      }
    });

    bonusRoll += 1;

    // FIGHT!!!!
    const battleOutcome = battleOut(bonusRoll, mob.difficulty);

    /** Monster response  */
    if (monsterAttack) {
      const { monster } = mob;
      const monstMsgs: ChatCompletionRequestMessage[] = Object.values(
        monster
      ).map((content) => ({ role: "system", content }));

      const aiResponse = await generateAIResponse(monstMsgs, character.name);
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
    console.log("ERROR", error);
    if (error instanceof ZodError) {
      return res.status(422).json({ message: error.message });
    }
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
