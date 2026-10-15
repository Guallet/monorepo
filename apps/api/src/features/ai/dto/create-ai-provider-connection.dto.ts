import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { AiProvider } from '../entities/ai-provider.enum';

export class CreateAiProviderConnectionDto {
  @ApiProperty({ enum: ['openai', 'openrouter', 'vercel_ai_gateway'] })
  @IsEnum(AiProvider)
  provider: AiProvider;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  displayName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(1024)
  apiToken: string;
}
