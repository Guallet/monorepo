# Mobile forms

Use TanStack Form's `useForm` hook in a feature form component. Define the
form's value shape and Zod schema there, and bind each `form.Field` to a
controlled Luna input. Use `revalidateLogic()` with the schema in
`validators.onDynamic` so fields can show validation errors as users edit.

Use `form.Subscribe` to read `canSubmit` and `isSubmitting` for the shared
`SubmitButton`. Pass `onSubmit` to control the submit action. Call
`submitForm(form)` from both the button and keyboard handlers to guard
concurrent submissions. Keep server request errors and UI-only state outside
the form.
