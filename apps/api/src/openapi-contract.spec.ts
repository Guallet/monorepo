/* oxlint-disable typescript/no-unsafe-argument */

import { readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import ts from 'typescript';

const sourceRoot = resolve(process.cwd(), 'src');

function findTypeScriptFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return findTypeScriptFiles(path);
    return entry.isFile() && entry.name.endsWith('.ts') ? [path] : [];
  });
}

function decoratorName(
  decorator: ts.Decorator,
  sourceFile: ts.SourceFile,
): string {
  const expression = decorator.expression;
  return ts.isCallExpression(expression)
    ? expression.expression.getText(sourceFile)
    : expression.getText(sourceFile);
}

function decoratorsOf(
  node: ts.HasDecorators,
  sourceFile: ts.SourceFile,
): Map<string, ts.Decorator> {
  return new Map(
    (ts.getDecorators(node) ?? []).map((decorator) => [
      decoratorName(decorator, sourceFile),
      decorator,
    ]),
  );
}

function decoratorOptionKeys(
  decorator: ts.Decorator,
  sourceFile: ts.SourceFile,
): Set<string> {
  const expression = decorator.expression;
  if (!ts.isCallExpression(expression) || expression.arguments.length === 0) {
    return new Set();
  }
  const options = expression.arguments[0];
  if (!ts.isObjectLiteralExpression(options)) return new Set();
  return new Set(
    options.properties.flatMap((property) => {
      if (!ts.isPropertyAssignment(property)) return [];
      return [property.name.getText(sourceFile)];
    }),
  );
}

function isPrimitivePropertyType(type: ts.TypeNode): boolean {
  return /^(string|number|boolean)(\|null)?$/.test(
    type.getText().replace(/\s+/g, ''),
  );
}

describe('explicit OpenAPI contracts', () => {
  it('does not configure Swagger compiler metadata', () => {
    const nestConfig = JSON.parse(
      readFileSync(resolve(process.cwd(), 'nest-cli.json'), 'utf8'),
    ) as { compilerOptions?: { plugins?: unknown } };

    expect(nestConfig.compilerOptions?.plugins).toBeUndefined();
    expect(() =>
      readFileSync(resolve(process.cwd(), 'src/metadata.ts'), 'utf8'),
    ).toThrow();
  });

  it('gives every DTO class property an explicit schema when needed', () => {
    const failures: string[] = [];
    const dtoFiles = findTypeScriptFiles(sourceRoot).filter(
      (file) => file.includes('/dto/') || file.endsWith('.dto.ts'),
    );

    for (const file of dtoFiles) {
      if (file.endsWith('.spec.ts')) continue;
      const sourceFile = ts.createSourceFile(
        file,
        readFileSync(file, 'utf8'),
        ts.ScriptTarget.Latest,
        true,
        ts.ScriptKind.TS,
      );

      for (const statement of sourceFile.statements) {
        if (!ts.isClassDeclaration(statement)) continue;
        for (const member of statement.members) {
          if (!ts.isPropertyDeclaration(member) || !member.name) continue;
          const decorators = decoratorsOf(member, sourceFile);
          const apiProperty = decorators.get('ApiProperty');
          const propertyName = `${statement.name?.text}.${member.name.getText(sourceFile)}`;

          if (!apiProperty) {
            failures.push(
              `${file}: ${propertyName} has no API property decorator`,
            );
            continue;
          }
          const isPrimitive = member.type
            ? isPrimitivePropertyType(member.type)
            : false;
          if (
            !isPrimitive &&
            ![...decoratorOptionKeys(apiProperty, sourceFile)].some((key) =>
              ['type', 'enum', 'oneOf', 'allOf', 'schema'].includes(key),
            )
          ) {
            failures.push(
              `${file}: ${propertyName} relies on reflected type metadata`,
            );
          }
          if (
            isPrimitive &&
            decoratorOptionKeys(apiProperty, sourceFile).has('type') &&
            ts.isCallExpression(apiProperty.expression) &&
            apiProperty.expression.arguments[0]
              ?.getText(sourceFile)
              .match(/type\s*:\s*(String|Number|Boolean)\b/)
          ) {
            failures.push(
              `${file}: ${propertyName} redundantly declares a primitive type`,
            );
          }
          if (
            member.questionToken &&
            !decoratorOptionKeys(apiProperty, sourceFile).has('required')
          ) {
            failures.push(
              `${file}: ${propertyName} is optional but documented as required`,
            );
          }
        }
      }
    }

    expect(failures).toEqual([]);
  });

  it('gives every controller route an explicit operation contract', () => {
    const failures: string[] = [];
    const controllerFiles = findTypeScriptFiles(sourceRoot).filter((file) =>
      file.endsWith('.controller.ts'),
    );

    for (const file of controllerFiles) {
      const sourceFile = ts.createSourceFile(
        file,
        readFileSync(file, 'utf8'),
        ts.ScriptTarget.Latest,
        true,
        ts.ScriptKind.TS,
      );

      for (const statement of sourceFile.statements) {
        if (!ts.isClassDeclaration(statement)) continue;
        for (const member of statement.members) {
          if (!ts.isMethodDeclaration(member)) continue;
          const decorators = decoratorsOf(member, sourceFile);
          const route = ['Get', 'Post', 'Put', 'Patch', 'Delete'].find((name) =>
            decorators.has(name),
          );
          if (!route) continue;
          const operation = `${statement.name?.text}.${member.name.getText(sourceFile)}`;

          if (!decorators.has('ApiOperation')) {
            failures.push(`${file}: ${operation} has no ApiOperation`);
          }
          if (
            ![...decorators.keys()].some((name) => /^Api.*Response$/.test(name))
          ) {
            failures.push(`${file}: ${operation} has no explicit response`);
          } else if (
            member.type &&
            !member.type.getText(sourceFile).includes('void') &&
            [...decorators.entries()].filter(
              ([name]) =>
                /^Api.*Response$/.test(name) && name !== 'ApiNoContentResponse',
            ).length > 0 &&
            ![...decorators.entries()]
              .filter(
                ([name]) =>
                  /^Api.*Response$/.test(name) &&
                  name !== 'ApiNoContentResponse',
              )
              .some(([, decorator]) =>
                [...decoratorOptionKeys(decorator, sourceFile)].some((key) =>
                  ['type', 'schema', 'content'].includes(key),
                ),
              )
          ) {
            failures.push(
              `${file}: ${operation} has no explicit response schema`,
            );
          }

          for (const parameter of member.parameters) {
            const parameterDecorators = decoratorsOf(parameter, sourceFile);
            for (const [nestDecorator, apiDecorator] of [
              ['Body', 'ApiBody'],
              ['Param', 'ApiParam'],
              ['Query', 'ApiQuery'],
            ] as const) {
              if (
                parameterDecorators.has(nestDecorator) &&
                !decorators.has(apiDecorator)
              ) {
                failures.push(
                  `${file}: ${operation} has ${nestDecorator} without ${apiDecorator}`,
                );
              }
            }
          }
        }
      }
    }

    expect(failures).toEqual([]);
  });

  it('does not use Swagger mapped types', () => {
    const mappedTypeUsage = findTypeScriptFiles(sourceRoot).filter((file) => {
      if (file.endsWith('.spec.ts')) return false;
      return /\b(PartialType|OmitType|PickType|IntersectionType)\b/.test(
        readFileSync(file, 'utf8'),
      );
    });

    expect(mappedTypeUsage).toEqual([]);
  });
});
