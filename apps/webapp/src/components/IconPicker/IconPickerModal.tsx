import { ActionIcon, Button, Group, Stack } from "@mantine/core";
import { GualletIcon } from "../GualletIcon/GualletIcon";
import {
  IconBabyCarriage,
  IconBriefcase,
  IconBalloon,
  IconBasket,
  IconBike,
  IconBuildingBank,
  IconCar,
  IconCash,
  IconCreditCard,
  IconCup,
  IconGift,
  IconHeartHandshake,
  IconHome,
  IconLego,
  IconMovie,
  IconPaw,
  IconPigMoney,
  IconPlane,
  IconPlug,
  IconQuestionMark,
  IconSchool,
  IconShield,
  IconShirt,
  IconShoppingCart,
  IconStethoscope,
  IconToolsKitchen3,
} from "@tabler/icons-react";

const validIconNames = [
  IconCash,
  IconBriefcase,
  IconHome,
  IconBuildingBank,
  IconPlug,
  IconShield,
  IconShoppingCart,
  IconToolsKitchen3,
  IconCup,
  IconBasket,
  IconCar,
  IconMovie,
  IconPlane,
  IconBalloon,
  IconBike,
  IconShirt,
  IconLego,
  IconBabyCarriage,
  IconSchool,
  IconStethoscope,
  IconPaw,
  IconPigMoney,
  IconCreditCard,
  IconHeartHandshake,
  IconGift,
  IconQuestionMark,
].map((Icon) => Icon.displayName);

interface IconPickerModalProps {
  onIconSelected: (icon: string | undefined) => void;
  onCancel: () => void;
}

export function IconPickerModal({
  onIconSelected,
  onCancel,
}: Readonly<IconPickerModalProps>) {
  return (
    <Stack>
      <Group wrap="wrap">
        {validIconNames.map((iconName) => (
          <ActionIcon
            key={iconName}
            variant="outline"
            aria-label={iconName}
            size={50}
            onClick={() => onIconSelected(iconName)}
          >
            <GualletIcon iconName={iconName} />
          </ActionIcon>
        ))}
      </Group>
      <Button onClick={onCancel}>Cancel</Button>
    </Stack>
  );
}
