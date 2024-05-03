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

const bonusSchema = z.object({
  statId: z.number(),
  min: z.number(),
  max: z.number(),
  bonus: z.number(),
});

const skillSchema = z.object({
  Skill: z.number(),
  Experience: z.number(),
});

const itemSchema = z.object({
  Name: z.string().nullable(),
  Description: z.string(),
  MaxDurability: z.number(),
});

const equipmentSchema = z.object({
  Slot: z.number().nullable(),
  Quantity: z.number().nullable(),
  Durability: z.number().nullable(),
  item: itemSchema,
  effects: z.array(
    z.object({
      Value: z.number(),
      AlwaysApply: z.boolean(),
      ApplyChance: z.number(),
      type: z.object({
        Name: z.string(),
        Description: z.string(),
        Key: z.string(),
        Passive: z.boolean(),
      }),
    })
  ),
});

const characterSchema = z.object({
  id: z.number(),
  name: z.string(),
  skills: z.array(skillSchema),
  equipment: z.array(equipmentSchema),
});

export const battleSchema = z.object({
  definedStats: z.array(
    z.object({
      id: z.number(),
      name: z.string(),
      levelScale: z.number(),
    })
  ),
  character: characterSchema,
  mob: mobSchema,
  monsterAttack: z.boolean(),
  bonuses: z.array(bonusSchema),
  action: z.optional(z.string().default("")).nullable(),
});

export type Character = z.infer<typeof characterSchema>;
export type Mob = z.infer<typeof mobSchema>;
export type Bonus = z.infer<typeof bonusSchema>;
export type Skill = z.infer<typeof skillSchema>;
export type Equipment = z.infer<typeof equipmentSchema>;
