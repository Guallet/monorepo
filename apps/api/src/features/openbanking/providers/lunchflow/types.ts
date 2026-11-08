export type LunchFlowRemoteAccount = {
  id: string | number;
  connection_id?: string | number | null;
  name: string;
  institution_name?: string | null;
  institution_logo?: string | null;
  provider?: string | null;
  currency?: string | null;
  status?: string | null;
};

export type LunchFlowRemoteTransaction = {
  id: string | number;
  amount: number;
  currency: string;
  date: string;
  merchant?: string | null;
  description?: string | null;
  isPending?: boolean;
};
