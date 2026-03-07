import { useInstitution } from '@guallet/api-react';
import { IconBuildingBank } from '@tabler/icons-react';

interface InstitutionAvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  institutionId: string;
  size?: number;
}

export function InstitutionAvatar({
  institutionId,
  size = 32,
  className,
  style,
  ...props
}: Readonly<InstitutionAvatarProps>) {
  const { institution } = useInstitution(institutionId);

  return (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full border bg-muted ${className ?? ''}`}
      style={{
        width: size,
        height: size,
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
      ) : (
        <IconBuildingBank className="h-4 w-4 text-muted-foreground" />
      )}
    </div>
  );
}
