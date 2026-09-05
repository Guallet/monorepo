import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAiAgentDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  connectionId: string;

  @ApiProperty({ maxLength: 100 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({ maxLength: 200 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  modelId: string;

  @ApiProperty({ required: false, maxLength: 200 })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  modelName?: string;

  @ApiProperty({ required: false, maxLength: 10000 })
  @IsOptional()
  @IsString()
  @MaxLength(10000)
  customPrompt?: string;
}
