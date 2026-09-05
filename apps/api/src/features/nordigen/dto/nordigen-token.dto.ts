import { ApiProperty } from '@nestjs/swagger';

export class NordigenTokenDto {
  @ApiProperty()
  access: string;
  @ApiProperty()
  access_expires: number;
  @ApiProperty()
  refresh: string;
  @ApiProperty()
  refresh_expires: number;
}
