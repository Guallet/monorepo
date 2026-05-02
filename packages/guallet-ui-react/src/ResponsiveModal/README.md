# ResponsiveModal Component

A reusable modal component built on top of **Mantine's Modal** that automatically adapts to different screen sizes.

## Features

✨ **Responsive Behavior**

- **Mobile devices** (≤ 50em / 800px): Full-screen modal with optimized padding
- **Desktop/Tablet**: Centered modal with configurable size

🎯 **Built with Mantine**

- Leverages Mantine's Modal component
- Fully compatible with Mantine's theme system
- Uses Mantine hooks for responsive detection

♿ **Accessible by Default**

- Focus trap enabled
- ESC key to close
- Overlay click to close
- ARIA attributes from Mantine

## Installation

This component is part of the `@guallet/ui-react` package:

```bash
# Already included in the monorepo
import { ResponsiveModal } from '@guallet/ui-react';
```

## Basic Usage

```tsx
import { ResponsiveModal } from '@guallet/ui-react';
import { useDisclosure } from '@mantine/hooks';
import { Button } from '@mantine/core';

function MyComponent() {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      <Button onClick={open}>Open Modal</Button>

      <ResponsiveModal
        opened={opened}
        onClose={close}
        title="My Modal"
        size="md"
      >
        <p>This modal adapts to your screen size!</p>
      </ResponsiveModal>
    </>
  );
}
```

## Props

| Prop              | Type               | Default      | Description                                                                |
| ----------------- | ------------------ | ------------ | -------------------------------------------------------------------------- |
| `opened`          | `boolean`          | **required** | Controls whether the modal is visible                                      |
| `onClose`         | `() => void`       | **required** | Callback fired when modal should close                                     |
| `title`           | `React.ReactNode`  | `undefined`  | Modal title (can be string or JSX)                                         |
| `children`        | `React.ReactNode`  | **required** | Modal content                                                              |
| `size`            | `string \| number` | `"md"`       | Modal size on desktop (e.g., "xs", "sm", "md", "lg", "xl", or pixel value) |
| `withCloseButton` | `boolean`          | `true`       | Whether to show the close button                                           |

## Responsive Behavior

### Mobile (≤ 50em / 800px)

```tsx
{
  fullScreen: true,
  radius: 0,
  padding: "md"
}
```

### Desktop/Tablet (> 50em / 800px)

```tsx
{
  fullScreen: false,
  size: size,      // Your specified size
  centered: true
}
```

## Examples

### Example 1: Simple Confirmation Dialog

```tsx
import { ResponsiveModal } from '@guallet/ui-react';
import { useDisclosure } from '@mantine/hooks';
import { Button, Stack, Group } from '@mantine/core';

function ConfirmDialog() {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      <Button onClick={open}>Delete Item</Button>

      <ResponsiveModal
        opened={opened}
        onClose={close}
        title="Confirm Deletion"
        size="sm"
      >
        <Stack>
          <p>Are you sure you want to delete this item?</p>
          <Group justify="flex-end">
            <Button variant="outline" onClick={close}>
              Cancel
            </Button>
            <Button color="red" onClick={close}>
              Delete
            </Button>
          </Group>
        </Stack>
      </ResponsiveModal>
    </>
  );
}
```

### Example 2: Form Modal

```tsx
import { ResponsiveModal } from '@guallet/ui-react';
import { useDisclosure } from '@mantine/hooks';
import { Button, TextInput, Stack } from '@mantine/core';

function UserForm() {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      <Button onClick={open}>Add User</Button>

      <ResponsiveModal
        opened={opened}
        onClose={close}
        title="Create New User"
        size="lg"
      >
        <Stack>
          <TextInput label="Name" placeholder="Enter name" />
          <TextInput label="Email" placeholder="Enter email" />
          <Button onClick={close}>Submit</Button>
        </Stack>
      </ResponsiveModal>
    </>
  );
}
```

### Example 3: Custom Size

```tsx
<ResponsiveModal
  opened={opened}
  onClose={close}
  title="Custom Width"
  size={600} // 600px on desktop
>
  <p>This modal is 600px wide on desktop</p>
</ResponsiveModal>
```

### Example 4: No Close Button

```tsx
<ResponsiveModal
  opened={opened}
  onClose={close}
  title="Important Notice"
  withCloseButton={false}
>
  <Stack>
    <p>You must choose an option to continue</p>
    <Group>
      <Button onClick={close}>Accept</Button>
      <Button variant="outline" onClick={close}>
        Decline
      </Button>
    </Group>
  </Stack>
</ResponsiveModal>
```

## Using the `useIsMobile` Hook

The `useIsMobile` hook is also exported and can be used independently:

```tsx
import { useIsMobile } from '@guallet/ui-react';

function MyComponent() {
  const isMobile = useIsMobile();

  return <div>{isMobile ? <MobileLayout /> : <DesktopLayout />}</div>;
}
```

## Best Practices

1. **Always use `useDisclosure`** for managing modal state:

   ```tsx
   const [opened, { open, close }] = useDisclosure(false);
   ```

2. **Provide meaningful titles** for accessibility:

   ```tsx
   <ResponsiveModal title="Edit Profile" ...>
   ```

3. **Keep modal content focused** - avoid cramming too much content:

   ```tsx
   // Good: Focused content
   <ResponsiveModal title="Add Comment">
     <TextInput />
     <Button>Submit</Button>
   </ResponsiveModal>
   ```

4. **For complex forms**, consider using larger sizes on desktop:

   ```tsx
   <ResponsiveModal size="xl" ...>
     <ComplexForm />
   </ResponsiveModal>
   ```

5. **Always provide a way to close** the modal (either close button or action buttons):
   ```tsx
   <ResponsiveModal withCloseButton={false} ...>
     <Button onClick={close}>Done</Button>
   </ResponsiveModal>
   ```

## Implementation Details

The component internally uses the `useIsMobile` hook to detect viewport size and conditionally applies different props to Mantine's Modal component:

- **Mobile**: Full-screen experience with no border radius
- **Desktop**: Centered modal with the specified size

All other Mantine Modal features (focus trap, overlay, transitions, etc.) work as expected.

## See Also

- [Mantine Modal Documentation](https://mantine.dev/core/modal/)
- [Mantine useDisclosure Hook](https://mantine.dev/hooks/use-disclosure/)
- [Mantine useMediaQuery Hook](https://mantine.dev/hooks/use-media-query/)

## Contributing

When adding new features or fixing bugs, please ensure:

1. The component maintains backward compatibility
2. Examples are updated if the API changes
3. The documentation reflects the changes
4. The component works on both mobile and desktop viewports
