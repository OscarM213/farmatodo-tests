import { test, expect } from '@playwright/test';
import { getSquirtleEvolutionChain } from '../../api/client';
import { insertionSort } from '../../utils/sort';
import type { PokemonEntry } from '../../utils/types';

test.describe('PokéAPI - Integration Test', () => {
  test('get Squirtle evolution chain, sort alphabetically, and display weights', async ({ request }) => {
    const entries = await getSquirtleEvolutionChain(request);

    expect(entries).toHaveLength(3);
    const squirtle = entries.find((e: PokemonEntry) => e.name === 'squirtle')!;
    expect(squirtle.weight).toBe(90);

    const sorted = insertionSort(entries, (a: PokemonEntry, b: PokemonEntry) =>
      a.name.localeCompare(b.name)
    );

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
