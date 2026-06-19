import { z } from 'zod';

export const PokemonResponseSchema = z.object({
  species: z.object({ name: z.string(), url: z.string() }),
  weight: z.number(),
});

export const SpeciesResponseSchema = z.object({
  evolution_chain: z.object({ url: z.string() }),
});

export type ChainLink = z.infer<typeof ChainLinkSchema>;

export const ChainLinkSchema: z.ZodType<{
  species: { name: string; url: string };
  evolves_to: ChainLink[];
}> = z.object({
  species: z.object({ name: z.string(), url: z.string() }),
  evolves_to: z.array(z.lazy(() => ChainLinkSchema)),
});

export const EvolutionChainResponseSchema = z.object({
  chain: ChainLinkSchema,
});
