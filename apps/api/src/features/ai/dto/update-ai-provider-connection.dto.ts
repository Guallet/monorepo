import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateAiProviderConnectionDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  displayName?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(1024)
  apiToken?: string;
}
