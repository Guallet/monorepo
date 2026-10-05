import { Account } from '../features/accounts/entities/account.entity';
import { AiAgent } from '../features/ai/entities/ai-agent.entity';
import { AiChatMessage } from '../features/ai/entities/ai-chat-message.entity';
import { AiChatSession } from '../features/ai/entities/ai-chat-session.entity';
import { AiProviderConnection } from '../features/ai/entities/ai-provider-connection.entity';
import { Budget } from '../features/budgets/entities/budget.entity';
import { Category } from '../features/categories/entities/category.entity';
import { Institution } from '../features/institutions/entities/institution.entity';
import { NordigenToken } from '../features/nordigen/entities/nordigen-token.entity';
import { Notification } from '../features/notifications/entities/notification.entity';
import { ObConnection } from '../features/openbanking/entities/connection.entity';
import { NordigenAccount } from '../features/openbanking/entities/nordigen-account.entity';
import { RegularPayment } from '../features/regular-payments/entities/regular-payment.entity';
import {
  CategorizationRule,
  RuleCondition,
} from '../features/rules/entities/categorization-rule.entity';
import { SavingGoal } from '../features/saving-goals/entities/saving-goal.entity';
import { Transaction } from '../features/transactions/entities/transaction.entity';
import { User } from '../features/users/entities/user.entity';

export const databaseEntities = [
  Account,
  AiAgent,
  AiChatMessage,
  AiChatSession,
  AiProviderConnection,
  Budget,
  Category,
  Institution,
  NordigenToken,
  Notification,
  ObConnection,
  NordigenAccount,
  RegularPayment,
  CategorizationRule,
  RuleCondition,
  SavingGoal,
  Transaction,
  User,
];
