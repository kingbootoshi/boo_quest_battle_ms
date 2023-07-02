import { ChatCompletionRequestMessage } from "openai";
import { config } from "dotenv";
config()

export const MIN_DAMAGE = Number(process.env.MIN_DAMAGE) ?? 0;
export const MAX_DAMAGE = Number(process.env.MAX_DAMAGE) ?? 0;

export const MIN_ROLL = Number(process.env.MIN_ROLL) ?? 0;
export const MAX_ROLL = Number(process.env.MAX_ROLL) ?? 0;

export const CLASSIFICATION_BASE_URL = process.env.CLASSIFICATION_BASE_URL ?? ""

export const monsterRules:ChatCompletionRequestMessage[] = [
  {
    role: 'system',
    content: 'Rule 1: Respond to the player directly',
  },
  {
    role: 'system',
    content: 'Rule 2: Respond with only 50 characters or less',
  },
  {
    role: 'system',
    content: 'Rule 3: Respond as if you were talking to the player.',
  },
  {
    role: 'system',
    content: 'Rule 4: Responsd in 3rd person',
  },
]