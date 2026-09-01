import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateAiProviderConnectionDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  displayName?: string;

  @ApiProperty({ required: false, writeOnly: true })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(1024)
  apiToken?: string;
}
