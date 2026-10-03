import { ApiExtraModels, ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { plainToInstance, Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  ValidateNested,
} from 'class-validator';
import { AccountType } from '../entities/accountType.model';
import {
  AccountPropertiesDto,
  CreditCardPropertiesDto,
  CurrentAccountPropertiesDto,
  LoanAccountPropertiesDto,
  MortgageAccountPropertiesDto,
  PROPERTIES_DTO_MAP,
  SavingAccountPropertiesDto,
} from './account-properties.dto';

@ApiExtraModels(
  CurrentAccountPropertiesDto,
  CreditCardPropertiesDto,
  SavingAccountPropertiesDto,
  MortgageAccountPropertiesDto,
  LoanAccountPropertiesDto,
)
export class UpdateAccountRequest {
  @ApiProperty({ description: 'The name of the account' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ enum: AccountType, description: 'The account type' })
  @IsEnum(AccountType)
  type: AccountType;

  @ApiProperty({
    minLength: 3,
    maxLength: 3,
    description: 'The account currency (3 letter code)',
  })
  @IsString()
  @IsNotEmpty()
  @Length(3, 3)
  currency: string;

  @ApiProperty({
    required: false,
    nullable: true,
    oneOf: [
      { $ref: getSchemaPath(CurrentAccountPropertiesDto) },
      { $ref: getSchemaPath(CreditCardPropertiesDto) },
      { $ref: getSchemaPath(SavingAccountPropertiesDto) },
      { $ref: getSchemaPath(MortgageAccountPropertiesDto) },
      { $ref: getSchemaPath(LoanAccountPropertiesDto) },
    ],
  })
  @IsOptional()
  @ValidateNested()
  @Transform(
    ({ value, obj }: { value: unknown; obj: UpdateAccountRequest }) => {
      if (value == null) return value;
      const Cls = PROPERTIES_DTO_MAP[obj.type];
      return Cls ? plainToInstance(Cls, value) : value;
    },
  )
  properties?: AccountPropertiesDto | null;

  @ApiProperty({
    required: false,
    description: 'The new balance of the account',
    nullable: true,
  })
  @IsOptional()
  @IsNumber()
  balance?: number;

  @ApiProperty({
    required: false,
    description: 'Whether to create a transaction for the balance change',
    default: false,
    nullable: true,
  })
  @IsOptional()
  @IsBoolean()
  create_balance_transaction?: boolean;
}
