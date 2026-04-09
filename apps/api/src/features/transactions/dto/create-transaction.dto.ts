import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsDateString,
  IsUUID,
  Length,
} from 'class-validator';

export class CreateTransactionDto {
  @IsUUID()
  @IsNotEmpty()
  accountId: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsNumber()
  amount: number;

  @IsOptional()
  @IsString()
  @Length(3, 3)
  currency?: string;

  @IsDateString()
  date: string;

  @IsOptional()
  @IsUUID()
  categoryId?: string;
}
