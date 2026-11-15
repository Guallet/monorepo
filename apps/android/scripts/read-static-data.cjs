const ts = require('typescript');

/** Read only the data literal; never evaluate the TypeScript module. */
function readStaticData(source) {
  const file = ts.createSourceFile(
    'data.ts',
    source,
    ts.ScriptTarget.Latest,
    true,
  );
  if (file.parseDiagnostics.length) throw new Error('Invalid currency dataset');
  const declarations = file.statements
    .filter(ts.isVariableStatement)
    .flatMap((statement) => statement.declarationList.declarations)
    .filter(
      (declaration) =>
        ts.isIdentifier(declaration.name) && declaration.name.text === 'json',
    );
  if (declarations.length !== 1 || !declarations[0].initializer)
    throw new Error('Expected one json data declaration');
  function literal(node) {
    if (ts.isStringLiteral(node)) return node.text;
    if (ts.isNumericLiteral(node)) return Number(node.text);
    if (node.kind === ts.SyntaxKind.NullKeyword) return null;
    if (node.kind === ts.SyntaxKind.TrueKeyword) return true;
    if (node.kind === ts.SyntaxKind.FalseKeyword) return false;
    if (ts.isArrayLiteralExpression(node)) return node.elements.map(literal);
    if (ts.isObjectLiteralExpression(node)) {
      return Object.fromEntries(
        node.properties.map((property) => {
          if (
            !ts.isPropertyAssignment(property) ||
            !(
              ts.isIdentifier(property.name) ||
              ts.isStringLiteral(property.name)
            )
          )
            throw new Error('Only static dataset properties are allowed');
          return [property.name.text, literal(property.initializer)];
        }),
      );
    }
    throw new Error('Only static dataset literals are allowed');
  }
  return literal(declarations[0].initializer);
}
module.exports = { readStaticData };
