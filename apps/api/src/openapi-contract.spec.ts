import { Body, Controller, Post } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import {
  DocumentBuilder,
  type OpenAPIObject,
  type SchemaObject,
  SwaggerModule,
} from '@nestjs/swagger';
import { CreateAccountRequest } from './features/accounts/dto/create-account-request.dto.js';
import { CreateAiAgentDto } from './features/ai/dto/create-ai-agent.dto.js';
import { CreateAiProviderConnectionDto } from './features/ai/dto/create-ai-provider-connection.dto.js';
import { UpdateAiProviderConnectionDto } from './features/ai/dto/update-ai-provider-connection.dto.js';
import { DataImportRequestDto } from './features/data-importer/dto/data-import-request.dto.js';
import { ConnectBankInstitutionRequestDto } from './features/openbanking/dto/connect-account-request.dto.js';
import { ConnectAccountsRequestDto } from './features/openbanking/dto/connect-bank-request.dto.js';
import { CreateRegularPaymentDto } from './features/regular-payments/dto/create-regular-payment.dto.js';
import { CreateRuleDto } from './features/rules/dto/create-rule.dto.js';
import {
  ReorderConditionsDto,
  ReorderRulesDto,
} from './features/rules/dto/reorder-rules.dto.js';
import { CreateSavingGoalDto } from './features/saving-goals/dto/create-saving-goal.dto.js';

@Controller('_openapi-contract')
class OpenApiContractTestController {
  @Post('account')
  account(@Body() _dto: CreateAccountRequest): void {}

  @Post('agent')
  agent(@Body() _dto: CreateAiAgentDto): void {}

  @Post('provider')
  provider(@Body() _dto: CreateAiProviderConnectionDto): void {}

  @Post('provider-update')
  providerUpdate(@Body() _dto: UpdateAiProviderConnectionDto): void {}

  @Post('import')
  dataImport(@Body() _dto: DataImportRequestDto): void {}

  @Post('connection')
  connection(@Body() _dto: ConnectBankInstitutionRequestDto): void {}

  @Post('connect-accounts')
  connectAccounts(@Body() _dto: ConnectAccountsRequestDto): void {}

  @Post('payment')
  payment(@Body() _dto: CreateRegularPaymentDto): void {}

  @Post('rule')
  rule(@Body() _dto: CreateRuleDto): void {}

  @Post('reorder-rules')
  reorderRules(@Body() _dto: ReorderRulesDto): void {}

  @Post('reorder-conditions')
  reorderConditions(@Body() _dto: ReorderConditionsDto): void {}

  @Post('saving-goal')
  savingGoal(@Body() _dto: CreateSavingGoalDto): void {}
}

function getSchema(document: OpenAPIObject, name: string): SchemaObject {
  const schema = document.components?.schemas?.[name];
  if (schema === undefined || '$ref' in schema) {
    throw new Error(`Schema ${name} was not generated inline`);
  }
  return schema;
}

function getProperty(
  document: OpenAPIObject,
  schemaName: string,
  propertyName: string,
): SchemaObject {
  const property = getSchema(document, schemaName).properties?.[propertyName];
  if (property === undefined || '$ref' in property) {
    throw new Error(`Property ${schemaName}.${propertyName} was not generated`);
  }
  return property;
}

describe('OpenAPI validation contract', () => {
  let document: OpenAPIObject;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [OpenApiContractTestController],
    }).compile();
    const app = moduleRef.createNestApplication();
    await app.init();
    document = SwaggerModule.createDocument(
      app,
      new DocumentBuilder().setTitle('Contract test').build(),
    );
    await app.close();
  });

  it('documents string and URL restrictions', () => {
    expect(getProperty(document, 'CreateAccountRequest', 'currency')).toEqual(
      expect.objectContaining({ minLength: 3, maxLength: 3 }),
    );
    expect(
      getProperty(document, 'CreateAccountRequest', 'institution_id'),
    ).toEqual(expect.objectContaining({ format: 'uuid' }));
    expect(getProperty(document, 'CreateAiAgentDto', 'name')).toEqual(
      expect.objectContaining({ maxLength: 100 }),
    );
    expect(
      getProperty(document, 'CreateAiProviderConnectionDto', 'apiToken'),
    ).toEqual(expect.objectContaining({ maxLength: 1024, writeOnly: true }));
    expect(
      getProperty(document, 'UpdateAiProviderConnectionDto', 'apiToken'),
    ).toEqual(expect.objectContaining({ maxLength: 1024, writeOnly: true }));
    expect(
      getProperty(document, 'ConnectBankInstitutionRequestDto', 'redirect_to'),
    ).toEqual(expect.objectContaining({ format: 'uri' }));
    expect(
      getProperty(document, 'DataImportRequestDto', 'jsonContent'),
    ).toEqual(expect.objectContaining({ maxLength: 10 * 1024 * 1024 }));
  });

  it('documents numeric and array restrictions', () => {
    expect(getProperty(document, 'CreateRegularPaymentDto', 'amount')).toEqual(
      expect.objectContaining({ minimum: 0, exclusiveMinimum: true }),
    );
    expect(
      getProperty(document, 'CreateSavingGoalDto', 'targetAmount'),
    ).toEqual(expect.objectContaining({ minimum: 0 }));
    expect(getProperty(document, 'CreateSavingGoalDto', 'accounts')).toEqual(
      expect.objectContaining({ minItems: 1 }),
    );
    expect(
      getProperty(document, 'ConnectAccountsRequestDto', 'account_ids'),
    ).toEqual(expect.objectContaining({ minItems: 1 }));
    expect(getProperty(document, 'CreateRuleDto', 'conditions')).toEqual(
      expect.objectContaining({ maxItems: 50 }),
    );
    expect(getProperty(document, 'ReorderRulesDto', 'ruleIds')).toEqual(
      expect.objectContaining({ maxItems: 1000 }),
    );
    expect(
      getProperty(document, 'ReorderConditionsDto', 'conditionIds'),
    ).toEqual(expect.objectContaining({ maxItems: 50 }));
  });
});
