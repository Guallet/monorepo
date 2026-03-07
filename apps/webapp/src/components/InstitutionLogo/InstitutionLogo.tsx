import { useInstitution } from '@guallet/api-react';
import { cn } from '@/lib/utils';

const AVATAR_SIZE_MAP = {
  xs: 24,
  sm: 28,
  md: 36,
  lg: 42,
  xl: 50,
} as const;

const AVATAR_RADIUS_MAP = {
  xs: 2,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 9999,
} as const;

function resolveAvatarSize(size?: number | string): number {
  if (typeof size === 'number') {
    return size;
  }

  if (typeof size === 'string' && size in AVATAR_SIZE_MAP) {
    return AVATAR_SIZE_MAP[size as keyof typeof AVATAR_SIZE_MAP];
  }

  return 36;
}

function resolveAvatarRadius(radius?: number | string): number | string {
  if (typeof radius === 'number') {
    return radius;
  }

  if (typeof radius === 'string' && radius in AVATAR_RADIUS_MAP) {
    return AVATAR_RADIUS_MAP[radius as keyof typeof AVATAR_RADIUS_MAP];
  }

  return AVATAR_RADIUS_MAP.xl;
}

interface InstitutionLogoProps extends React.HTMLAttributes<HTMLDivElement> {
  institutionId: string;
  size?: number | string;
  radius?: number | string;
}

export function InstitutionLogo({
  institutionId,
  size,
  radius,
  className,
  style,
  ...props
}: Readonly<InstitutionLogoProps>) {
  const { institution } = useInstitution(institutionId);

  const resolvedSize = resolveAvatarSize(size);
  const resolvedRadius = resolveAvatarRadius(radius);

  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center overflow-hidden border bg-muted text-muted-foreground',
        className,
      )}
      style={{
        width: resolvedSize,
        height: resolvedSize,
        borderRadius: resolvedRadius,
        ...style,
      }}
      aria-label={institution?.name ?? 'Institution logo'}
      {...props}
    >
      {institution?.image_src ? (
        <img
          src={institution.image_src}
          alt={institution?.name ?? 'Institution logo'}
          className="h-full w-full object-cover"
        />
      ) : null}
    </div>
  );
}
