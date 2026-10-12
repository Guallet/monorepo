import { Button, type ButtonProps } from '@guallet/luna-mobile';

type SubmitButtonProps = Omit<ButtonProps, 'onClick'> & {
  canSubmit: boolean;
  isSubmitting: boolean;
  onSubmit: () => void;
  submittingLabel?: string;
};

export function SubmitButton({
  canSubmit,
  children,
  disabled = false,
  isSubmitting,
  onSubmit,
  submittingLabel = 'Saving…',
  ...props
}: Readonly<SubmitButtonProps>) {
  return (
    <Button
      {...props}
      disabled={disabled || !canSubmit || isSubmitting}
      onClick={onSubmit}
    >
      {isSubmitting ? submittingLabel : children}
    </Button>
  );
}
