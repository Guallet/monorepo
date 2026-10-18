import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { CredentialEncryptionService } from 'src/common/crypto/credential-encryption.service';
import { RulesModule } from '../rules/rules.module';
import { DecisionConnection } from './entities/decision-connection.entity';
import { TransactionSuggestion } from './entities/transaction-suggestion.entity';
import { ClassificationWork } from './entities/classification-work.entity';
import { ClassificationState } from './entities/classification-state.entity';
import {
  ClassificationController,
  DecisionConnectionsController,
} from './classification.controller';
import { ClassificationService } from './classification.service';
import { DecisionConnectionsService } from './decision-connections.service';
import {
  ClassificationDispatcher,
  ClassificationProcessor,
} from './classification.processor';
import {
  ClassificationLimitsModule,
  CLASSIFICATION_QUEUE,
} from './classification-limits.service';
import { JevClient } from './jev-client.service';
import { SafeHttpClient } from './http/safe-http-client';
@Module({
  imports: [
    ClassificationLimitsModule,
    TypeOrmModule.forFeature([
      DecisionConnection,
      TransactionSuggestion,
      ClassificationWork,
      ClassificationState,
    ]),
    RulesModule,
    BullModule.registerQueue({ name: CLASSIFICATION_QUEUE }),
  ],
  providers: [
    ClassificationService,
    DecisionConnectionsService,
    CredentialEncryptionService,
    ClassificationDispatcher,
    ClassificationProcessor,
    JevClient,
    SafeHttpClient,
  ],
  controllers: [ClassificationController, DecisionConnectionsController],
})
export class ClassificationModule {}
