import { Stepper, StepperProps } from '@mantine/core';

interface CsvStepperProps extends Omit<
  StepperProps,
  'children' | 'active' | 'onStepClick'
> {
  activeStep: number;
  onStepClick?: (stepIndex: number) => void;
}

export function CsvStepper({
  activeStep,
  onStepClick,
  ...props
}: Readonly<CsvStepperProps>) {
  const shouldAllowSelectStep = (step: number): boolean => {
    return step < activeStep;
  };

  return (
    <Stepper
      {...props}
      active={activeStep}
      onStepClick={(stepIndex: number) => {
        if (onStepClick) {
          // Only enable navigating to a previous step, not in the future steps
          if (stepIndex < activeStep) {
            onStepClick(stepIndex);
          }
        }
      }}
    >
      <Stepper.Step
        label="Upload"
        description="CSV file"
        allowStepSelect={shouldAllowSelectStep(0)}
      />
      <Stepper.Step
        label="Map fields"
        description="Column mapping"
        allowStepSelect={shouldAllowSelectStep(1)}
      />
      <Stepper.Step
        label="Accounts"
        description="Account mapping"
        allowStepSelect={shouldAllowSelectStep(2)}
      />
      <Stepper.Step
        label="Categories"
        description="Category mapping"
        allowStepSelect={shouldAllowSelectStep(3)}
      />
      <Stepper.Step
        label="Review"
        description="Final review"
        allowStepSelect={shouldAllowSelectStep(4)}
      />
    </Stepper>
  );
}
