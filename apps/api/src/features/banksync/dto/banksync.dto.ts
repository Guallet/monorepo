import { ApiProperty } from '@nestjs/swagger';
import { BankSyncCredential } from '../entities/banksync-credential.entity';

export class BankSyncCredentialDto {
  @ApiProperty()
  configured: boolean;

  @ApiProperty({ type: String, nullable: true })
  keyHint: string | null;

  static fromDomain(domain: BankSyncCredential | null): BankSyncCredentialDto {
    return {
      configured: domain !== null,
      keyHint: domain?.api_key_hint ?? null,
    };
  }
}

export class BankSyncJobAcceptedDto {
  @ApiProperty()
  jobId: string;
}

export class BankSyncJobStatusDto {
  @ApiProperty({ enum: ['queued', 'running', 'completed', 'failed'] })
  status: 'queued' | 'running' | 'completed' | 'failed';

  @ApiProperty({ required: false, nullable: true })
  result?: Record<string, unknown> | null;

  @ApiProperty({ type: String, required: false, nullable: true })
  error?: string | null;
}
