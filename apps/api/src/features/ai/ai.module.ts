import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from 'src/features/accounts/entities/account.entity';
import { Budget } from 'src/features/budgets/entities/budget.entity';
import { RegularPayment } from 'src/features/regular-payments/entities/regular-payment.entity';
import { SavingGoal } from 'src/features/saving-goals/entities/saving-goal.entity';
import { Transaction } from 'src/features/transactions/entities/transaction.entity';
import { AiChatController } from './ai-chat.controller';
import { AiChatRetentionService } from './ai-chat-retention.service';
import { AiChatService } from './ai-chat.service';
import { AiController } from './ai.controller';
import { AiCredentialEncryptionService } from './ai-credential-encryption.service';
import { AiFinancialContextService } from './ai-financial-context.service';
import { AiService } from './ai.service';
import { AiAgent } from './entities/ai-agent.entity';
import { AiChatMessage } from './entities/ai-chat-message.entity';
import { AiChatSession } from './entities/ai-chat-session.entity';
import { AiProviderConnection } from './entities/ai-provider-connection.entity';
import { AiProviderRegistryService } from './providers/ai-provider-registry.service';

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
