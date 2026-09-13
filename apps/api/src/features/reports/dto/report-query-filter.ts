import { ApiProperty } from '@nestjs/swagger';
export class ReportQueryFilter {
  @ApiProperty({ type: [String] })
  accounts: string[];
  @ApiProperty({ type: [String] })
  categories: string[];
  @ApiProperty()
  startDate: string;
  @ApiProperty()
  endDate: string;
}
