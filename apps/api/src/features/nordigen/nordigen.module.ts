import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { NordigenService } from './nordigen.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NordigenToken } from './entities/nordigen-token.entity';
import { NordigenRepository } from './nordigen.repository';
import { NordigenCredentials } from './entities/nordigen-credentials.entity';
import { NordigenController } from './nordigen.controller';
import { AiCredentialEncryptionService } from 'src/features/ai/ai-credential-encryption.service';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([NordigenToken, NordigenCredentials]),
  ],
  controllers: [NordigenController],
  providers: [
    NordigenService,
    NordigenRepository,
    AiCredentialEncryptionService,
  ],
  exports: [NordigenService, NordigenRepository],
})
export class NordigenModule {}
