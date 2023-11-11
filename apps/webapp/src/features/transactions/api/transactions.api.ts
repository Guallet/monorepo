import { get } from "../../../core/api/fetchHelper";
import { TransactionQueryResultDto } from "../models/Transaction";

export async function loadTransactions(
  page: number,
  pageSize: number
): Promise<TransactionQueryResultDto[]> {
  const queryPath = `transactions?page=${page}&pageSize=${pageSize}`;
  return await get<TransactionQueryResultDto[]>(queryPath);
}
