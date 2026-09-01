import { ApiProperty } from '@nestjs/swagger';

export class BalanceHistoryPoint {
  @ApiProperty({
    description: 'The calendar date for the balance point',
    example: '2026-01-31',
  })
  date: string;

  @ApiProperty({ description: 'The account balance at the end of the date' })
  balance: number;

  constructor(date: string, balance: number) {
    this.date = date;
    this.balance = balance;
  }
}

export class AccountChartsDto {
  @ApiProperty({
    description: 'The start date of the chart',
    type: String,
    format: 'date-time',
  })
  startDate: Date;

  @ApiProperty({
    description: 'The end date of the chart',
    type: String,
    format: 'date-time',
  })
  endDate: Date;

  @ApiProperty({
    description: 'Monthly cash-flow data',
    type: () => [ChartData],
  })
  chart: ChartData[];

  @ApiProperty({
    description: 'Daily balance history',
    type: () => [BalanceHistoryPoint],
  })
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
  @ApiProperty({ description: 'Month number, zero-based' })
  month: number;

  @ApiProperty({ description: 'Calendar year' })
  year: number;

  @ApiProperty({ description: 'Total money in during the month' })
  total_in: number;

  @ApiProperty({ description: 'Total money out during the month' })
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
