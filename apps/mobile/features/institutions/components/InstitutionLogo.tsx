import { useInstitution } from '@guallet/api-react';
import { Avatar } from '@luna-ui/react-native';

interface InstitutionLogoProps {
  institutionId: string;
  alt?: string;
}

export function InstitutionLogo({
  institutionId,
  alt,
}: Readonly<InstitutionLogoProps>) {
  const { institution } = useInstitution(institutionId);
  return (
    <Avatar
      size={40}
      source={institution?.image_src}
      alt={institution?.name ?? alt ?? 'Unknown Institution'}
    />
  );
}
