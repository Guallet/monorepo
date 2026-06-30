import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateAiAgentDto {
  @IsUUID()
  connectionId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  modelId: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  modelName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10000)
  customPrompt?: string;
}
