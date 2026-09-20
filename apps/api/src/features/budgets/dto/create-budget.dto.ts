import { categoryIconNames, type CategoryIconName } from '@guallet/theme';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsArray,
  IsUUID,
  Length,
  ArrayNotEmpty,
  IsIn,
} from 'class-validator';

export class CreateBudgetDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsNumber()
  amount: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Length(3, 3)
  currency: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  colour?: string;

  @ApiProperty({ required: false, enum: categoryIconNames })
  @IsOptional()
  @IsIn(categoryIconNames)
  icon?: CategoryIconName;

  @ApiProperty({ type: 'array', items: { type: 'string', format: 'uuid' } })
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID(undefined, { each: true })
  categories: string[];
}
