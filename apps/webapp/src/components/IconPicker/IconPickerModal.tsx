import { Button } from '@/components/ui/button';
import { GualletIcon } from '../GualletIcon/GualletIcon';

const validIconNames = [
  'IconCash',
  'IconBriefcase',
  'IconHome',
  'IconBuildingBank',
  'IconPlug',
  'IconShield',
  'IconShoppingCart',
  'IconToolsKitchen3',
  'IconCup',
  'IconBasket',
  'IconCar',
  'IconMovie',
  'IconPlane',
  'IconBalloon',
  'IconBike',
  'IconShirt',
  'IconLego',
  'IconBabyCarriage',
  'IconSchool',
  'IconStethoscope',
  'IconPaw',
  'IconPigMoney',
  'IconCreditCard',
  'IconHeartHandshake',
  'IconGift',
  'IconQuestionMark',
] as const;

interface IconPickerModalProps {
  onIconSelected: (icon: string | undefined) => void;
  onCancel: () => void;
}

export function IconPickerModal({
  onIconSelected,
  onCancel,
}: Readonly<IconPickerModalProps>) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-7">
        {validIconNames.map((iconName) => (
          <button
            type="button"
            key={iconName}
            aria-label={iconName}
            className="flex h-12 w-12 items-center justify-center rounded-md border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            onClick={() => onIconSelected(iconName)}
          >
            <GualletIcon iconName={iconName} />
          </button>
        ))}
      </div>

      <div className="flex justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
