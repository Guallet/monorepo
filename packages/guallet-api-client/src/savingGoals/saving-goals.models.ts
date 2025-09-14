export type SavingGoalDto = {
  id: string;
  name: string;
  description?: string;
  target_amount: number;
  target_date: string;
  accounts: string[];
  priority?: number;
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
