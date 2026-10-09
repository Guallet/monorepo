import { formOptions, revalidateLogic } from '@tanstack/react-form';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const passwordLoginFormOptions = formOptions({
  defaultValues: { email: '', password: '' },
  // Show errors on submit, then revalidate as the user corrects the fields.
  validationLogic: revalidateLogic(),
  validators: {
    onDynamic: ({ value }) => {
      const fields: { email?: string; password?: string } = {};
      if (!emailRegex.test(value.email.trim())) {
        fields.email = 'Enter a valid email address.';
      }
      if (value.password.length < 6) {
        fields.password = 'Password must be at least 6 characters.';
      }
      if (Object.keys(fields).length > 0) return { fields };
      return undefined;
    },
  },
});
