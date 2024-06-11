import { z } from "zod";

const mobSchema = z.object({
  id: z.number(),
  name: z.string(),
  monster: z.object({
    lore: z.string(),
    legion: z.string(),
    gasLighting: z.string(),
    parameters: z.string(),
    heart: z.string(),
    personality: z.string(),
  }),
  difficulty: z.number(),
});

const characterSchema = z.object({
  id: z.number(),
  name: z.string(),
  action: z.string().nullable(),
});

export const battleSchema = z.object({
  character: characterSchema,
  mob: mobSchema,
});

export type Character = z.infer<typeof characterSchema>;
export type Mob = z.infer<typeof mobSchema>;
