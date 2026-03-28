---
name: create-webapp-feature
description: Scaffold a complete webapp feature in apps/webapp including TanStack Router route files, screen (container) components, and sub-components following the Guallet Mantine UI pattern. Use when adding a new page or section to the web frontend.
---

# create-webapp-feature

Creates a new feature page in the webapp with TanStack Router routes, a screen container, and presentational components.

> **Placeholders:** Replace `{Name}` with PascalCase (e.g. `Budget`), `{name}` with kebab-case (e.g. `budget`), `{names}` with plural kebab-case (e.g. `budgets`), `{domain}` with camelCase (e.g. `budget`), `{domains}` with plural camelCase (e.g. `budgets`).

## Architecture

```
Route file (thin)  →  Screen (container: hooks + logic)  →  Components (presentational)
```

- **Route files** only call `createFileRoute` and render the screen — no logic.
- **Screens** own state, hooks, navigation, and modals.
- **Components** receive props and render UI.

---

## Files to Create

```
apps/webapp/src/routes/_app/{names}/index.tsx          – list route
apps/webapp/src/routes/_app/{names}/$id.tsx            – detail route (if needed)
apps/webapp/src/features/{name}/screens/{Name}ListScreen.tsx
apps/webapp/src/features/{name}/screens/{Name}DetailScreen.tsx  (if needed)
apps/webapp/src/features/{name}/components/{Name}Row.tsx
```

> After adding route files, run `pnpm --filter webapp dev` to regenerate `routeTree.gen.ts`.
> Do **not** manually edit `routeTree.gen.ts`.

---

## 1. List Route – `routes/_app/{names}/index.tsx`

```typescript
import { createFileRoute } from '@tanstack/react-router';
import { {Name}ListScreen } from '@/features/{name}/screens/{Name}ListScreen';

export const Route = createFileRoute('/_app/{names}/')({
  component: {Name}ListPage,
});

function {Name}ListPage() {
  return <{Name}ListScreen />;
}
```

---

## 2. Detail Route – `routes/_app/{names}/$id.tsx`

```typescript
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { {Name}DetailScreen } from '@/features/{name}/screens/{Name}DetailScreen';

export const Route = createFileRoute('/_app/{names}/$id')({
  component: {Name}DetailPage,
});

function {Name}DetailPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();

  return (
    <{Name}DetailScreen
      {name}Id={id}
      onBack={() => navigate({ to: '/{names}' })}
    />
  );
}
```

---

## 3. List Screen – `features/{name}/screens/{Name}ListScreen.tsx`

```typescript
import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button, Group, Modal, Stack, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { use{Name}s, use{Name}Mutations } from '@guallet/api-react';
import { {Name}Dto } from '@guallet/api-client';
import { BaseScreen } from '@/components/Screens/BaseScreen';
import { {Name}Row } from '../components/{Name}Row';

export function {Name}ListScreen() {
  const navigate = useNavigate();
  const { {domains}, isLoading } = use{Name}s();
  const { delete{Name}Mutation } = use{Name}Mutations();

  const [itemToDelete, setItemToDelete] = useState<{Name}Dto | null>(null);

  const handleDelete = () => {
    if (!itemToDelete) return;
    delete{Name}Mutation.mutate(
      { id: itemToDelete.id },
      {
        onSuccess: () => {
          notifications.show({
            title: 'Deleted',
            message: `${itemToDelete.name} has been deleted`,
            color: 'green',
          });
          setItemToDelete(null);
        },
        onError: () => {
          notifications.show({
            title: 'Error',
            message: 'Failed to delete. Please try again.',
            color: 'red',
          });
        },
      },
    );
  };

  return (
    <BaseScreen isLoading={isLoading}>
      <Stack p="md" gap="md">
        <Group justify="space-between">
          <Text size="xl" fw={700}>{Names}</Text>
          <Button onClick={() => navigate({ to: '/{names}/new' })}>
            New {Name}
          </Button>
        </Group>

        {!isLoading && {domains}.length === 0 && (
          <Text c="dimmed" ta="center">
            No {names} yet. Create your first one!
          </Text>
        )}

        {!isLoading && {domains}.map((item) => (
          <{Name}Row
            key={item.id}
            {name}={item}
            onClick={() => navigate({ to: '/{names}/$id', params: { id: item.id } })}
            onDelete={() => setItemToDelete(item)}
          />
        ))}
      </Stack>

      <Modal
        opened={itemToDelete !== null}
        onClose={() => setItemToDelete(null)}
        title="Confirm Delete"
      >
        <Stack gap="md">
          <Text>Are you sure you want to delete "{itemToDelete?.name}"?</Text>
          <Group justify="flex-end">
            <Button variant="outline" onClick={() => setItemToDelete(null)}>
              Cancel
            </Button>
            <Button color="red" onClick={handleDelete}>
              Delete
            </Button>
          </Group>
        </Stack>
      </Modal>
    </BaseScreen>
  );
}
```

---

## 4. Detail Screen – `features/{name}/screens/{Name}DetailScreen.tsx`

```typescript
import { useNavigate } from '@tanstack/react-router';
import { Button, Group, Stack, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { use{Name} } from '@guallet/api-react';
import { BaseScreen } from '@/components/Screens/BaseScreen';

interface Props {
  {name}Id: string;
  onBack?: () => void;
}

export function {Name}DetailScreen({ {name}Id, onBack }: Readonly<Props>) {
  const navigate = useNavigate();
  const { {name}, isLoading } = use{Name}({name}Id);

  if (!isLoading && !{name}) {
    // Item not found
    return (
      <BaseScreen>
        <Text c="dimmed">Not found.</Text>
      </BaseScreen>
    );
  }

  return (
    <BaseScreen isLoading={isLoading}>
      <Stack p="md" gap="md">
        <Group>
          {onBack && <Button variant="subtle" onClick={onBack}>Back</Button>}
          <Text size="xl" fw={700}>{name?.name}</Text>
        </Group>

        {/* Add detail content here */}

        <Button
          onClick={() => navigate({ to: '/{names}/$id/edit', params: { id: {name}Id } })}
        >
          Edit
        </Button>
      </Stack>
    </BaseScreen>
  );
}
```

---

## 5. Row Component – `features/{name}/components/{Name}Row.tsx`

```typescript
import { ActionIcon, Card, Group, Text } from '@mantine/core';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import { {Name}Dto } from '@guallet/api-client';

interface Props {
  {name}: {Name}Dto;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function {Name}Row({
  {name},
  onClick,
  onEdit,
  onDelete,
}: Readonly<Props>) {
  return (
    <Card
      withBorder
      shadow="sm"
      style={onClick ? { cursor: 'pointer' } : undefined}
      onClick={onClick}
    >
      <Group justify="space-between" wrap="nowrap">
        <Text fw={500}>{name}.name}</Text>

        <Group gap="xs" onClick={(e) => e.stopPropagation()}>
          {onEdit && (
            <ActionIcon variant="subtle" onClick={onEdit}>
              <IconEdit size={16} />
            </ActionIcon>
          )}
          {onDelete && (
            <ActionIcon variant="subtle" color="red" onClick={onDelete}>
              <IconTrash size={16} />
            </ActionIcon>
          )}
        </Group>
      </Group>
    </Card>
  );
}
```

---

## Key Rules

### Import alias
`@/` resolves to `apps/webapp/src/`. Always use it for internal imports:
```typescript
import { BaseScreen } from '@/components/Screens/BaseScreen';
import { Something } from '@/features/something/...';
```

### Mantine quick reference

| Component | Use for |
|---|---|
| `Stack` | Vertical layout (default gap="md") |
| `Group` | Horizontal layout, `justify="space-between"` for spread |
| `Button` | Actions; `variant="outline"` for secondary, `color="red"` for destructive |
| `Text` | Body text; `fw={700}` for bold, `c="dimmed"` for muted, `ta="center"` to center |
| `Card` | Bordered content containers; `withBorder shadow="sm"` |
| `Modal` | Dialogs; use `useState<T | null>(null)` to control open state |
| `ActionIcon` | Icon-only buttons |
| `LoadingOverlay` | Full-screen loading; handled by `BaseScreen` via `isLoading` prop |

Use `useState<T | null>(null)` for modal state (cleaner than `useDisclosure` when you need to track which item triggered the modal).

### i18n
Wrap all user-visible strings in `t()`:
```typescript
import { useTranslation } from 'react-i18next';
const { t } = useTranslation();

// Usage:
<Text>{t('{name}.title', '{Names}')}</Text>
<Button>{t('common.delete', 'Delete')}</Button>
```
Keys are auto-extracted at build time (`pnpm --filter webapp build`). Provide a fallback string as the second argument.

### Notifications
```typescript
import { notifications } from '@mantine/notifications';

notifications.show({ title: 'Success', message: '...', color: 'green' });
notifications.show({ title: 'Error',   message: '...', color: 'red'   });
```

---

## Checklist

- [ ] Route files: thin wrappers, no logic, delegate to Screen components
- [ ] Screens: all hooks, state and navigation logic live here
- [ ] Components: `interface Props`, `Readonly<Props>`, no hooks beyond basic state
- [ ] `e.stopPropagation()` on action buttons inside clickable cards
- [ ] Ran `pnpm --filter webapp dev` after adding routes to regenerate `routeTree.gen.ts`
- [ ] All user-visible strings wrapped with `t()`
- [ ] Success/error feedback via `notifications.show()`
