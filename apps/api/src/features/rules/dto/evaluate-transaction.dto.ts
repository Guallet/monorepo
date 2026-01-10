import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class EvaluateTransactionDto {
  @ApiProperty({
    description: 'Transaction ID',
    example: 'uuid-transaction-id',
  })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiPropertyOptional({
    description: 'Account ID',
    example: 'uuid-account-id',
  })
  @IsString()
  @IsOptional()
  accountId?: string;

  @ApiPropertyOptional({
    description: 'Transaction description',
    example: "Sainsbury's London",
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Transaction amount',
    example: -50.25,
  })
  amount: number;

  @ApiProperty({
    description: 'Transaction date',
    example: '2024-01-15',
  })
  date: string;
}

export class EvaluationResultDto {
  @ApiProperty({ description: 'Whether a rule matched' })
  matched: boolean;

  @ApiPropertyOptional({ description: 'The category ID if matched' })
  categoryId: string | null;

  @ApiPropertyOptional({ description: 'The rule ID that matched' })
  matchedRuleId: string | null;
}
