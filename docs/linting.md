# Linting

The monorepo uses Oxlint for JavaScript and TypeScript linting. The root
`.oxlintrc.json` is shared by every application and package, while each code
workspace exposes a `lint` script so Turbo can run the checks in parallel.

```bash
pnpm lint
pnpm --filter api lint
pnpm --filter webapp lint
```

Warnings fail lint runs. Prettier remains the formatter and runs separately.

## Migration notes

- ESLint, its flat configs, formatting integration, and the
  `eslint-config-custom` workspace were removed. The TanStack Query ESLint
  plugin remains as a rule package loaded by Oxlint's JavaScript-plugin bridge;
  ESLint itself is not used at runtime.
- The API keeps its previous type-aware promise and unsafe-argument checks via
  `oxlint-tsgolint`. `apps/api/tsconfig.oxlint.json` supplies a focused lint
  project, while the normal TypeScript typecheck remains a separate CI step.
- Oxlint's native React plugin replaces React Hooks, React Refresh, and React
  Compiler lint plugins. `react/set-state-in-effect` is disabled for the webapp
  and mobile app because both currently synchronize asynchronously loaded data
  into editable local state. Other React Compiler correctness checks remain on.
- Fast Refresh's `only-export-components` rule is disabled for TanStack Router
  route modules because those files intentionally colocate the exported route
  descriptor and its component. Known safe non-component exports elsewhere are
  allow-listed.
- API entity instances are intentionally spread into plain response/update
  objects, so `typescript/no-misused-spread` is disabled there. Runtime defaults
  applied after request validation also require
  `typescript/no-useless-default-assignment` to remain disabled.
- Expo's ESLint preset has no directly importable Oxlint equivalent. Mobile now
  receives the shared native TypeScript and React correctness rules.
  Expo-specific preset-only stylistic rules are not carried over; Prettier
  remains responsible for formatting.
