import { Injectable } from '@nestjs/common';
import { CredentialEncryptionService } from '../../common/crypto/credential-encryption.service';

@Injectable()
export class AiCredentialEncryptionService extends CredentialEncryptionService {}
