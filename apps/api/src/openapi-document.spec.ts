import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import {
  DocumentBuilder,
  OperationObject,
  SwaggerModule,
} from '@nestjs/swagger';
import { AdminController } from './admin/admin.controller';
import { AccountsController } from './features/accounts/accounts.controller';
import { AiChatController } from './features/ai/ai-chat.controller';
import { AiController } from './features/ai/ai.controller';
import { BudgetsController } from './features/budgets/budgets.controller';
import { CategoriesController } from './features/categories/categories.controller';
import { DataExporterController } from './features/data-exporter/data-exporter.controller';
import { DataImporterController } from './features/data-importer/data-importer.controller';
import { InstitutionsController } from './features/institutions/institutions.controller';
import { NotificationsController } from './features/notifications/notifications.controller';
import { ObAccountsController } from './features/openbanking/ObAccounts.controller';
import { ObConnectionsController } from './features/openbanking/ObConnections.controller';
import { ObASyncController } from './features/openbanking/ObSync.controller';
import { RegularPaymentsController } from './features/regular-payments/regular-payments.controller';
import { ReportsController } from './features/reports/reports.controller';
import { RulesController } from './features/rules/rules.controller';
import { SavingGoalsController } from './features/saving-goals/saving-goals.controller';
import { TransactionsController } from './features/transactions/transactions.controller';
import { UsersController } from './features/users/users.controller';

const controllers = [
  AdminController,
  AccountsController,
  AiChatController,
  AiController,
  BudgetsController,
  CategoriesController,
  DataExporterController,
  DataImporterController,
  InstitutionsController,
  NotificationsController,
  ObAccountsController,
  ObConnectionsController,
  ObASyncController,
  RegularPaymentsController,
  ReportsController,
  RulesController,
  SavingGoalsController,
  TransactionsController,
  UsersController,
];

describe('generated OpenAPI document', () => {
  let app: INestApplication;

  afterEach(async () => {
    await app?.close();
  });

  it('contains explicit schemas for every documented operation', async () => {
    const module = await Test.createTestingModule({ controllers })
      .useMocker(() => ({}))
      .compile();
    app = module.createNestApplication();

    const config = new DocumentBuilder()
      .setTitle('Guallet API')
      .setVersion('test')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    const operations = Object.values(document.paths).flatMap((path) =>
      Object.values(path).filter(
        (operation): operation is OperationObject =>
          operation !== undefined && 'responses' in operation,
      ),
    );

    expect(Object.keys(document.paths).length).toBeGreaterThan(40);
    expect(operations.length).toBeGreaterThan(70);
    for (const operation of operations) {
      expect(operation.operationId).toBeTruthy();
      expect(Object.keys(operation.responses ?? {}).length).toBeGreaterThan(0);
    }

    const schemas = Object.entries(document.components?.schemas ?? {});
    expect(schemas.length).toBeGreaterThan(35);
    const emptySchemas = schemas
      .filter(([, schema]) => {
        if ('$ref' in schema) return false;
        return Object.keys(schema.properties ?? {}).length === 0;
      })
      .map(([name]) => name);
    expect(emptySchemas).toEqual([]);
  });
});
