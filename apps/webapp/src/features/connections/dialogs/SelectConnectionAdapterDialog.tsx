import { Card, Image, Modal, SimpleGrid, Stack, Text } from '@mantine/core';

export type ConnectionAdapter = 'nordigen' | 'trading212';

interface ConnectionAdapterCardProps {
  title: string;
  description: string;
  image: string;
  onClick: () => void;
}

function ConnectionAdapterCard({
  description,
  image,
  onClick,
  title,
}: Readonly<ConnectionAdapterCardProps>) {
  return (
    <Card
      withBorder
      shadow="sm"
      padding="lg"
      radius="md"
      onClick={onClick}
      style={{ cursor: 'pointer' }}
    >
      <Stack gap="sm" align="center">
        <Image
          src={image}
          alt={`${title} logo`}
          w={96}
          h={96}
          radius="md"
          fit="contain"
        />
        <Text fw={600} size="lg">
          {title}
        </Text>
        <Text size="sm" c="dimmed" ta="center">
          {description}
        </Text>
      </Stack>
    </Card>
  );
}

interface SelectConnectionAdapterDialogProps {
  isOpen: boolean;
  onSelect: (adapter: ConnectionAdapter) => void;
  onClose: () => void;
}

export function SelectConnectionAdapterDialog({
  isOpen,
  onClose,
  onSelect,
}: Readonly<SelectConnectionAdapterDialogProps>) {
  // Implementation of the dialog to select a connection adapter
  return (
    <Modal
      opened={isOpen}
      onClose={onClose}
      centered
      title="Select Connection Adapter"
    >
      <SimpleGrid cols={2} spacing="lg">
        <ConnectionAdapterCard
          title="Nordigen"
          description="Connect EU bank accounts via PSD2 open banking."
          image="https://avatars.githubusercontent.com/u/60747918?s=200&v=4"
          onClick={() => {
            onSelect('nordigen');
          }}
        />
        <ConnectionAdapterCard
          title="Trading 212"
          description="Link your Trading 212 brokerage to sync positions."
          image="https://avatars.githubusercontent.com/u/152959512?s=200&v=4"
          onClick={() => {
            onSelect('trading212');
          }}
        />
      </SimpleGrid>
    </Modal>
  );
}
