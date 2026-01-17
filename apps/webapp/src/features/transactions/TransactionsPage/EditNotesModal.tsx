import React, { useState } from 'react';
import { Button, TextInput, Group, Stack } from '@mantine/core';

interface IProps {
  notes: string;
  onSave: (notes: string) => void;
  onCancel: () => void;
}

export function EditNotesModal({ notes, onSave, onCancel }: Readonly<IProps>) {
  const [inputText, setInputText] = useState(notes);

  return (
    <Stack>
      <TextInput
        placeholder="Edit notes"
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
      />
      <Group>
        <Button
          onClick={() => {
            onSave(inputText);
          }}
        >
          Save
        </Button>
        <Button
          color="red"
          onClick={() => {
            onCancel();
          }}
        >
          Cancel
        </Button>
      </Group>
    </Stack>
  );
}
