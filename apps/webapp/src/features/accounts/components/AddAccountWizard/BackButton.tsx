import { Button } from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

interface BackButtonProps {
  onClick: () => void;
}

export function BackButton({ onClick }: Readonly<BackButtonProps>) {
  const { t } = useTranslation();

  return (
    <Button
      variant="subtle"
      color="gray"
      size="compact-sm"
      leftSection={<IconArrowLeft size={14} />}
      onClick={onClick}
      mb="md"
    >
      {t('common.back', 'Back')}
    </Button>
  );
}
