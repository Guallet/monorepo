import { IsNotEmpty, IsString } from 'class-validator';
import { User } from '../entities/user.entity';

export class NordigenCredentialsRequest {
  @IsString()
  @IsNotEmpty()
  secret_id: string;

  @IsString()
  @IsNotEmpty()
  secret_key: string;
}

export class NordigenCredentialsDto {
  has_credentials: boolean;
  secret_id_masked: string | null;

  static fromDomain(user: User): NordigenCredentialsDto {
    const hasCredentials = !!(
      user.nordigen_secret_id && user.nordigen_secret_key
    );
    return {
      has_credentials: hasCredentials,
      secret_id_masked: hasCredentials
        ? maskSecretId(user.nordigen_secret_id)
        : null,
    };
  }
}

function maskSecretId(secretId: string): string {
  if (secretId.length <= 8) {
    return '****';
  }
  return secretId.slice(0, 4) + '****' + secretId.slice(-4);
}
