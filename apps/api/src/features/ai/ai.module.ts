import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiController } from './ai.controller';
import { AiCredentialEncryptionService } from './ai-credential-encryption.service';
import { AiService } from './ai.service';
import { AiAgent } from './entities/ai-agent.entity';
import { AiProviderConnection } from './entities/ai-provider-connection.entity';
import { AiProviderRegistryService } from './providers/ai-provider-registry.service';

@Module({
  imports: [TypeOrmModule.forFeature([AiProviderConnection, AiAgent])],
  controllers: [AiController],
  providers: [
    AiService,
    AiCredentialEncryptionService,
    AiProviderRegistryService,
  ],
})
export class AiModule {}
