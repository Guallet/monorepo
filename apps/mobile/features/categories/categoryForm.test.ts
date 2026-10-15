import { describe, expect, it } from 'vitest';
import type { CategoryDto } from '@guallet/api-client';
import {
  categoryForm,
  categoryFormChanged,
  eligibleCategoryParents,
} from './categoryForm';

const categories: CategoryDto[] = [
  {
    id: 'food',
    name: 'Food',
    parentId: null,
    icon: 'IconTag',
    colour: '#005EB8',
  },
  {
    id: 'groceries',
    name: 'Groceries',
    parentId: 'food',
    icon: 'IconBasket',
    colour: '#005EB8',
  },
  {
    id: 'home',
    name: 'Home',
    parentId: null,
    icon: 'IconHome',
    colour: '#005EB8',
  },
];

describe('category parent choices', () => {
  it('offers only root categories when creating a category', () => {
    expect(eligibleCategoryParents(categories).map((item) => item.id)).toEqual([
      'food',
      'home',
    ]);
  });
  it('lets a child move to another root', () => {
    expect(
      eligibleCategoryParents(categories, 'groceries').map((item) => item.id),
    ).toEqual(['food', 'home']);
  });
  it('excludes the category itself from parent choices', () => {
    expect(
      eligibleCategoryParents(categories, 'home').map((item) => item.id),
    ).toEqual(['food']);
  });
  it('blocks reparenting a category with children', () => {
    expect(eligibleCategoryParents(categories, 'food')).toEqual([]);
  });
});

describe('category edit draft', () => {
  it('detects moving a child to None', () => {
    const initial = categoryForm(categories[1]);
    expect(categoryFormChanged({ ...initial, parentId: null }, initial)).toBe(
      true,
    );
  });
  it('treats whitespace-only name changes as unchanged', () => {
    const initial = categoryForm(categories[1]);
    expect(
      categoryFormChanged({ ...initial, name: ' Groceries ' }, initial),
    ).toBe(false);
  });
  it('preserves categories with absent optional appearance values', () => {
    expect(
      categoryForm({ ...categories[0], icon: null, colour: null }),
    ).toEqual({ name: 'Food', parentId: null, icon: '', colour: '' });
  });
});
