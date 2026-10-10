import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayNotEmpty,
  IsArray,
  IsInt,
  IsOptional,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

function splitIds({ value }: { value: unknown }): unknown {
  if (typeof value === 'string') return value.split(',');
  return value;
}

export class MonthlyReportQueryDto {
  @ApiProperty({ minimum: 1900, maximum: 9999 })
  @Type(() => Number)
  @IsInt()
  @Min(1900)
  @Max(9999)
  year: number;

  @ApiProperty({ minimum: 1, maximum: 12 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  month: number;

  @ApiProperty({
    type: 'array',
    items: { type: 'string', format: 'uuid' },
    required: false,
    description: 'Comma-separated account UUIDs. Omit for all accounts.',
  })
  @IsOptional()
  @Transform(splitIds)
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMaxSize(100)
  @IsUUID('all', { each: true })
  accounts?: string[];

  @ApiProperty({
    type: 'array',
    items: { type: 'string', format: 'uuid' },
    required: false,
    description:
      'Comma-separated category UUIDs, including their descendants. Omit for all categories, including untagged.',
  })
  @IsOptional()
  @Transform(splitIds)
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMaxSize(100)
  @IsUUID('all', { each: true })
  categories?: string[];
}
