import { ApiProperty } from '@nestjs/swagger';

export class ReportQueryFilter {
  @ApiProperty({ required: false, type: [String] })
  accounts: string[];
  @ApiProperty({ required: false, type: [String] })
  categories: string[];
  @ApiProperty({ required: false, type: String, format: 'date-time' })
  startDate: string;
  @ApiProperty({ required: false, type: String, format: 'date-time' })
  endDate: string;
}
