export type SavingGoalDto = {
  id: string;
  name: string;
  description?: string;
  target_amount: number;
  target_date: string;
  accounts: string[];
};

export type CreateSavingGoalRequest = {
  name: string;
  description?: string;
  target_amount: number;
  target_date: string; // ISO string
  accounts: string[];
};

export type UpdateSavingGoalRequest = {
  name?: string;
  description?: string;
  target_amount?: number;
  target_date?: string; // ISO string
  accounts?: string[];
};
