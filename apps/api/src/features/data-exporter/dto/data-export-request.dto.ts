import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsIn,
  IsISO8601,
  IsOptional,
  IsString,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

export type ExportFormat = 'csv' | 'ofe' | 'json';

@ValidatorConstraint({ name: 'validExportDateRange', async: false })
class ValidExportDateRange implements ValidatorConstraintInterface {
  validate(endDate: string | undefined, args: ValidationArguments) {
    const { startDate } = args.object as { startDate?: string };
    return (
      !startDate || !endDate || startDate.slice(0, 10) <= endDate.slice(0, 10)
    );
  }

  defaultMessage() {
    return 'endDate must be on or after startDate';
  }
}

export class DataExportRequestDto {
  @IsOptional()
  @IsISO8601()
  @ApiProperty({
    required: false,
    format: 'date',
    description:
      'Start calendar date for export filtering. Time is ignored; the full date is included using UTC day boundaries.',
    example: '2024-01-01',
  })
  startDate?: string;

  @IsOptional()
  @IsISO8601()
  @Validate(ValidExportDateRange)
  @ApiProperty({
    required: false,
    format: 'date',
    description:
      'End calendar date for export filtering. Time is ignored; the full date is included using UTC day boundaries. Must be on or after startDate.',
    example: '2024-12-31',
  })
  endDate?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ApiProperty({
    required: false,
    description:
      'List of account IDs to include. If empty, all accounts are included.',
    example: ['account-id-1', 'account-id-2'],
    type: [String],
  })
  accounts?: string[];

  @IsOptional()
  @IsIn(['csv', 'ofe', 'json'])
  @ApiProperty({
    required: false,
    description: 'Export format. Defaults to csv',
    enum: ['csv', 'ofe', 'json'],
    example: 'csv',
  })
  format?: ExportFormat;
}
