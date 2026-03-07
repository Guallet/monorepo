import { cn } from '@/lib/utils';

interface CsvStepperProps {
  activeStep: number;
  onStepClick?: (stepIndex: number) => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const csvSteps = [
  {
    label: 'Upload',
    description: 'CSV file',
  },
  {
    label: 'Map fields',
    description: 'Column mapping',
  },
  {
    label: 'Accounts',
    description: 'Account mapping',
  },
  {
    label: 'Categories',
    description: 'Category mapping',
  },
  {
    label: 'Review',
    description: 'Final review',
  },
] as const;

function getStepSizeClasses(size: CsvStepperProps['size']) {
  if (size === 'sm') {
    return {
      number: 'h-7 w-7 text-xs',
      label: 'text-sm',
      description: 'text-xs',
    };
  }

  if (size === 'lg') {
    return {
      number: 'h-10 w-10 text-base',
      label: 'text-base',
      description: 'text-sm',
    };
  }

  return {
    number: 'h-8 w-8 text-sm',
    label: 'text-sm',
    description: 'text-xs',
  };
}

export function CsvStepper({
  activeStep,
  onStepClick,
  size = 'md',
  className,
  ...props
}: Readonly<CsvStepperProps>) {
  const sizeClasses = getStepSizeClasses(size);

  return (
    <div
      className={cn('grid grid-cols-1 gap-2 md:grid-cols-5', className)}
      {...props}
    >
      {csvSteps.map((step, stepIndex) => {
        const isComplete = stepIndex < activeStep;
        const isActive = stepIndex === activeStep;
        const canClick = isComplete && Boolean(onStepClick);

        let indicatorClassName =
          'border-muted-foreground/30 text-muted-foreground';

        if (isActive) {
          indicatorClassName =
            'border-primary bg-primary text-primary-foreground';
        } else if (isComplete) {
          indicatorClassName = 'border-emerald-600 bg-emerald-600 text-white';
        }

        return (
          <button
            key={step.label}
            type="button"
            className={cn(
              'flex items-start gap-3 rounded-lg border p-3 text-left transition-colors',
              isActive ? 'border-primary bg-primary/5' : 'border-border',
              isComplete && !isActive
                ? 'border-emerald-200 bg-emerald-50'
                : '',
              canClick ? 'cursor-pointer hover:bg-accent' : 'cursor-default',
            )}
            disabled={!canClick}
            onClick={() => {
              if (canClick) {
                onStepClick?.(stepIndex);
              }
            }}
          >
            <span
              className={cn(
                'inline-flex flex-none items-center justify-center rounded-full border font-semibold',
                sizeClasses.number,
                indicatorClassName,
              )}
            >
              {stepIndex + 1}
            </span>

            <span className="min-w-0">
              <span className={cn('block font-semibold', sizeClasses.label)}>
                {step.label}
              </span>
              <span
                className={cn(
                  'block text-muted-foreground',
                  sizeClasses.description,
                )}
              >
                {step.description}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
