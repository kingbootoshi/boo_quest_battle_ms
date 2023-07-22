import { z } from 'zod';

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
});

const bonusSchema = z.object({
	statId: z.number(),
	min: z.number(),
	max: z.number(),
	bonus: z.number(),
});

const statSchema = z.object({
	StatId: z.number(),
	Experience: z.number(),
});

const itemSchema = z.object({
	Name: z.string().nullable(),
	Description: z.string(),
	ItemTypeId: z.number(),
	Id: z.number(),
	Type: z.string(),
	Stats: z.array(statSchema)
})


const equipmentSchema = z.object({
	ItemId: z.number(),
	Durability: z.number().nullable(),
	Item: itemSchema
})


const characterSchema = z.object({
	id: z.number(),
	name: z.string(),
	stats: z.array(statSchema),
	equipment: z.array(equipmentSchema),
	action: z.string(),
});


export const battleSchema = z.object({
	definedStats: z.array(z.object({ id: z.number(), name: z.string(), levelScale: z.number() })),
	character: characterSchema,
	mob: mobSchema,
	bonuses: z.array(bonusSchema),
});

export type Character = z.infer<typeof characterSchema>;
export type Mob = z.infer<typeof mobSchema>;
export type Bonus = z.infer<typeof bonusSchema>;
export type Stat = z.infer<typeof statSchema>;
export type Equipment = z.infer<typeof equipmentSchema>
