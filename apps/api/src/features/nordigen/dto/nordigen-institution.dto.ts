import { ApiProperty } from '@nestjs/swagger';

export class NordigenInstitutionDto {
  @ApiProperty()
  id: string;
  @ApiProperty()
  name: string;
  @ApiProperty()
  bic: string;
  @ApiProperty()
  transaction_total_days: string;
  @ApiProperty()
  logo: string;
  @ApiProperty({ type: [String] })
  countries: string[];
}
