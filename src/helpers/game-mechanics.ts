import axios from 'axios';
import { ChatCompletionRequestMessage } from 'openai';

import { type Bonus, type Stat } from '@/validations/battle';
import {
	MIN_DAMAGE,
	MAX_DAMAGE,
	MAX_ROLL,
	MIN_ROLL,
	monsterRules,
	CLASSIFICATION_BASE_URL,
} from '@/constants';

import openai from '@/services/openai';
import { config } from 'dotenv';

config();

interface ClassificationResponse {
	data: {
		classification: string;
	};
}

// Random Dice Number
function diceRoll(bonusRoll: number = 0): number {
	return Math.floor(Math.random() * MAX_ROLL) + MIN_ROLL + bonusRoll;
}

// Random Attack Number
function attack(additionalDamage: number = 0, multiplier: number = 1): number {
	return (
		(Math.floor(Math.random() * MAX_DAMAGE) + MIN_DAMAGE + additionalDamage) *
		multiplier
	);
}

// Classifies User's Text
export async function getClassification(
	input: string,
	definedStats: any
): Promise<any> {
	const { data } = (await axios.post(
		CLASSIFICATION_BASE_URL + '/api/classification',
		{
			input,
			definedStats,
		}
	)) as ClassificationResponse;
	return data;
}

// Battle between two players
export function battleOut(bonusRoll: number): {
	playerRoll: number;
	monsterRoll: number;
	playerDamage: number;
	monsterDamage: number;
} {
	/** Player Roll */
	const playerRoll = diceRoll(bonusRoll);
	let playerDamage = 0;

	if (playerRoll >= 20) {
		playerDamage = attack(0, 2);
	} else if (playerRoll > 14) {
		playerDamage = attack();
	}

	/** Monster Roll */
	let monsterRoll = diceRoll();
	let monsterDamage = 0;
	if (playerRoll === 1) {
		monsterRoll = diceRoll(5);
	}
	if (monsterRoll === 1) {
		playerDamage += 2;
	} else if (monsterRoll >= 20) {
		monsterDamage = attack(0, 2);
	} else if (monsterRoll > 14) {
		monsterDamage = attack();
	}

	return {
		playerRoll,
		monsterRoll,
		playerDamage,
		monsterDamage,
	};
}

// Finds bonuses
export function getBonusRoll(
	statId: number,
	value: number,
	bonuses: Bonus[]
): number {
	const foundBonus = bonuses.find(
		({ statId: bonusStat }) => bonusStat === statId
	);
	if (!foundBonus) return 0;
	const { min, max } = foundBonus;
	if (value >= min && value <= max) {
		return foundBonus.bonus;
	}
	return 0;
}

// Gets total stats = Current player stats + equipment stats
export function calcStats(stats: Stat[], equipment: Stat[]): Stat[] {
	const mappedStats: any = {};
	stats.forEach(({ id, value }) => (mappedStats[id] = value));
	equipment.forEach(({ id, value }) => {
		if (!mappedStats[id]) {
			mappedStats[id] = value;
		} else {
			mappedStats[id] += value;
		}
	});
	const totalStats = [];
	for (const key in mappedStats) {
		totalStats.push({ id: Number(key), value: mappedStats[key] });
	}

	return totalStats;
}

export async function generateAIResponse(
	monsterDetails: ChatCompletionRequestMessage[],
	playerRoll: number,
	username: string
): Promise<any> {
	const defaultMsgs: ChatCompletionRequestMessage[] = [
		...monsterDetails,
		...monsterRules,
	];
	if (playerRoll === 20) {
		defaultMsgs.push({
			role: 'system',
			content:
				'You have been attacked (critically) by the player respond with anger.',
		});
	} else if (playerRoll > 14) {
		defaultMsgs.push({
			role: 'system',
			content:
				'You have been attacked (but not critically) by the player respond with disdain.',
		});
	} else {
		defaultMsgs.push({
			role: 'system',
			content:
				'You have been attacked (but no harm) by the player respond disrespectfully.',
		});
	}

	defaultMsgs.push({
		role: "system",
		content: `If you decide to mention the player use their name: ${username}`
	})
	const result = await openai.createChatCompletion({
		model: 'gpt-3.5-turbo',
		messages: defaultMsgs,
		max_tokens: 256,
		temperature: 0.85,
		presence_penalty: 1.5,
		frequency_penalty: 1.5,
		n: 1,
	});

	return result?.data?.choices[0]?.message ?? '';
}
