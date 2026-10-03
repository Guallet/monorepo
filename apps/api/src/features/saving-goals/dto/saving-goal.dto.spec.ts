import { SavingGoalDto } from './saving-goal.dto';
import { SavingGoal } from '../entities/saving-goal.entity';

function makeGoal(overrides: Partial<SavingGoal> = {}): SavingGoal {
  return {
    id: 'goal-1',
    userId: 'user-1',
    name: 'Test Goal',
    description: undefined,
    target_amount: 1000,
    target_date: undefined,
    accounts: [],
    priority: undefined,
    ...overrides,
  } as SavingGoal;
}

describe('SavingGoalDto.fromDomain', () => {
  describe('currentAmount', () => {
    it('is 0 until linked account balances are computed', () => {
      const dto = SavingGoalDto.fromDomain(makeGoal());
      expect(dto.currentAmount).toBe(0);
    });
  });

  describe('progressPercentage', () => {
    it('is 0 when targetAmount is 0', () => {
      const dto = SavingGoalDto.fromDomain(makeGoal({ target_amount: 0 }));
      expect(dto.progressPercentage).toBe(0);
    });

    it('is 0 when currentAmount is 0 and targetAmount > 0', () => {
      const dto = SavingGoalDto.fromDomain(makeGoal({ target_amount: 1000 }));
      expect(dto.progressPercentage).toBe(0);
    });
  });

  describe('isCompleted', () => {
    it('is false when progress is below 100', () => {
      const dto = SavingGoalDto.fromDomain(makeGoal({ target_amount: 1000 }));
      expect(dto.isCompleted).toBe(false);
    });

    it('is false when targetAmount is 0', () => {
      const dto = SavingGoalDto.fromDomain(makeGoal({ target_amount: 0 }));
      expect(dto.isCompleted).toBe(false);
    });
  });

  describe('remainingAmount', () => {
    it('equals targetAmount when currentAmount is 0', () => {
      const dto = SavingGoalDto.fromDomain(makeGoal({ target_amount: 1000 }));
      expect(dto.remainingAmount).toBe(1000);
    });

    it('is 0 when targetAmount is 0', () => {
      const dto = SavingGoalDto.fromDomain(makeGoal({ target_amount: 0 }));
      expect(dto.remainingAmount).toBe(0);
    });
  });

  describe('daysRemaining', () => {
    it('is null when no target date is set', () => {
      const dto = SavingGoalDto.fromDomain(
        makeGoal({ target_date: undefined }),
      );
      expect(dto.daysRemaining).toBeNull();
    });

    it('is positive when target date is in the future', () => {
      const future = new Date();
      future.setDate(future.getDate() + 30);
      const dto = SavingGoalDto.fromDomain(makeGoal({ target_date: future }));
      expect(dto.daysRemaining).toBeGreaterThan(0);
    });

    it('is negative when target date is in the past', () => {
      const past = new Date();
      past.setDate(past.getDate() - 10);
      const dto = SavingGoalDto.fromDomain(makeGoal({ target_date: past }));
      expect(dto.daysRemaining).toBeLessThan(0);
    });
  });

  describe('isOverdue', () => {
    it('is false when no target date is set', () => {
      const dto = SavingGoalDto.fromDomain(
        makeGoal({ target_date: undefined }),
      );
      expect(dto.isOverdue).toBe(false);
    });

    it('is false when target date is in the future', () => {
      const future = new Date();
      future.setDate(future.getDate() + 30);
      const dto = SavingGoalDto.fromDomain(makeGoal({ target_date: future }));
      expect(dto.isOverdue).toBe(false);
    });

    it('is true when target date is in the past and goal is not completed', () => {
      const past = new Date();
      past.setDate(past.getDate() - 10);
      const dto = SavingGoalDto.fromDomain(
        makeGoal({ target_date: past, target_amount: 1000 }),
      );
      expect(dto.isOverdue).toBe(true);
    });

    it('is true when target date is in the past regardless of targetAmount being 0', () => {
      const past = new Date();
      past.setDate(past.getDate() - 10);
      const dto = SavingGoalDto.fromDomain(
        makeGoal({ target_date: past, target_amount: 0 }),
      );
      // isCompleted is false when targetAmount=0 (progress=0%), so isOverdue=true
      expect(dto.isOverdue).toBe(true);
    });
  });

  describe('base fields', () => {
    it('maps entity fields correctly', () => {
      const targetDate = new Date('2026-12-31');
      const goal = makeGoal({
        id: 'g-1',
        name: 'Holiday',
        description: 'Christmas fund',
        target_amount: 2000,
        target_date: targetDate,
        accounts: ['acc-1', 'acc-2'],
      });

      const dto = SavingGoalDto.fromDomain(goal);

      expect(dto.id).toBe('g-1');
      expect(dto.name).toBe('Holiday');
      expect(dto.description).toBe('Christmas fund');
      expect(dto.targetAmount).toBe(2000);
      expect(dto.targetDate).toEqual(targetDate);
      expect(dto.accounts).toEqual(['acc-1', 'acc-2']);
    });
  });
});
