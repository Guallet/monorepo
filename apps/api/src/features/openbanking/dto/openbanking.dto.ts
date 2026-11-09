import type {
  BankConnectionDetails,
  BankAccounts,
  BankAuthorizationResult,
} from '../models/openbanking.model';
import type {
  BankJobAccepted,
  BankJobResult,
  BankJobStatus,
} from '../openbanking.jobs';
import type {
  BankProviderDefinition,
  ProviderCredentialField,
  ProviderAccount,
  ProviderInstitution,
} from '../providers/bank-provider.interface';
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
  BankProvider,
} from '../providers/bank-provider.interface';

export class BankCredentialsRequestDto {
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

export class CreateBankConnectionRequestDto {
  @ApiProperty({ enum: BANK_PROVIDER_IDS })
  @IsIn(BANK_PROVIDER_IDS)
  providerId: BankProvider;

  @ApiProperty({ type: () => BankCredentialsRequestDto })
  @IsDefined()
  @IsObject()
  @ValidateNested()
  @Type(() => BankCredentialsRequestDto)
  credentials: BankCredentialsRequestDto;
}

export class ReplaceBankCredentialsRequestDto {
  @ApiProperty({ type: () => BankCredentialsRequestDto })
  @IsDefined()
  @IsObject()
  @ValidateNested()
  @Type(() => BankCredentialsRequestDto)
  credentials: BankCredentialsRequestDto;
}

export class ImportBankAccountsRequestDto {
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

export class AuthorizeBankRequestDto {
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

  static fromDomain(field: ProviderCredentialField): BankCredentialFieldDto {
    const dto = new BankCredentialFieldDto();
    dto.name = field.name;
    dto.secret = field.secret;
    return dto;
  }
}

export class BankProviderDto {
  @ApiProperty({ enum: BANK_PROVIDER_IDS })
  id: BankProvider;

  @ApiProperty()
  name: string;
  @ApiProperty({ type: () => [BankCredentialFieldDto] })
  credentialFields: BankCredentialFieldDto[];

  @ApiProperty()
  supportsBankAuthorization: boolean;

  @ApiProperty({
    type: [String],
    description: 'Supported bank countries as ISO 3166-1 alpha-2 codes',
  })
  supportedCountries: string[];

  static fromDomain(provider: BankProviderDefinition): BankProviderDto {
    const dto = new BankProviderDto();
    dto.id = provider.id;
    dto.name = provider.name;
    dto.credentialFields = provider.credentialFields.map((field) =>
      BankCredentialFieldDto.fromDomain(field),
    );
    dto.supportsBankAuthorization = provider.supportsBankAuthorization;
    dto.supportedCountries = [...provider.supportedCountries];
    return dto;
  }
}

export class BankConnectionDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ enum: BANK_PROVIDER_IDS })
  providerId: BankProvider;

  @ApiProperty({ enum: ['configured'] })
  status: 'configured';

  @ApiProperty({ type: String, nullable: true })
  credentialHint: string | null;

  @ApiProperty({ type: String, format: 'date-time', nullable: true })
  accountsRefreshedAt: Date | null;

  @ApiProperty({ type: String, format: 'date-time', nullable: true })
  lastSyncedAt: Date | null;

  static fromDomain(details: BankConnectionDetails): BankConnectionDto {
    const dto = new BankConnectionDto();
    dto.id = details.connection.id;
    dto.providerId = details.connection.provider_id;
    dto.status = 'configured';
    dto.credentialHint = details.credentialHint;
    dto.accountsRefreshedAt = details.connection.accounts_refreshed_at ?? null;
    dto.lastSyncedAt = details.connection.last_synced_at ?? null;
    return dto;
  }
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

  static fromDomain(account: ProviderAccount): BankAccountDto {
    const dto = new BankAccountDto();
    dto.id = account.id;
    dto.name = account.name;
    dto.institutionName = account.institutionName;
    dto.currency = account.currency;
    dto.linkedAccountId = account.linkedAccountId;
    if (account.institutionLogo !== undefined)
      dto.institutionLogo = account.institutionLogo;
    if (account.balance !== undefined) dto.balance = account.balance;
    if (account.status !== undefined) dto.status = account.status;
    return dto;
  }
}

export class BankAccountsDto {
  @ApiProperty({ type: () => [BankAccountDto] })
  accounts: BankAccountDto[];

  @ApiProperty({ type: String, format: 'date-time', nullable: true })
  refreshedAt: Date | null;

  static fromDomain(accounts: BankAccounts): BankAccountsDto {
    const dto = new BankAccountsDto();
    dto.accounts = accounts.accounts.map((value) =>
      BankAccountDto.fromDomain(value),
    );
    dto.refreshedAt = accounts.refreshedAt;
    return dto;
  }
}

export class BankJobAcceptedDto {
  @ApiProperty({ format: 'uuid' })
  jobId: string;

  static fromDomain(job: BankJobAccepted): BankJobAcceptedDto {
    const dto = new BankJobAcceptedDto();
    dto.jobId = job.jobId;
    return dto;
  }
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

  static fromDomain(result: BankJobResult): BankJobResultDto {
    const dto = new BankJobResultDto();
    if (result.accountsDiscovered !== undefined)
      dto.accountsDiscovered = result.accountsDiscovered;
    if (result.accountsSynced !== undefined)
      dto.accountsSynced = result.accountsSynced;
    if (result.accountIds !== undefined)
      dto.accountIds = [...result.accountIds];
    if (result.errors !== undefined) dto.errors = [...result.errors];
    return dto;
  }
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

  static fromDomain(job: BankJobStatus): BankJobStatusDto {
    const dto = new BankJobStatusDto();
    dto.status = job.status;
    dto.operation = job.operation;
    if (job.status === 'completed' && job.result)
      dto.result = BankJobResultDto.fromDomain(job.result);
    if (job.status === 'failed') {
      dto.error =
        'The operation failed. Check your provider connection and try again.';
    }
    return dto;
  }
}

export class BankInstitutionDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ type: String, nullable: true })
  logo: string | null;

  static fromDomain(institution: ProviderInstitution): BankInstitutionDto {
    const dto = new BankInstitutionDto();
    dto.id = institution.id;
    dto.name = institution.name;
    dto.logo = institution.logo;
    return dto;
  }
}

export class BankAuthorizationDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ enum: ['redirect'] })
  action: 'redirect';

  @ApiProperty({ format: 'uri' })
  redirectUrl: string;

  static fromDomain(
    authorization: BankAuthorizationResult,
  ): BankAuthorizationDto {
    const dto = new BankAuthorizationDto();
    dto.id = authorization.id;
    dto.action = authorization.action;
    dto.redirectUrl = authorization.redirectUrl;
    return dto;
  }
}
