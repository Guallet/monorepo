import 'reflect-metadata';
import { globSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { Type } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { SchemaObject } from '@nestjs/swagger';
import ts from 'typescript';
import { CsvImportRequestDto } from '../features/data-importer/dto/csv-import-request.dto';

const files = globSync('../features/**/*.dto.ts', { cwd: __dirname });
files.push('../features/reports/dto/report-query-filter.ts');

async function schemasFor(models: Type<unknown>[]) {
  const module = await Test.createTestingModule({}).compile();
  const app = module.createNestApplication();
  try {
    return SwaggerModule.createDocument(
      app,
      new DocumentBuilder().setTitle('DTO schemas').setVersion('1').build(),
      { extraModels: models },
    ).components?.schemas as Record<string, SchemaObject>;
  } finally {
    await app.close();
  }
}

// Inspect the generated schemas as well as declarations: decorator presence alone
// does not prevent nullable unions from becoming objects or dangling references.
describe('API DTO OpenAPI contracts', () => {
  let schemas: Record<string, SchemaObject>;

  beforeAll(async () => {
    const modules: Record<string, unknown>[] = await Promise.all(
      files.map((file) => import(resolve(__dirname, file))),
    );
    const models = modules.flatMap((exports) =>
      Object.values(exports).filter(
        (value): value is Type<unknown> =>
          typeof value === 'function' &&
          Reflect.hasMetadata(
            'swagger/apiModelPropertiesArray',
            value.prototype as object,
          ),
      ),
    );
    schemas = await schemasFor(models);
  });

  for (const file of files) {
    const source = ts.createSourceFile(
      file,
      readFileSync(resolve(__dirname, file), 'utf8'),
      ts.ScriptTarget.Latest,
      true,
    );
    for (const declaration of source.statements) {
      if (!ts.isClassDeclaration(declaration) || !declaration.name) continue;
      const name = declaration.name.text;
      for (const member of declaration.members) {
        if (!ts.isPropertyDeclaration(member) || !member.type) continue;
        const property = member.name.getText(source);
        const typeNode = member.type;
        const type = typeNode.getText(source);
        it(`${name}.${property} is documented with its declared shape`, () => {
          const decorators = ts.getDecorators(member) ?? [];
          expect(
            decorators.some((decorator) =>
              decorator.expression.getText(source).startsWith('ApiProperty('),
            ),
          ).toBe(true);
          const schema = schemas[name];
          expect(schema).toBeDefined();
          const field = schema.properties?.[property] as SchemaObject;
          expect(field).toBeDefined();
          for (const decorator of decorators) {
            if (!ts.isCallExpression(decorator.expression)) continue;
            const validator = decorator.expression.expression.getText(source);
            if (validator === 'IsEnum') {
              expect(field.enum?.length).toBeGreaterThan(0);
            }
            if (validator === 'IsDateString') {
              expect(field.type).toBe('string');
              expect(field.format).toBeUndefined();
            }
            const formats: Record<string, string> = {
              IsUUID: 'uuid',
              IsEmail: 'email',
              IsUrl: 'uri',
            };
            if (formats[validator]) {
              const target = ts.isArrayTypeNode(typeNode)
                ? (field.items as SchemaObject)
                : field;
              expect(target.format).toBe(formats[validator]);
            }
          }
          if (member.questionToken) {
            expect(schema.required ?? []).not.toContain(property);
          }
          if (type.includes('| null')) {
            expect(field.nullable).toBe(true);
          }
          const primitive = /^(string|number|boolean)(?: \| null)?$/.exec(type);
          if (primitive && !field.enum) {
            expect(field.type).toBe(primitive[1]);
          }
          if (ts.isArrayTypeNode(typeNode)) {
            expect(field.type).toBe('array');
            expect(field.items).toBeDefined();
          }
          if (type === 'Date') {
            expect(field.type).toBe('string');
            expect(['date', 'date-time']).toContain(field.format);
          }
        });
      }
    }
  }

  it('registers all referenced schemas, including standalone CSV mappings', async () => {
    const csvSchemas = await schemasFor([CsvImportRequestDto]);
    function checkReferences(
      value: unknown,
      available: Record<string, SchemaObject>,
    ) {
      if (!value || typeof value !== 'object') return;
      for (const [key, child] of Object.entries(value)) {
        if (key === '$ref' && typeof child === 'string') {
          expect(
            available[child.replace('#/components/schemas/', '')],
          ).toBeDefined();
        } else {
          checkReferences(child, available);
        }
      }
    }
    checkReferences(schemas, schemas);
    checkReferences(csvSchemas, csvSchemas);
  });
});
