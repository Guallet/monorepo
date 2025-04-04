import { get } from "@/api/fetchHelper";
import { CashflowDataDto } from "./cashflow.models";

export async function getCashflowReportData(
  year: number
): Promise<CashflowDataDto> {
  return await get<CashflowDataDto>(`reports/cashflow?year=${year}`);
}
