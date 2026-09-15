# Guallet UI React

## Theming

`GualletThemeProvider` accepts a partial nested theme override. Unspecified
tokens retain their defaults, so consumers only need to provide the values they
want to change:

```tsx
import { GualletThemeProvider } from '@guallet/ui-react';

const theme = {
  colors: {
    text: {
      primary: '#111827',
    },
    surface: {
      background: {
        page: '#F9FAFB',
      },
    },
  },
};

export default function App() {
  return (
    <GualletThemeProvider theme={theme}>
      {/* Your app content */}
    </GualletThemeProvider>
  );
}
```

The shared `GualletThemeOverrides` type and `mergeTheme` utility are exported
from `@guallet/theme` for consumers that need to resolve themes themselves.
