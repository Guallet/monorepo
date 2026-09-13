# Luna UI - React Native Components

A collection of beautiful, customizable React Native UI components for building modern mobile applications.

## Installation

```bash
npm install @luna-ui/react-native
# or
yarn add @luna-ui/react-native
```

## Quick Start

```typescript
import React from 'react';
import { View } from 'react-native';
import { Button, Text, Card } from '@luna-ui/react-native';

export default function App() {
  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Card>
        <Text variant="heading">Welcome to Luna UI</Text>
        <Text variant="body">Beautiful components for React Native</Text>
        <Button
          title="Get Started"
          onPress={() => console.log('Pressed!')}
        />
      </Card>
    </View>
  );
}
```

## Components

### Button

Customizable button component with multiple variants.

```typescript
import { Button } from '@luna-ui/react-native';

<Button
  title="Primary Button"
  variant="primary"
  size="medium"
  onPress={() => {}}
/>
```

### Text

Typography component with consistent styling.

```typescript
import { Text } from '@luna-ui/react-native';

<Text variant="heading">Heading Text</Text>
<Text variant="body">Body text content</Text>
<Text variant="caption">Caption text</Text>
```

### Card

Container component with elevation and rounded corners.

```typescript
import { Card } from '@luna-ui/react-native';

<Card elevation={2} padding={16}>
  {/* Your content here */}
</Card>
```

### Input

Form input component with validation support.

```typescript
import { Input } from '@luna-ui/react-native';

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

Custom themes can be supplied per appearance:

```typescript
import {
  DefaultTheme,
  DarkTheme,
  LunaProvider,
} from '@guallet/ui-react-native';

const customLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#007AFF',
    tabBar: {
      ...DefaultTheme.colors.tabBar,
      tint: '#007AFF',
    },
  },
};

export default function App() {
  return (
    <LunaProvider lightTheme={customLightTheme} darkTheme={DarkTheme}>
      {/* Your app content */}
    </LunaProvider>
  );
}
```

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
