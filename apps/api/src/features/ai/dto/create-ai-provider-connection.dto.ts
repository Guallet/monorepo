import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { AiProvider } from '../entities/ai-provider.enum';

export class CreateAiProviderConnectionDto {
  @IsEnum(AiProvider)
  provider: AiProvider;

  @IsString()
  @IsNotEmpty()
  displayName: string;

  @IsString()
  @IsNotEmpty()
  apiToken: string;
}
