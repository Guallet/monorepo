import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from '../../features/accounts/entities/account.entity.js';
import { Budget } from '../../features/budgets/entities/budget.entity.js';
import { RegularPayment } from '../../features/regular-payments/entities/regular-payment.entity.js';
import { SavingGoal } from '../../features/saving-goals/entities/saving-goal.entity.js';
import { Transaction } from '../../features/transactions/entities/transaction.entity.js';
import { AiChatController } from './ai-chat.controller.js';
import { AiChatRetentionService } from './ai-chat-retention.service.js';
import { AiChatService } from './ai-chat.service.js';
import { AiController } from './ai.controller.js';
import { AiCredentialEncryptionService } from './ai-credential-encryption.service.js';
import { AiFinancialContextService } from './ai-financial-context.service.js';
import { AiService } from './ai.service.js';
import { AiAgent } from './entities/ai-agent.entity.js';
import { AiChatMessage } from './entities/ai-chat-message.entity.js';
import { AiChatSession } from './entities/ai-chat-session.entity.js';
import { AiProviderConnection } from './entities/ai-provider-connection.entity.js';
import { AiProviderRegistryService } from './providers/ai-provider-registry.service.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AiProviderConnection,
      AiAgent,
      AiChatSession,
      AiChatMessage,
      Account,
      Transaction,
      Budget,
      SavingGoal,
      RegularPayment,
    ]),
  ],
  controllers: [AiController, AiChatController],
  providers: [
    AiService,
    AiChatService,
    AiChatRetentionService,
    AiCredentialEncryptionService,
    AiFinancialContextService,
    AiProviderRegistryService,
  ],
})
export class AiModule {}
