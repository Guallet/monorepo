import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayNotEmpty,
  ArrayUnique,
  IsArray,
  IsDefined,
  IsObject,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import {
  BANK_PROVIDER_IDS,
  BankProviderId,
} from '../providers/bank-provider.interface';

export class BankCredentialsDto {
  @ApiProperty({ required: false, maxLength: 4096 })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(4096)
  apiKey?: string;
  @ApiProperty({ required: false, maxLength: 4096 })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(4096)
  secretId?: string;
  @ApiProperty({ required: false, maxLength: 4096 })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(4096)
  secretKey?: string;
}
export class CreateBankConnectionDto {
  @ApiProperty({ enum: BANK_PROVIDER_IDS })
  @IsIn(BANK_PROVIDER_IDS)
  providerId: BankProviderId;
  @ApiProperty({ type: () => BankCredentialsDto })
  @IsDefined()
  @IsObject()
  @ValidateNested()
  @Type(() => BankCredentialsDto)
  credentials: BankCredentialsDto;
}
export class ReplaceBankCredentialsDto {
  @ApiProperty({ type: () => BankCredentialsDto })
  @IsDefined()
  @IsObject()
  @ValidateNested()
  @Type(() => BankCredentialsDto)
  credentials: BankCredentialsDto;
}
export class ImportBankAccountsDto {
  @ApiProperty({ type: [String], maxItems: 100 })
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @ArrayMaxSize(100)
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  @MaxLength(1024, { each: true })
  accountIds: string[];
}
export class AuthorizeBankDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  institutionId: string;
  @ApiProperty({
    format: 'uri',
    description: 'A callback URL on a configured frontend origin',
  })
  @IsUrl({
    require_tld: false,
    protocols: ['http', 'https'],
    require_protocol: true,
  })
  @MaxLength(2048)
  redirectUrl: string;
}
export class BankCredentialFieldDto {
  @ApiProperty({ enum: ['apiKey', 'secretId', 'secretKey'] })
  name: 'apiKey' | 'secretId' | 'secretKey';
  @ApiProperty()
  secret: boolean;
}
export class BankProviderDto {
  @ApiProperty({ enum: BANK_PROVIDER_IDS })
  id: BankProviderId;
  @ApiProperty()
  name: string;
  @ApiProperty({ type: () => [BankCredentialFieldDto] })
  credentialFields: BankCredentialFieldDto[];
  @ApiProperty()
  supportsBankAuthorization: boolean;
  @ApiProperty({ type: [String], required: false })
  authorizationCountries?: string[];
}
export class BankConnectionDto {
  @ApiProperty({ format: 'uuid' })
  id: string;
  @ApiProperty({ enum: BANK_PROVIDER_IDS })
  providerId: BankProviderId;
  @ApiProperty({ enum: ['configured'] })
  status: 'configured';
  @ApiProperty({ type: String, nullable: true })
  credentialHint: string | null;
  @ApiProperty({ type: String, format: 'date-time', nullable: true })
  accountsRefreshedAt: Date | null;
  @ApiProperty({ type: String, format: 'date-time', nullable: true })
  lastSyncedAt: Date | null;
}
export class BankAccountDto {
  @ApiProperty({
    description:
      'Opaque account ID; return it unchanged when importing or unlinking',
  })
  id: string;
  @ApiProperty()
  name: string;
  @ApiProperty({ type: String, nullable: true })
  institutionName: string | null;
  @ApiProperty({ type: String, nullable: true, required: false })
  institutionLogo?: string | null;
  @ApiProperty({ type: String, nullable: true })
  currency: string | null;
  @ApiProperty({ type: String, nullable: true, required: false })
  balance?: string | null;
  @ApiProperty({ required: false })
  status?: string;
  @ApiProperty({ type: String, nullable: true, format: 'uuid' })
  linkedAccountId: string | null;
}
export class BankAccountsDto {
  @ApiProperty({ type: () => [BankAccountDto] })
  accounts: BankAccountDto[];
  @ApiProperty({ type: String, format: 'date-time', nullable: true })
  refreshedAt: Date | null;
}
export class BankJobAcceptedDto {
  @ApiProperty({ format: 'uuid' })
  jobId: string;
}
export class BankJobResultDto {
  @ApiProperty({ required: false })
  accountsDiscovered?: number;
  @ApiProperty({ required: false, type: [String] })
  accountIds?: string[];
  @ApiProperty({ required: false })
  accountsSynced?: number;
  @ApiProperty({ required: false, type: [String] })
  errors?: string[];
}
export class BankJobStatusDto {
  @ApiProperty({ enum: ['queued', 'running', 'completed', 'failed'] })
  status: 'queued' | 'running' | 'completed' | 'failed';
  @ApiProperty({ enum: ['refresh', 'import', 'sync'] })
  operation: 'refresh' | 'import' | 'sync';
  @ApiProperty({ required: false, type: () => BankJobResultDto })
  result?: BankJobResultDto;
  @ApiProperty({ required: false })
  error?: string;
}
export class BankInstitutionDto {
  @ApiProperty()
  id: string;
  @ApiProperty()
  name: string;
  @ApiProperty({ type: String, nullable: true })
  logo: string | null;
}
export class BankAuthorizationDto {
  @ApiProperty({ format: 'uuid' })
  id: string;
  @ApiProperty({ enum: ['redirect'] })
  action: 'redirect';
  @ApiProperty({ format: 'uri' })
  redirectUrl: string;
}
