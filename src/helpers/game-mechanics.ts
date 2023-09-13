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
		classification: string | undefined;
	};
}

// Random Dice Number
function diceRoll(bonusRoll: number = 0): number {
	return Math.floor(Math.random() * MAX_ROLL) + MIN_ROLL + bonusRoll;
}

// Random Attack Number
function attack(additionalDamage: number = 0, multiplier: number = 1): number {
	return (
		Math.floor(Math.random() * MAX_DAMAGE) +
		(MIN_DAMAGE + additionalDamage) * multiplier
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
export function battleOut(bonusRoll: number, monsterDifficulty: number): {
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
	} else if (playerRoll > monsterDifficulty) {
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
	} else if (monsterRoll > 10) { // Player difficulty is currently hardcoded to 10, giving mobs a 50% chance of hitting a player
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
	experience: number,
	levelScale: number,
	bonuses: Bonus[]
): number {
	const value = experienceToLevel(experience, levelScale);
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
	stats.forEach(({ StatId, Experience }) => (mappedStats[StatId] = Experience));
	equipment.forEach(({ StatId, Experience }) => {
		if (!mappedStats[StatId]) {
			mappedStats[StatId] = Experience;
		} else {
			mappedStats[StatId] += Experience;
		}
	});
	const totalStats = [];
	for (const key in mappedStats) {
		totalStats.push({ StatId: Number(key), Experience: mappedStats[key] });
	}

	return totalStats;
}

export async function generateAIResponse(
	monsterDetails: ChatCompletionRequestMessage[],
	username: string
): Promise<any> {
	const defaultMsgs: ChatCompletionRequestMessage[] = [
		...monsterDetails,
		...monsterRules,
	];

	defaultMsgs.push({
		role: 'system',
		content: 'Respond in first person.',
	});
	defaultMsgs.push({
		role: 'system',
		content:
			'Respond as if you are already attacking. No need to describe the enviroment around you.',
	});

	defaultMsgs.push({
		role: 'system',
		content: 'Make sounds when attacking the player',
	});

	defaultMsgs.push({
		role: 'system',
		content: `If you decide to mention the player use their name: ${username}`,
	});

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

export function experienceToLevel(experience: number, levelScale: number) {
	if (experience < levelScale) return 1;
	else {
		let l = 1;
		while (levelToExperience(l, levelScale) <= experience) {
			l++;
		}
		return l;
	}
}

export function levelToExperience(level: number, levelScale: number) {
	const res = level * levelScale + ((level * (level + 1)) / 2) * levelScale;
	return res;
}
