import { ApiProperty } from '@nestjs/swagger';

export class NordigenRequisitionDto {
  @ApiProperty()
  id: string;
  @ApiProperty({ type: String, format: 'date-time' })
  created: Date;
  @ApiProperty()
  redirect: string;
  @ApiProperty()
  status: string;
  @ApiProperty()
  institution_id: string;
  @ApiProperty()
  agreement: string;
  @ApiProperty()
  reference: string;
  @ApiProperty({ type: [String] })
  accounts: string[];
  @ApiProperty()
  user_language: string;
  @ApiProperty()
  link: string;
  @ApiProperty()
  ssn: string;
  @ApiProperty()
  account_selection: boolean;
  @ApiProperty()
  redirect_immediate: boolean;
}
