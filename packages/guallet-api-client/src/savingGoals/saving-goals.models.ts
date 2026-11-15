export type SavingGoalDto = {
  id: string;
  name: string;
  description?: string;
  targetAmount: number;
  targetDate?: Date | null;
  accounts: string[];
  priority?: number | null;
  currentAmount: number;
  progressPercentage: number;
  isCompleted: boolean;
  isOverdue: boolean;
  remainingAmount: number;
  daysRemaining: number | null;
};

export type CreateSavingGoalRequest = {
  name: string;
  description?: string;
  targetAmount: number;
  targetDate?: Date;
  accounts: string[];
  priority?: number;
};

export type UpdateSavingGoalRequest = {
  name?: string;
  description?: string;
  targetAmount?: number;
  /** Omit to retain; null clears the stored target date. */
  targetDate?: Date | null;
  accounts?: string[];
  priority?: number;
};
