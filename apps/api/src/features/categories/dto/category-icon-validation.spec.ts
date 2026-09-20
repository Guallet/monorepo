import { validate } from 'class-validator';
import { describe, expect, it } from 'vitest';
import { CreateCategoryDto } from './create-category.dto';
import { UpdateCategoryDto } from './update-category.dto';

describe('category icon validation', () => {
  it('accepts a Luna UI category icon name', async () => {
    const dto = Object.assign(new CreateCategoryDto(), {
      name: 'Groceries',
      icon: 'IconShoppingCart',
      colour: '#22c55e',
      parentId: null,
    });

    await expect(validate(dto)).resolves.toHaveLength(0);
  });

  it('rejects an unsupported icon name on create', async () => {
    const dto = Object.assign(new CreateCategoryDto(), {
      name: 'Groceries',
      icon: 'IconNotSharedByLuna',
      colour: '#22c55e',
      parentId: null,
    });

    const errors = await validate(dto);

    expect(errors.some((error) => error.property === 'icon')).toBe(true);
  });

  it('rejects an unsupported icon name on update', async () => {
    const dto = Object.assign(new UpdateCategoryDto(), {
      icon: 'IconNotSharedByLuna',
    });

    const errors = await validate(dto);

    expect(errors.some((error) => error.property === 'icon')).toBe(true);
  });
});
