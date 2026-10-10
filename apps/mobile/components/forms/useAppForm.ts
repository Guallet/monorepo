import { createFormHook } from '@tanstack/react-form';
import { fieldContext, formContext } from './formContext';
import { SubmitButton } from './SubmitButton';
import { SelectField } from './SelectField';
import { TextField } from './TextField';

export const { useAppForm, withForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: { SelectField, TextField },
  formComponents: { SubmitButton },
});
