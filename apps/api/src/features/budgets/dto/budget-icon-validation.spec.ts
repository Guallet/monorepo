import { validate } from 'class-validator';
import { describe, expect, it } from 'vitest';
import { UpdateBudgetDto } from './update-budget.dto';

describe('budget icon validation', () => {
  it('accepts a Luna UI category icon name', async () => {
    const dto = Object.assign(new UpdateBudgetDto(), {
      icon: 'IconPigMoney',
    });

    await expect(validate(dto)).resolves.toHaveLength(0);
  });

  it('rejects an unsupported icon name', async () => {
    const dto = Object.assign(new UpdateBudgetDto(), {
      icon: 'IconNotSharedByLuna',
    });

    const errors = await validate(dto);

    expect(errors.some((error) => error.property === 'icon')).toBe(true);
  });
});
