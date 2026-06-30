import { IsEnum, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { AiProvider } from '../entities/ai-provider.enum';

export class CreateAiProviderConnectionDto {
  @IsEnum(AiProvider)
  provider: AiProvider;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  displayName: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(1024)
  apiToken: string;
}
