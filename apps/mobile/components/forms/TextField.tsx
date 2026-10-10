import { TextInput, type TextInputProps } from '@guallet/luna-mobile';
import { useFieldContext } from './formContext';
import { fieldError } from './fieldError';

type TextFieldProps = Omit<
  TextInputProps,
  'value' | 'defaultValue' | 'onChangeText' | 'onBlur' | 'error'
>;

/** A string field whose value, validation, and touch state belong to the form. */
export function TextField(props: Readonly<TextFieldProps>) {
  const field = useFieldContext<string>();
  const error = fieldError(field.state.meta.errors);

  return (
    <TextInput
      {...props}
      accessibilityLabel={props.accessibilityLabel ?? props.label}
      accessibilityHint={error ?? props.accessibilityHint}
      error={error}
      value={field.state.value}
      onChangeText={field.handleChange}
      onBlur={field.handleBlur}
    />
  );
}
