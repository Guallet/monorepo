/**
 * ResponsiveModal - Example Usage
 * 
 * This file demonstrates how to use the ResponsiveModal component
 * in different scenarios.
 */

import { ResponsiveModal } from './ResponsiveModal';
import { useDisclosure } from '@mantine/hooks';
import { Button, Stack, Text, Group, TextInput } from '@mantine/core';

/**
 * Example 1: Basic Usage
 * 
 * Simple modal with title and content
 */
export function BasicModalExample() {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      <Button onClick={open}>Open Basic Modal</Button>
      <ResponsiveModal
        opened={opened}
        onClose={close}
        title="Welcome"
        size="md"
      >
        <Stack>
          <Text>This is a responsive modal that adapts to your screen size.</Text>
          <Text>On mobile, it will be full screen. On desktop, it will be centered.</Text>
          <Button onClick={close}>Close</Button>
        </Stack>
      </ResponsiveModal>
    </>
  );
}

/**
 * Example 2: Form Modal
 * 
 * Modal containing a form with multiple fields
 */
export function FormModalExample() {
  const [opened, { open, close }] = useDisclosure(false);

  const handleSubmit = () => {
    // Handle form submission
    console.log('Form submitted');
    close();
  };

  return (
    <>
      <Button onClick={open}>Open Form Modal</Button>
      <ResponsiveModal
        opened={opened}
        onClose={close}
        title="User Information"
        size="lg"
      >
        <Stack>
          <TextInput label="Name" placeholder="Enter your name" />
          <TextInput label="Email" placeholder="Enter your email" type="email" />
          
          <Group justify="flex-end">
            <Button variant="outline" onClick={close}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              Submit
            </Button>
          </Group>
        </Stack>
      </ResponsiveModal>
    </>
  );
}

/**
 * Example 3: No Close Button
 * 
 * Modal without a close button (must use action buttons)
 */
export function NoCloseButtonExample() {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      <Button onClick={open}>Open Modal (No Close Button)</Button>
      <ResponsiveModal
        opened={opened}
        onClose={close}
        title="Confirmation Required"
        size="sm"
        withCloseButton={false}
      >
        <Stack>
          <Text>Are you sure you want to proceed?</Text>
          <Group justify="flex-end">
            <Button variant="outline" onClick={close}>
              Cancel
            </Button>
            <Button color="red" onClick={close}>
              Confirm
            </Button>
          </Group>
        </Stack>
      </ResponsiveModal>
    </>
  );
}

/**
 * Example 4: Large Content Modal
 * 
 * Modal with scrollable content
 */
export function LargeContentExample() {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      <Button onClick={open}>Open Large Modal</Button>
      <ResponsiveModal
        opened={opened}
        onClose={close}
        title="Terms and Conditions"
        size="xl"
      >
        <Stack>
          <Text>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
            Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </Text>
          <Text>
            Ut enim ad minim veniam, quis nostrud exercitation ullamco 
            laboris nisi ut aliquip ex ea commodo consequat.
          </Text>
          <Text>
            Duis aute irure dolor in reprehenderit in voluptate velit 
            esse cillum dolore eu fugiat nulla pariatur.
          </Text>
          <Button onClick={close}>I Agree</Button>
        </Stack>
      </ResponsiveModal>
    </>
  );
}

/**
 * Example 5: Custom Size
 * 
 * Modal with custom pixel width
 */
export function CustomSizeExample() {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      <Button onClick={open}>Open Custom Size Modal</Button>
      <ResponsiveModal
        opened={opened}
        onClose={close}
        title="Custom Width Modal"
        size={600}
      >
        <Stack>
          <Text>This modal has a custom width of 600px on desktop.</Text>
          <Text>On mobile, it will still be full screen.</Text>
          <Button onClick={close}>Close</Button>
        </Stack>
      </ResponsiveModal>
    </>
  );
}
