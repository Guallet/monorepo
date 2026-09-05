import { ApiExtraModels, ApiProperty, getSchemaPath } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsEnum,
  IsUUID,
  Length,
  ValidateNested,
} from 'class-validator';
import { plainToInstance, Transform } from 'class-transformer';
import { AccountSource } from '../entities/accountSource.model.js';
import { AccountType } from '../entities/accountType.model.js';
import {
  AccountPropertiesDto,
  CreditCardPropertiesDto,
  CurrentAccountPropertiesDto,
  LoanAccountPropertiesDto,
  MortgageAccountPropertiesDto,
  PROPERTIES_DTO_MAP,
  SavingAccountPropertiesDto,
} from './account-properties.dto.js';

@ApiExtraModels(
  CurrentAccountPropertiesDto,
  CreditCardPropertiesDto,
  SavingAccountPropertiesDto,
  MortgageAccountPropertiesDto,
  LoanAccountPropertiesDto,
)
export class CreateAccountRequest {
  @ApiProperty({ description: 'The name of the account' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    required: false,
    description: 'The initial balance of the account',
    nullable: true,
  })
  @IsOptional()
  @IsNumber()
  initial_balance?: number;

  @ApiProperty({
    required: false,
    description:
      'If true, creates an initial transaction to reflect the starting balance when non-zero',
    nullable: true,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  create_balance_transaction?: boolean;

  @ApiProperty({
    description: 'The account type',
    nullable: false,
    enum: AccountType,
  })
  @IsEnum(AccountType)
  type: AccountType;

  @ApiProperty({
    required: false,
    description: 'The account origin source',
    nullable: true,
    enum: AccountSource,
  })
  @IsOptional()
  @IsEnum(AccountSource)
  source?: AccountSource;

  @ApiProperty({
    required: false,
    description: 'The account origin source name',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  source_name?: string;

  @ApiProperty({
    required: false,
    description: 'The institution id',
    nullable: true,
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  institution_id?: string;

  @ApiProperty({
    description: 'The account currency (3 letters code)',
    nullable: false,
    minLength: 3,
    maxLength: 3,
  })
  @IsString()
  @IsNotEmpty()
  @Length(3, 3)
  currency: string;

  @ApiProperty({
    required: false,
    description:
      'Optional account-type specific properties (e.g. account numbers, rates, limits, terms)',
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
    ({ value, obj }: { value: unknown; obj: CreateAccountRequest }) => {
      if (value == null) return value;
      const Cls = PROPERTIES_DTO_MAP[obj.type];
      return Cls ? plainToInstance(Cls, value) : value;
    },
  )
  properties?: AccountPropertiesDto | null;

  constructor(props: CreateAccountRequest) {
    Object.assign(this, props);
  }
}
