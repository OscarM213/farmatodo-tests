import { test, expect } from '@playwright/test';
import { fetchPokemon, fetchSpecies, fetchEvolutionChain } from '../../api/client';
import { insertionSort } from '../../utils/sort';
import type { ChainLink } from '../../utils/schemas';
import type { PokemonEntry } from '../../utils/types';

function extractEvolutionNames(chain: ChainLink): string[] {
  const names: string[] = [];
  function traverse(node: ChainLink) {
    names.push(node.species.name);
    for (const child of node.evolves_to) {
      traverse(child);
    }
  }
  traverse(chain);
  return names;
}

test.describe('PokéAPI - Integration Test', () => {
  test('get Squirtle evolution chain, sort alphabetically, and display weights', async ({ request }) => {
    const pokemon = await fetchPokemon(request, 'squirtle');
    expect(pokemon.status).toBe(200);

    const species = await fetchSpecies(request, pokemon.data.species.url);
    expect(species.status).toBe(200);

    const chain = await fetchEvolutionChain(request, species.data.evolution_chain.url);
    expect(chain.status).toBe(200);

    const evolutionNames = extractEvolutionNames(chain.data.chain);
    expect(evolutionNames).toEqual(['squirtle', 'wartortle', 'blastoise']);

    const entries: PokemonEntry[] = [];
    for (const name of evolutionNames) {
      const p = await fetchPokemon(request, name);
      expect(p.status).toBe(200);
      entries.push({ name, weight: p.data.weight });
    }

    const sorted = insertionSort(entries, (a, b) => a.name.localeCompare(b.name));

    expect(sorted).toHaveLength(3);
    expect(sorted[0].weight).toBe(855);

    console.log('\n=== Pokemon Evolution Chain (Sorted Alphabetically) ===');
    for (const entry of sorted) {
      console.log(`${entry.name} - ${entry.weight}`);
    }

    expect(sorted).toEqual([
      { name: 'blastoise', weight: 855 },
      { name: 'squirtle', weight: 90 },
      { name: 'wartortle', weight: 225 },
    ]);
  });
});
