import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { MAX_CONDITIONS_PER_RULE } from '../constants';
import { CreateConditionDto } from './create-rule.dto';

export class UpdateRuleDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false, format: 'uuid' })
  @IsOptional()
  @IsString()
  resultCategoryId?: string;

  @ApiProperty({ required: false, type: () => [CreateConditionDto] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(MAX_CONDITIONS_PER_RULE)
  @ValidateNested({ each: true })
  @Type(() => CreateConditionDto)
  conditions?: CreateConditionDto[];

  @ApiProperty({ required: false, enum: ['and', 'or'] })
  @IsOptional()
  @IsString()
  conditionLogic?: 'and' | 'or';

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  order?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
