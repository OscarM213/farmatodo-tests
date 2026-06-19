import { test, expect } from '@playwright/test';
import { insertionSort } from '../../utils/sort';

test.describe('insertionSort', () => {
  const compareNumbers = (a: number, b: number) => a - b;
  const compareStrings = (a: string, b: string) => a.localeCompare(b);

  test('sorts numbers in ascending order', () => {
    const result = insertionSort([3, 1, 4, 1, 5, 9, 2, 6], compareNumbers);
    expect(result).toEqual([1, 1, 2, 3, 4, 5, 6, 9]);
  });

  test('handles an empty array', () => {
    expect(insertionSort([], compareNumbers)).toEqual([]);
  });

  test('handles a single element', () => {
    expect(insertionSort([42], compareNumbers)).toEqual([42]);
  });

  test('handles already sorted array', () => {
    expect(insertionSort([1, 2, 3, 4, 5], compareNumbers)).toEqual([1, 2, 3, 4, 5]);
  });

  test('handles reverse sorted array', () => {
    expect(insertionSort([5, 4, 3, 2, 1], compareNumbers)).toEqual([1, 2, 3, 4, 5]);
  });

  test('sorts strings alphabetically', () => {
    const result = insertionSort(['wartortle', 'blastoise', 'squirtle'], compareStrings);
    expect(result).toEqual(['blastoise', 'squirtle', 'wartortle']);
  });

  test('handles duplicates', () => {
    expect(insertionSort([3, 1, 2, 1, 3], compareNumbers)).toEqual([1, 1, 2, 3, 3]);
  });

  test('does not mutate the original array', () => {
    const original = [3, 1, 2];
    const copy = [...original];
    insertionSort(original, compareNumbers);
    expect(original).toEqual(copy);
  });

  test('sorts objects by a property', () => {
    const items = [
      { name: 'wartortle', weight: 225 },
      { name: 'blastoise', weight: 855 },
      { name: 'squirtle', weight: 90 },
    ];
    const sorted = insertionSort(items, (a, b) => a.name.localeCompare(b.name));
    expect(sorted.map(i => i.name)).toEqual(['blastoise', 'squirtle', 'wartortle']);
  });
});
