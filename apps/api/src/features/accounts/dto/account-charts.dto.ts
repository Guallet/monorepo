import { ApiProperty } from '@nestjs/swagger';

export class BalanceHistoryPoint {
  date: string;
  balance: number;

  constructor(date: string, balance: number) {
    this.date = date;
    this.balance = balance;
  }
}

export class AccountChartsDto {
  @ApiProperty({ description: 'The start date of the chart' })
  startDate: Date;

  @ApiProperty({ description: 'The end date of the chart' })
  endDate: Date;

  chart: ChartData[];
  balanceHistory: BalanceHistoryPoint[];

  static fromDomain(
    startDate: Date,
    endDate: Date,
    data: ChartData[],
    balanceHistory: BalanceHistoryPoint[],
  ): AccountChartsDto {
    return {
      startDate: startDate,
      endDate: endDate,
      chart: data,
      balanceHistory,
    };
  }
}

export class ChartData {
  month: number;
  year: number;
  total_in: number;
  total_out: number;

  constructor(
    month: number,
    year: number,
    total_in: number,
    total_out: number,
  ) {
    this.month = month;
    this.year = year;
    this.total_in = total_in;
    this.total_out = total_out;
  }
}
