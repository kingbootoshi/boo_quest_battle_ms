import { z } from "zod";

const mobSchema = z.object({
  name: z.string(),
  lore: z.string(),
  legion: z.string(),
  gasLighting: z.string(),
  parameters: z.string(),
  heart: z.string(),
  personality: z.string(),
});

const characterSchema = z.object({
  name: z.string(),
});

export const battleSchema = z.object({
  roll: z.number(),
  character: characterSchema,
  mob: mobSchema,
});

export type Character = z.infer<typeof characterSchema>;
export type Mob = z.infer<typeof mobSchema>;
