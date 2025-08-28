export default {
  locales: ["en", "es"], // Add your supported locales here
  output: "public/locales/$LOCALE/$NAMESPACE.json", // Output path for the translation files
  defaultNamespace: "translation",
  createOldCatalogs: false, // Save previous translations to the \_old files
  keepRemoved: [/feature.accounts.accountType.*/], // Keep removed keys in the translation files
  lexers: {
    js: ["JsxLexer"], // Use JsxLexer for JavaScript files
    ts: ["JsxLexer"], // Use JsxLexer for TypeScript files
    jsx: ["JsxLexer"], // Use JsxLexer for JSX files
    tsx: ["JsxLexer"], // Use JsxLexer for TSX files
    default: ["JsxLexer"], // Fallback lexer
  },
  // Add more options as needed
};
