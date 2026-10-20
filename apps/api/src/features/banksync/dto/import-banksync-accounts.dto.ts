import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class BankSyncAccountSelectionDto {
  @ApiProperty()
  @IsString()
  bankId: string;

  @ApiProperty()
  @IsString()
  accountId: string;
}
