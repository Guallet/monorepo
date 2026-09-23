import { describe, expect, it } from 'vitest';
import {
  buildCategoryPickerTree,
  toggleCategorySelection,
  type CategoryPickerItem,
} from './categoryPicker.utils';

const categories: CategoryPickerItem[] = [
  { id: 'food', name: 'Food & drink', parentId: null },
  { id: 'groceries', name: 'Groceries', parentId: 'food' },
  { id: 'dining', name: 'Dining out', parentId: 'food' },
  { id: 'home', name: 'Home & bills', parentId: null },
  { id: 'rent', name: 'Rent', parentId: 'home' },
];

describe('buildCategoryPickerTree', () => {
  it('groups categories into two levels', () => {
    expect(buildCategoryPickerTree(categories)).toEqual([
      { category: categories[0], children: [categories[1], categories[2]] },
      { category: categories[3], children: [categories[4]] },
    ]);
  });

  it('keeps the parent visible when a child matches search', () => {
    expect(buildCategoryPickerTree(categories, 'grocer')).toEqual([
      { category: categories[0], children: [categories[1]] },
    ]);
  });

  it('shows all children when their parent matches search', () => {
    expect(buildCategoryPickerTree(categories, 'food')).toEqual([
      { category: categories[0], children: [categories[1], categories[2]] },
    ]);
  });
});

describe('toggleCategorySelection', () => {
  it('adds and removes parent or child IDs independently', () => {
    expect(toggleCategorySelection(['groceries'], 'food')).toEqual([
      'groceries',
      'food',
    ]);
    expect(toggleCategorySelection(['food', 'groceries'], 'food')).toEqual([
      'groceries',
    ]);
  });
});
