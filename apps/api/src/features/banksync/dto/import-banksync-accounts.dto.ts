import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsString,
  ValidateNested,
} from 'class-validator';

export class BankSyncAccountSelectionDto {
  @ApiProperty()
  @IsString()
  bankId: string;

  @ApiProperty()
  @IsString()
  accountId: string;
}

export class ValidatedImportBankSyncAccountsDto {
  @ApiProperty({ type: () => [BankSyncAccountSelectionDto], minItems: 1 })
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => BankSyncAccountSelectionDto)
  accounts: BankSyncAccountSelectionDto[];
}

export class ValidatedUnlinkBankSyncAccountDto {
  @ApiProperty()
  @IsString()
  bankId: string;

  @ApiProperty()
  @IsString()
  accountId: string;
}
