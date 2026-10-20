import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class SaveNordigenCredentialsDto {
  @ApiProperty({ minLength: 1 })
  @IsString()
  @MinLength(1)
  secretId: string;

  @ApiProperty({ minLength: 1 })
  @IsString()
  @MinLength(1)
  secretKey: string;
}

export class NordigenCredentialStatusDto {
  @ApiProperty()
  configured: boolean;

  @ApiProperty({ type: String, nullable: true })
  credentialHint: string | null;
}
