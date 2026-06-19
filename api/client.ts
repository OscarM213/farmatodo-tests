import { type APIRequestContext } from '@playwright/test';
import {
  PokemonResponseSchema,
  SpeciesResponseSchema,
  EvolutionChainResponseSchema,
} from '../utils/schemas';
import type { PokemonEntry } from '../utils/types';

const POKEAPI_BASE = 'https://pokeapi.co/api/v2';

export async function fetchPokemon(request: APIRequestContext, name: string) {
  const res = await request.get(`${POKEAPI_BASE}/pokemon/${name}`);
  return { status: res.status(), data: PokemonResponseSchema.parse(await res.json()) };
}

export async function fetchSpecies(request: APIRequestContext, url: string) {
  const res = await request.get(url);
  return { status: res.status(), data: SpeciesResponseSchema.parse(await res.json()) };
}

export async function fetchEvolutionChain(request: APIRequestContext, url: string) {
  const res = await request.get(url);
  return { status: res.status(), data: EvolutionChainResponseSchema.parse(await res.json()) };
}

export async function getSquirtleEvolutionChain(
  request: APIRequestContext
): Promise<PokemonEntry[]> {
  const pokemon = await fetchPokemon(request, 'squirtle');
  const species = await fetchSpecies(request, pokemon.data.species.url);
  const chain = await fetchEvolutionChain(request, species.data.evolution_chain.url);

  const names: string[] = [];
  function traverse(node: { species: { name: string }; evolves_to: typeof node[] }) {
    names.push(node.species.name);
    for (const child of node.evolves_to) traverse(child);
  }
  traverse(chain.data.chain);

  const entries: PokemonEntry[] = [];
  for (const name of names) {
    const p = await fetchPokemon(request, name);
    entries.push({ name, weight: p.data.weight });
  }
  return entries;
}
