import { SuggestionDto } from '../../classification/dto/classification.dto';
import { Transaction } from './transaction.entity';

export type InboxTransaction = {
  suggestion?: SuggestionDto;
  rule_id?: string;
  processed_category_id?: string;
} & Omit<Transaction, 'categoryId' | 'externalId' | 'metadata'>;
