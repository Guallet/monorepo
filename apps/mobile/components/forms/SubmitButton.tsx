import { Button, type ButtonProps } from '@guallet/luna-mobile';
import { useFormContext } from './formContext';
import { submitForm } from './submitForm';

type SubmitButtonProps = Omit<ButtonProps, 'onClick'> & {
  submittingLabel?: string;
};

export function SubmitButton({
  children,
  disabled = false,
  submittingLabel = 'Saving…',
  ...props
}: Readonly<SubmitButtonProps>) {
  const form = useFormContext();

  return (
    <form.Subscribe
      selector={(state) => [state.canSubmit, state.isSubmitting] as const}
    >
      {([canSubmit, isSubmitting]) => {
        let label = children;
        if (isSubmitting) label = submittingLabel;

        return (
          <Button
            {...props}
            disabled={disabled || !canSubmit || isSubmitting}
            onClick={() => void submitForm(form)}
          >
            {label}
          </Button>
        );
      }}
    </form.Subscribe>
  );
}
