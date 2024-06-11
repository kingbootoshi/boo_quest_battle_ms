import axios from "axios";
import { ChatCompletionRequestMessage } from "openai";

import { monsterRules } from "@/constants";

import openai from "@/services/openai";
import { config } from "dotenv";

config();

export async function generateAIResponse(
  monsterDetails: ChatCompletionRequestMessage[],
  username: string
): Promise<any> {
  const defaultMsgs: ChatCompletionRequestMessage[] = [
    ...monsterDetails,
    ...monsterRules,
  ];

  defaultMsgs.push({
    role: "system",
    content: "Respond in first person.",
  });
  defaultMsgs.push({
    role: "system",
    content:
      "Respond as if you are already attacking. No need to describe the enviroment around you.",
  });

  defaultMsgs.push({
    role: "system",
    content: "Make sounds when attacking the player",
  });

  defaultMsgs.push({
    role: "system",
    content: `If you decide to mention the player use their name: ${username}`,
  });

  const result = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: defaultMsgs,
    max_tokens: 256,
    temperature: 0.85,
    presence_penalty: 1.5,
    frequency_penalty: 1.5,
    n: 1,
  });

  return result?.data?.choices[0]?.message ?? "";
}
