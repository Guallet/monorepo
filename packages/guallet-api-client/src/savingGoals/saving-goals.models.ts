export type SavingGoalDto = {
  id: string;
  name: string;
  description?: string;
  targetAmount: number;
  targetDate: string;
  accounts: string[];
  priority?: number;
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
  targetDate?: Date;
  accounts?: string[];
  priority?: number;
};
