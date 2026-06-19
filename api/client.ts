import { type APIRequestContext } from '@playwright/test';
import {
  PokemonResponseSchema,
  SpeciesResponseSchema,
  EvolutionChainResponseSchema,
} from '../utils/schemas';

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
