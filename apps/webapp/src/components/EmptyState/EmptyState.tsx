import {
  GualletIcon,
  GualletIconName,
} from '@/components/GualletIcon/GualletIcon';

interface EmptyStateProps {
  iconName: GualletIconName;
  text: string;
  onClick: () => void;
}

export default function EmptyState({
  iconName,
  text,
  onClick,
}: Readonly<EmptyStateProps>) {
  return (
    <button
      type="button"
      className="w-full"
      onClick={() => {
        onClick();
      }}
    >
      <div className="rounded-md border bg-card p-6 shadow-sm">
        <div className="rounded-md border-2 border-dashed border-border p-10">
          <div className="flex flex-col items-center justify-center gap-2">
            <GualletIcon
              iconName={iconName}
              size={48}
              stroke={1.5}
              color="#9ca3af"
            />
            <p className="max-w-[500px] text-center text-lg text-foreground">
              {text}
            </p>
          </div>
        </div>
      </div>
    </button>
  );
}
