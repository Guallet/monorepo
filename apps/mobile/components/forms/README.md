# Mobile forms

New mobile forms use TanStack Form through `useAppForm` from
`@/components/forms`. The app owns form adapters; Luna owns the controlled
native inputs and their appearance. Only the password login screen has been
migrated initially.

## Example

```tsx
import { submitForm, useAppForm } from '@/components/forms';
import { revalidateLogic } from '@tanstack/react-form';

const form = useAppForm({
  defaultValues: { name: '' },
  validationLogic: revalidateLogic(),
  validators: {
    onDynamic: ({ value }) => {
      if (!value.name.trim()) {
        return { fields: { name: 'Enter a name.' } };
      }
      return undefined;
    },
  },
  onSubmit: async ({ value }) => {
    await createMutation.mutateAsync({ request: { name: value.name.trim() } });
  },
});

return (
  <form.AppForm>
    <form.AppField name="name">
      {(field) => (
        <field.TextField
          label="Name"
          returnKeyType="done"
          onSubmitEditing={() => void submitForm(form)}
        />
      )}
    </form.AppField>
    <form.SubmitButton submittingLabel="Creating…">Create</form.SubmitButton>
  </form.AppForm>
);
```

This fragment belongs inside a screen component. Handle mutation failures in
`onSubmit` and show a request error; the password login implementation
demonstrates this and clears the request error through `listeners.onChange`.

## Conventions

- `TextField` owns value/change/blur/error props, supplies an accessible label,
  and exposes the first error in the native accessibility hint. Validators may
  return strings or Standard Schema issues with a `message` property. A schema
  library is optional; function validators are supported directly.
- `revalidateLogic()` with `onDynamic` validates on submit, then on change after
  an attempted submission. Return errors keyed by actual field names.
- `SubmitButton` subscribes to `canSubmit` and `isSubmitting`, disables itself
  during requests, and uses `submitForm`. Use that same helper for keyboard
  submission. Await requests so submission state lasts until they finish.
  `canSubmit` alone does not mean an untouched form has passed validation.
- Use `form.Subscribe` for previews/buttons and `useSelector` from
  `@tanstack/react-form` for values needed in screen logic. Avoid subscribing
  the entire screen to all form state. Use `withForm` for typed form sections.
- Keep submitted values in the form. Local state is appropriate for password
  visibility, open sheets, draft picker selections, and server request errors.
  Committed picker selections call the field's `handleChange`; mark the field
  touched when the interaction completes. Render accessible errors for pickers.
- Register new field adapters in `useAppForm.ts` using the contexts exported
  by `formContext.ts`. The same contexts must be used throughout. `TextField`
  expects a string field; create a typed adapter for arrays, dates, or numbers.
- Initialize edit forms after loading their resource and preserve edits during
  refetches. Reset only deliberately, such as after saving or switching records.
  TanStack's `isDirty` persists after reverting edits; compare normalized values
  to the initial values when implementing discard warnings.
- Keep money inputs as strings while editing. Use `@guallet/money` and
  `Currency.decimalPlaces` for validation, and normalize explicitly when
  building the API request. Schema validation does not apply transformed
  values to `onSubmit`; parse explicitly if using schema transforms.
- Native focus/keyboard behavior stays in the UI layer. Do not copy DOM form
  elements, `querySelector`, or web form submission events into mobile screens.

## References

- [React Native support](https://tanstack.com/form/latest/docs/framework/react/guides/react-native)
- [Form composition](https://tanstack.com/form/latest/docs/framework/react/guides/form-composition)
- [Dynamic validation](https://tanstack.com/form/latest/docs/framework/react/guides/dynamic-validation)
- [Password login example](../../features/login/screens/PasswordLoginScreen.tsx)
