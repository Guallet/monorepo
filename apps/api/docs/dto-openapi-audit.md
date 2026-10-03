# API DTO OpenAPI audit

Base: `origin/develop` at `afab71d0`, fetched on 2026-10-03.

## Scope

Reviewed all 63 DTO source files: 105 classes and 473 declared properties across
16 features. This includes `ReportQueryFilter`, DTOs nested inside other DTOs,
request DTOs, response DTOs, and Nordigen transport DTOs. Inspected the other
files in DTO directories for additional API models; the Nordigen `Money` helper
is an internal calculation class, and Zod schemas and type aliases have no
runtime class properties to decorate.

| Feature          | Files | Classes | Properties |
| ---------------- | ----: | ------: | ---------: |
| Accounts         |     5 |      13 |         52 |
| AI               |    11 |      11 |         52 |
| Budgets          |     3 |       3 |         20 |
| Categories       |     3 |       3 |         13 |
| Data exporter    |     2 |       2 |          5 |
| Data importer    |     4 |       7 |         32 |
| Institutions     |     3 |       3 |         10 |
| Nordigen         |     5 |      15 |         73 |
| Notifications    |     2 |       2 |          8 |
| Open banking     |     3 |      12 |         41 |
| Regular payments |     3 |       3 |         26 |
| Reports          |     2 |       4 |         17 |
| Rules            |     6 |       9 |         39 |
| Saving goals     |     3 |       3 |         24 |
| Transactions     |     4 |       8 |         44 |
| Users            |     4 |       7 |         17 |
| Total            |    63 |     105 |        473 |

## Findings and changes

All declared DTO properties already had `@ApiProperty`. All properties declared
with `?` already had `required: false`. Arrays, enums, nested DTOs, date objects,
and nullable fields already had the relevant schema options, except for the
following gaps.

### Nullable primitive types

Added explicit `type: String` or `type: Number` to 25 properties. TypeScript
reflects a nullable union as `Object`; `nullable: true` alone does not tell Swagger
that the serialized value is a string or number.

| DTO                           | Properties                    |
| ----------------------------- | ----------------------------- |
| `CurrentAccountPropertiesDto` | `overdraft`                   |
| `AccountDto`                  | `institutionId`               |
| `AiAgentDto`                  | `modelName`, `customPrompt`   |
| `AiProviderConnectionDto`     | `tokenHint`                   |
| `CategoryDto`                 | `icon`, `colour`, `parentId`  |
| `CreateCategoryDto`           | `parentId`                    |
| `UpdateCategoryDto`           | `parentId`                    |
| `NordigenTransactionDto`      | `additionalInformation`       |
| `NotificationDto`             | `icon`, `action`              |
| `CategoryDataRowDto`          | `categoryId`                  |
| `RuleEvaluationResultDto`     | `categoryId`, `matchedRuleId` |
| `RuleDto`                     | `description`                 |
| `SavingGoalDto`               | `daysRemaining`               |
| `InboxTransactionDto`         | `notes`                       |
| `TransactionDto`              | `notes`, `categoryId`         |
| `UpdateTransactionDto`        | `notes`, `categoryId`         |
| `UserCurrenciesSettingsDto`   | `default_currency`            |
| `UserDto`                     | `profile_src`                 |

Nullable fields with enum schemas already derive their primitive type from their
enum values. Nullable nested DTOs and account-property unions already specify a
model type or `oneOf` references.

### Validator-backed formats

Added eight missing formats to existing `@ApiProperty` decorators. Each is backed
by a validator already present on the field.

| DTO                                | Property       | Format      |
| ---------------------------------- | -------------- | ----------- |
| `CreateAiAgentDto`                 | `connectionId` | `uuid`      |
| `CreateAiChatSessionDto`           | `agentId`      | `uuid`      |
| `CreateInstitutionRequest`         | `image_src`    | `uri`       |
| `ConnectBankInstitutionRequestDto` | `redirect_to`  | `uri`       |
| `CreateRegularPaymentDto`          | `categoryId`   | `uuid`      |
| `CreateRegularPaymentDto`          | `startDate`    | `date-time` |
| `CreateSavingGoalDto`              | `targetDate`   | `date-time` |
| `CreateTransactionDto`             | `date`         | `date-time` |

Existing `date` formats remain valid for date-only fields. `IsDateString` accepts
ISO date strings; the added `date-time` metadata follows the existing update DTO
conventions. Documentation decorators do not change accepted input values.

### CSV mapping references

Added `@ApiExtraModels(AccountMapping, CategoryMapping)` to `CsvImportRequestDto`
and used `getSchemaPath` for its mapping references. Its mapping classes are
now declared before the request class so the class decorator can reference their
runtime constructors. A standalone CSV schema now registers its referenced
mapping schemas without relying on `DataImportRequestDto` to register them.

### Optional field declarations

Optional API DTO fields use `field?: T` without `| null`. Removed the nullable
union from 10 existing optional fields, including account properties, category
references, transaction notes, Nordigen additional information, and user date
format. Required nullable response fields retain `T | null`.

Request validation still follows the existing decorators: `@IsOptional()` skips
validation for both missing values and `null`. Request schema nullability remains
where it documents that accepted input.

Response mappers normalize null account institution/properties, transaction
category, and user date format to `undefined`, so these four optional fields are
omitted from serialized JSON. Their response schemas and corresponding API client
types reflect omission rather than null. Client optional inbox rule/category
fields also match their existing API DTO declarations.

## Verification

`src/openapi/dto-schemas.spec.ts` generates an OpenAPI document from all DTO
classes without loading application services or connecting to a database. It
checks every declared property for decorator presence and generated schema
coverage, optionality, nullable primitive types, arrays, date objects, enum
validators, UUID/email/URL/date validators, and resolved schema references.
A separate document generated from only `CsvImportRequestDto` catches mapping
registration regressions that registering every DTO together would conceal.

Run the audit with:

```bash
pnpm --filter api exec vitest run src/openapi/dto-schemas.spec.ts --maxWorkers=1
```

The suite contains 474 checks: one per property and one reference-integrity check.

Validation results:

- Full API suite: 57 test files and 1,071 tests passed with one worker.
- Focused TypeScript check of all DTOs and the audit tests: passed using a
  temporary configuration extending the API configuration, with a 384 MB Node
  heap limit.
- API client and React query package TypeScript checks: passed.
- Type-aware API Oxlint: passed with one thread and a bounded Go memory target.
- Repository-wide `pnpm lint --concurrency=1`: passed.
- Oxfmt on changed files and `git diff --check`: passed.
- Full `pnpm --filter api typecheck`: could not complete within this environment's
  available memory; attempts were killed or reached a bounded Node heap limit.

## Boundaries

This audit concerns DTO OpenAPI metadata. Controller-operation coverage and
runtime validation policy are separate concerns. Existing intentionally open
schemas, such as normalized transaction query metadata and CSV row dictionaries,
retain their existing shape. No Swagger compiler plugin or generated metadata
was introduced. Request validation remains unchanged; optional response fields
and corresponding client types follow the omission convention described above.
