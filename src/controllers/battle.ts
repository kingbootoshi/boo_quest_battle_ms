import { ChatCompletionRequestMessage } from "openai";
import { type Request, type Response } from "express";
import { battleSchema } from "@/validations/battle";
import { ZodError } from "zod";
import { generateAIResponse } from "@/helpers/game-mechanics";

export async function battle(req: Request, res: Response) {
  try {
    const { character, mob } = battleSchema.parse(req.body);

    /** Monster response  */
    const monsterMessages: ChatCompletionRequestMessage[] = Object.values(
      mob
    ).map((content) => ({ role: "system", content }));

    const aiResponse = await generateAIResponse(
      monsterMessages,
      character.name
    );
    return res.status(200).json({
      action: aiResponse.content,
    });
  } catch (error) {
    console.log("ERROR", error);
    if (error instanceof ZodError) {
      return res.status(422).json({ message: error.message });
    }
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
