import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateAiAgentDto {
  @IsUUID()
  connectionId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  modelId: string;

  @IsOptional()
  @IsString()
  modelName?: string;

  @IsOptional()
  @IsString()
  customPrompt?: string;
}
