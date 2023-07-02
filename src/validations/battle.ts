import { z } from 'zod';

const assetSchema = z.object({
	id: z.string(),
	name: z.string(),
	stats: z.array(
		z.object({
			id: z.number(),
			value: z.number(),
		})
	),
	equipment: z.array(
		z.object({
			name: z.string(),
			bonuses: z.array(
				z.object({
					statId: z.number(),
					value: z.number(),
				})
			),
		})
	),
	action: z.string(),
});

const mobSchema = z.object({
	id: z.string(),
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
	id: z.number(),
	value: z.number(),
});

export const battleSchema = z.object({
	chatId: z.string(),
	definedStats: z.array(z.object({ id: z.number(), name: z.string() })),
	asset: assetSchema,
	mob: mobSchema,
	bonuses: z.array(bonusSchema),
});

export type Asset = z.infer<typeof assetSchema>;
export type Mob = z.infer<typeof mobSchema>;
export type Bonus = z.infer<typeof bonusSchema>;
export type Stat = z.infer<typeof statSchema>;
