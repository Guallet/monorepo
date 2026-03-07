/**
 * ResponsiveModal - Example Usage
 *
 * This file demonstrates how to use the ResponsiveModal component
 * in different scenarios.
 */

import { ResponsiveModal } from './ResponsiveModal';
import { useState } from 'react';

/**
 * Example 1: Basic Usage
 *
 * Simple modal with title and content
 */
export function BasicModalExample() {
  const [opened, setOpened] = useState(false);

  return (
    <>
      <button onClick={() => setOpened(true)} type="button">
        Open Basic Modal
      </button>
      <ResponsiveModal
        opened={opened}
        onClose={() => setOpened(false)}
        title="Welcome"
        size="md"
      >
        <div
          style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
        >
          <p>This is a responsive modal that adapts to your screen size.</p>
          <p>On mobile, it is full screen. On desktop, it is centered.</p>
          <button onClick={() => setOpened(false)} type="button">
            Close
          </button>
        </div>
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
  const [opened, setOpened] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = () => {
    // Handle form submission
    console.log('Form submitted');
    setOpened(false);
  };

  return (
    <>
      <button onClick={() => setOpened(true)} type="button">
        Open Form Modal
      </button>
      <ResponsiveModal
        opened={opened}
        onClose={() => setOpened(false)}
        title="User Information"
        size="lg"
      >
        <div
          style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
        >
          <label htmlFor="name">Name</label>
          <input
            id="name"
            onChange={(event) => setName(event.currentTarget.value)}
            placeholder="Enter your name"
            type="text"
            value={name}
          />

          <label htmlFor="email">Email</label>
          <input
            id="email"
            onChange={(event) => setEmail(event.currentTarget.value)}
            placeholder="Enter your email"
            type="email"
            value={email}
          />

          <div
            style={{
              display: 'flex',
              gap: '0.5rem',
              justifyContent: 'flex-end',
            }}
          >
            <button onClick={() => setOpened(false)} type="button">
              Cancel
            </button>
            <button onClick={handleSubmit} type="button">
              Submit
            </button>
          </div>
        </div>
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
  const [opened, setOpened] = useState(false);

  return (
    <>
      <button onClick={() => setOpened(true)} type="button">
        Open Modal (No Close Button)
      </button>
      <ResponsiveModal
        opened={opened}
        onClose={() => setOpened(false)}
        title="Confirmation Required"
        size="sm"
        withCloseButton={false}
      >
        <div
          style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
        >
          <p>Are you sure you want to proceed?</p>
          <div
            style={{
              display: 'flex',
              gap: '0.5rem',
              justifyContent: 'flex-end',
            }}
          >
            <button onClick={() => setOpened(false)} type="button">
              Cancel
            </button>
            <button onClick={() => setOpened(false)} type="button">
              Confirm
            </button>
          </div>
        </div>
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
  const [opened, setOpened] = useState(false);

  return (
    <>
      <button onClick={() => setOpened(true)} type="button">
        Open Large Modal
      </button>
      <ResponsiveModal
        opened={opened}
        onClose={() => setOpened(false)}
        title="Terms and Conditions"
        size="xl"
      >
        <div
          style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
        >
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
          <p>
            Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris
            nisi ut aliquip ex ea commodo consequat.
          </p>
          <p>
            Duis aute irure dolor in reprehenderit in voluptate velit esse
            cillum dolore eu fugiat nulla pariatur.
          </p>
          <button onClick={() => setOpened(false)} type="button">
            I Agree
          </button>
        </div>
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
  const [opened, setOpened] = useState(false);

  return (
    <>
      <button onClick={() => setOpened(true)} type="button">
        Open Custom Size Modal
      </button>
      <ResponsiveModal
        opened={opened}
        onClose={() => setOpened(false)}
        title="Custom Width Modal"
        size={600}
      >
        <div
          style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
        >
          <p>This modal has a custom width of 600px on desktop.</p>
          <p>On mobile, it still renders full screen.</p>
          <button onClick={() => setOpened(false)} type="button">
            Close
          </button>
        </div>
      </ResponsiveModal>
    </>
  );
}
