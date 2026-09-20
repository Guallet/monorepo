# Luna UI

Guallet's React Native component library and controlled category icon set.

## Installation

```bash
npm install @guallet/luna-mobile
# or
yarn add @guallet/luna-mobile
```

## Quick Start

```typescript
import React from 'react';
import { View } from 'react-native';
import { Button, Text, Card } from '@guallet/luna-mobile';

export default function App() {
  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Card>
        <Text variant="heading">Welcome to Luna UI</Text>
        <Text variant="body">Beautiful components for React Native</Text>
        <Button onClick={() => console.log('Pressed!')}>Get Started</Button>
      </Card>
    </View>
  );
}
```

## Icons

Luna UI exposes the same category icon API on web and React Native. Use named
icons for static UI and `CategoryIcon` for persisted icon names:

```typescript
import {
  CategoryIcon,
  MoneyIcon,
  type CategoryIconName,
} from '@guallet/luna-mobile/icons';

const savedIcon: CategoryIconName = 'IconCash';

<MoneyIcon />;
<CategoryIcon name={savedIcon} />;
```

Unknown values fall back to `QuestionMarkIcon`. The supported names are
exported as the `categoryIconNames` contract.

## Components

### Button

Customizable button component with multiple variants.

```typescript
import { Button } from '@guallet/luna-mobile';

<Button variant="primary" onClick={() => {}}>
  Primary Button
</Button>
```

### Text

Typography component with consistent styling.

```typescript
import { Text } from '@guallet/luna-mobile';

<Text variant="heading">Heading Text</Text>
<Text variant="body">Body text content</Text>
<Text variant="caption">Caption text</Text>
```

### Card

Container component with elevation and rounded corners.

```typescript
import { Card } from '@guallet/luna-mobile';

<Card elevation={2} padding={16}>
  {/* Your content here */}
</Card>
```

### Input

Form input component with validation support.

```typescript
import { Input } from '@guallet/luna-mobile';

<Input
  placeholder="Enter your email"
  value={email}
  onChangeText={setEmail}
  keyboardType="email-address"
/>
```

## Theming

`@guallet/theme` is the single source of truth for the typed design-token
contract and its default light/dark values. This package owns appearance
selection: `LunaProvider` follows the system appearance and `useTheme()` always
returns the active theme. Navigation tokens are available at
`colors.tabBar.tint`, `colors.tabBar.inactiveTint`, `colors.tabBar.background`,
and `colors.tabBar.border`.

Color tokens are grouped by purpose so components can use the appropriate
semantic level:

```typescript
const { colors } = useTheme();

colors.text.primary;
colors.surface.background.primary;
colors.button.primary.default;
colors.button.primary.hover;
colors.button.primary.pressed;
colors.button.primary.focus;
colors.button.primary.selected;
colors.button.primary.disabled;
colors.status.error;
```

Button intents expose the same state shape across light and dark themes:
`default`, `hover`, `pressed`, `focus`, `selected`, and `disabled`. Native
buttons consume `pressed`, `focus`, `selected`, and `disabled` directly.

`LunaProvider` accepts partial nested overrides. Unspecified tokens retain the
active light or dark defaults, so you only need to provide the tokens you want
to change:

```typescript
const theme = {
  colors: {
    text: {
      primary: '#111827',
    },
  },
};
```

Custom themes can be supplied per appearance:

```typescript
import { LunaProvider } from '@guallet/luna-mobile';

const sharedTheme = {
  colors: {
    accent: {
      primary: '#007AFF',
    },
  },
};

const lightTheme = {
  colors: {
    text: { primary: '#111827' },
  },
};

const darkTheme = {
  colors: {
    text: { primary: '#F9FAFB' },
  },
};

export default function App() {
  return (
    <LunaProvider
      theme={sharedTheme}
      lightTheme={lightTheme}
      darkTheme={darkTheme}
    />
  );
}
```

The generic `theme` override is applied to both appearances first, followed by
the matching `lightTheme` or `darkTheme` override. Appearance-specific values
therefore take precedence over shared values. The reusable
`GualletThemeOverrides` type and `mergeTheme` utility are exported from
`@guallet/theme`.

## Development

### Prerequisites

- Node.js 16+
- React Native development environment
- iOS/Android development tools

### Setup

```bash
# Install dependencies
npm install

# iOS
cd ios && pod install && cd ..

# Run on iOS
npm run ios

# Run on Android
npm run android
```

### Building

```bash
# Build the package
npm run build

# Run tests
npm test

# Run linting
npm run lint
```

## API Reference

For detailed API documentation, visit our [documentation site](https://luna-ui.dev/react-native).

## Contributing

We welcome contributions! Please see our [Contributing Guide](../../CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## License

Apache-2.0 © [Guallet](https://github.com/guallet)

## Support

- 📖 [Documentation](https://luna-ui.dev)
- 🐛 [Issue Tracker](https://github.com/guallet/monorepo/issues)
- 💬 [Discussions](https://github.com/guallet/monorepo/discussions)
