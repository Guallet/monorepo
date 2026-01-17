import { IsNotEmpty, IsString, IsArray, IsOptional } from 'class-validator';
import { NordigenKey } from '../entities/nordigen-key.entity';

export class CreateNordigenKeyRequest {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  secret_id: string;

  @IsString()
  @IsNotEmpty()
  secret_key: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  account_ids?: string[];
}

export class UpdateNordigenKeyRequest {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  secret_id?: string;

  @IsString()
  @IsOptional()
  secret_key?: string;
}

export class LinkAccountsRequest {
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  account_ids: string[];
}

export class NordigenKeyDto {
  id: string;
  name: string;
  secret_id_masked: string;
  account_ids: string[];
  last_sync_at: Date | null;
  last_error_at: Date | null;
  last_error_message: string | null;

  static fromEntity(entity: NordigenKey): NordigenKeyDto {
    return {
      id: entity.id,
      name: entity.name,
      secret_id_masked: maskSecretId(entity.secret_id),
      account_ids: entity.linkedAccounts?.map((la) => la.account_id) || [],
      last_sync_at: entity.last_sync_at,
      last_error_at: entity.last_error_at,
      last_error_message: entity.last_error_message,
    };
  }
}

function maskSecretId(secretId: string): string {
  if (secretId.length <= 8) {
    return '****';
  }
  return secretId.slice(0, 4) + '****' + secretId.slice(-4);
}
