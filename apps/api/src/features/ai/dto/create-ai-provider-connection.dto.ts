import { IsEnum, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { AiProvider } from '../entities/ai-provider.enum.js';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAiProviderConnectionDto {
  @ApiProperty({ enum: AiProvider })
  @IsEnum(AiProvider)
  provider: AiProvider;

  @ApiProperty({ maxLength: 100 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  displayName: string;

  @ApiProperty({ writeOnly: true, maxLength: 1024 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1024)
  apiToken: string;
}
