import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Category } from './models/Category';
import { useMemo, useState } from 'react';

interface Props {
  category: Category | null;
  onSave: (data: CategoryFormData) => void;
  onUpdate: (category: Category, data: CategoryFormData) => void;
  onCancel: () => void;
  onDelete: (category: Category) => void;
}

export type CategoryFormData = {
  name: string;
  icon: string;
  colour: string;
  parentId: string | null;
};

const colourSwatches = [
  '#25262b',
  '#868e96',
  '#fa5252',
  '#e64980',
  '#be4bdb',
  '#7950f2',
  '#4c6ef5',
  '#228be6',
  '#15aabf',
  '#12b886',
  '#40c057',
  '#82c91e',
  '#fab005',
  '#fd7e14',
];

function normalizeHexColour(value: string): string {
  return /^#[0-9a-fA-F]{6}$/.test(value) ? value : '#25262b';
}

export function CategoriesDetailsModal({
  category,
  onSave,
  onUpdate,
  onCancel,
  onDelete,
}: Readonly<Props>) {
  const [name, setName] = useState(category?.name ?? '');
  const [nameError, setNameError] = useState(false);

  const [icon, setIcon] = useState(category?.icon ?? '');
  const [iconError, setIconError] = useState(false);

  const [colour, setColour] = useState(category?.colour ?? '');
  const [colourError, setColourError] = useState(false);

  function save() {
    // Validate form
    if (validateForm()) {
      const formData: CategoryFormData = {
        name: name ?? '',
        icon: icon ?? '',
        colour: colour,
        parentId: category?.parentId ?? null,
      };
      if (category) {
        onUpdate(category, formData);
      } else {
        onSave(formData);
      }
    } else {
      // Show error
    }
  }

  function validateForm(): boolean {
    const nameError = name.length === 0;
    const iconError = icon.length === 0;
    const colourError = colour.length === 0;

    setNameError(nameError);
    setIconError(iconError);
    setColourError(colourError);

    return !nameError && !iconError && !colourError;
  }

  const isFormValid = useMemo(() => {
    return name.length > 0 && icon.length > 0 && colour.length > 0;
  }, [name, icon, colour]);

  return (
    <div className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="category-details-name">Name</Label>
        <Input
          id="category-details-name"
          placeholder="Enter the name of the category"
          value={name}
          onChange={(event) => setName(event.currentTarget.value)}
        />
        {nameError && <p className="text-sm text-destructive">Invalid name</p>}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="category-details-icon">Icon</Label>
        <Input
          id="category-details-icon"
          placeholder="Select the category icon"
          value={icon}
          onChange={(event) => setIcon(event.currentTarget.value)}
        />
        {iconError && <p className="text-sm text-destructive">Invalid icon</p>}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="category-details-colour">Colour</Label>
        <Input
          id="category-details-colour"
          type="color"
          value={normalizeHexColour(colour)}
          onChange={(event) => {
            setColour(event.currentTarget.value);
          }}
          className="h-10 w-20 cursor-pointer p-1"
        />
        <div className="flex flex-wrap gap-2">
          {colourSwatches.map((swatch) => (
            <button
              key={swatch}
              type="button"
              aria-label={`Select colour ${swatch}`}
              className="h-5 w-5 rounded-full border"
              style={{ backgroundColor: swatch }}
              onClick={() => {
                setColour(swatch);
              }}
            />
          ))}
        </div>
        {colourError && (
          <p className="text-sm text-destructive">Invalid selected colour</p>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button onClick={save} disabled={!isFormValid}>
          {category ? 'Update' : 'Create'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            onCancel();
          }}
        >
          Cancel
        </Button>
        {category && (
          <Button
            type="button"
            variant="destructive"
            onClick={() => {
              onDelete(category);
            }}
          >
            Delete
          </Button>
        )}
      </div>
    </div>
  );
}
