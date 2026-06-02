import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateAiProviderConnectionDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  displayName?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  apiToken?: string;
}
