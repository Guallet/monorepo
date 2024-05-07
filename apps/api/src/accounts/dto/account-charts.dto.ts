import { ApiProperty } from '@nestjs/swagger';

export class AccountChartsDto {
  @ApiProperty({ description: 'The start date of the chart' })
  startDate: Date;

  @ApiProperty({ description: 'The end date of the chart' })
  endDate: Date;

  chart: ChartData[];

  static fromDomain(
    startDate: Date,
    endDate: Date,
    data: ChartData[],
  ): AccountChartsDto {
    return {
      startDate: startDate,
      endDate: endDate,
      chart: data,
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
