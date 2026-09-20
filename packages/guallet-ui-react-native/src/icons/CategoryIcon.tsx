import TablerActivityIcon from '#tabler/IconActivity';
import TablerAlertTriangleIcon from '#tabler/IconAlertTriangle';
import TablerArrowBackUpIcon from '#tabler/IconArrowBackUp';
import TablerArrowRightIcon from '#tabler/IconArrowRight';
import TablerArrowsLeftRightIcon from '#tabler/IconArrowsLeftRight';
import TablerBabyCarriageIcon from '#tabler/IconBabyCarriage';
import TablerBallFootballIcon from '#tabler/IconBallFootball';
import TablerBalloonIcon from '#tabler/IconBalloon';
import TablerBarbellIcon from '#tabler/IconBarbell';
import TablerBasketIcon from '#tabler/IconBasket';
import TablerBedIcon from '#tabler/IconBed';
import TablerBikeIcon from '#tabler/IconBike';
import TablerBoltIcon from '#tabler/IconBolt';
import TablerBookIcon from '#tabler/IconBook';
import TablerBriefcaseIcon from '#tabler/IconBriefcase';
import TablerBuildingIcon from '#tabler/IconBuilding';
import TablerBuildingBankIcon from '#tabler/IconBuildingBank';
import TablerBuildingStoreIcon from '#tabler/IconBuildingStore';
import TablerBusIcon from '#tabler/IconBus';
import TablerCameraIcon from '#tabler/IconCamera';
import TablerCarIcon from '#tabler/IconCar';
import TablerCashIcon from '#tabler/IconCash';
import TablerChartBarIcon from '#tabler/IconChartBar';
import TablerClockIcon from '#tabler/IconClock';
import TablerCoffeeIcon from '#tabler/IconCoffee';
import TablerConfettiIcon from '#tabler/IconConfetti';
import TablerCreditCardIcon from '#tabler/IconCreditCard';
import TablerCupIcon from '#tabler/IconCup';
import TablerDeviceGamepad2Icon from '#tabler/IconDeviceGamepad2';
import TablerDeviceLaptopIcon from '#tabler/IconDeviceLaptop';
import TablerDeviceMobileIcon from '#tabler/IconDeviceMobile';
import TablerDeviceTvIcon from '#tabler/IconDeviceTv';
import TablerDiamondIcon from '#tabler/IconDiamond';
import TablerDiceIcon from '#tabler/IconDice';
import TablerDotsIcon from '#tabler/IconDots';
import TablerDropletIcon from '#tabler/IconDroplet';
import TablerEyeIcon from '#tabler/IconEye';
import TablerFlowerIcon from '#tabler/IconFlower';
import TablerGasStationIcon from '#tabler/IconGasStation';
import TablerGiftIcon from '#tabler/IconGift';
import TablerGuitarIcon from '#tabler/IconGuitarPick';
import TablerHammerIcon from '#tabler/IconHammer';
import TablerHeartIcon from '#tabler/IconHeart';
import TablerHeartHandshakeIcon from '#tabler/IconHeartHandshake';
import TablerHomeIcon from '#tabler/IconHome';
import TablerLegoIcon from '#tabler/IconLego';
import TablerMapIcon from '#tabler/IconMap';
import TablerMapPinIcon from '#tabler/IconMapPin';
import TablerMovieIcon from '#tabler/IconMovie';
import TablerMusicIcon from '#tabler/IconMusic';
import TablerPackageIcon from '#tabler/IconPackage';
import TablerPaletteIcon from '#tabler/IconPalette';
import TablerParkingIcon from '#tabler/IconParking';
import TablerPawIcon from '#tabler/IconPaw';
import TablerPencilIcon from '#tabler/IconPencil';
import TablerPercentageIcon from '#tabler/IconPercentage';
import TablerPhoneIcon from '#tabler/IconPhone';
import TablerPigMoneyIcon from '#tabler/IconPigMoney';
import TablerPillIcon from '#tabler/IconPill';
import TablerPlaneIcon from '#tabler/IconPlane';
import TablerPlugIcon from '#tabler/IconPlug';
import TablerQuestionMarkIcon from '#tabler/IconQuestionMark';
import TablerReceiptIcon from '#tabler/IconReceipt';
import TablerRunIcon from '#tabler/IconRun';
import TablerSchoolIcon from '#tabler/IconSchool';
import TablerScissorsIcon from '#tabler/IconScissors';
import TablerShieldIcon from '#tabler/IconShield';
import TablerShirtIcon from '#tabler/IconShirt';
import TablerShoppingCartIcon from '#tabler/IconShoppingCart';
import TablerSofaIcon from '#tabler/IconSofa';
import TablerSparklesIcon from '#tabler/IconSparkles';
import TablerStarIcon from '#tabler/IconStar';
import TablerStethoscopeIcon from '#tabler/IconStethoscope';
import TablerTagIcon from '#tabler/IconTag';
import TablerToolsIcon from '#tabler/IconTools';
import TablerToolsKitchen2Icon from '#tabler/IconToolsKitchen2';
import TablerToolsKitchen3Icon from '#tabler/IconToolsKitchen3';
import TablerTreeIcon from '#tabler/IconTree';
import TablerTrendingUpIcon from '#tabler/IconTrendingUp';
import TablerTrophyIcon from '#tabler/IconTrophy';
import TablerUsersIcon from '#tabler/IconUsers';
import TablerWalkIcon from '#tabler/IconWalk';
import TablerWifiIcon from '#tabler/IconWifi';
import {
  categoryIconFallbackName,
  isCategoryIconName,
  type CategoryIconName,
} from '@guallet/theme';
import type { ComponentType, FC } from 'react';

export interface LunaIconProps {
  size?: string | number;
  color?: string;
  strokeWidth?: string | number;
  title?: string;
  className?: string;
  style?: unknown;
  accessibilityLabel?: string;
  testID?: string;
  'aria-label'?: string;
}

function createLunaIcon(
  IconComponent: ComponentType<LunaIconProps>,
  displayName: string,
): FC<LunaIconProps> {
  const LunaIcon: FC<LunaIconProps> = (props) => (
    <IconComponent strokeWidth={1.5} {...props} />
  );
  LunaIcon.displayName = displayName;
  return LunaIcon;
}

export const ActivityIcon = createLunaIcon(TablerActivityIcon, 'ActivityIcon');
export const AlertTriangleIcon = createLunaIcon(
  TablerAlertTriangleIcon,
  'AlertTriangleIcon',
);
export const ArrowBackUpIcon = createLunaIcon(
  TablerArrowBackUpIcon,
  'ArrowBackUpIcon',
);
export const ArrowRightIcon = createLunaIcon(
  TablerArrowRightIcon,
  'ArrowRightIcon',
);
export const ArrowsLeftRightIcon = createLunaIcon(
  TablerArrowsLeftRightIcon,
  'ArrowsLeftRightIcon',
);
export const BabyCarriageIcon = createLunaIcon(
  TablerBabyCarriageIcon,
  'BabyCarriageIcon',
);
export const BallFootballIcon = createLunaIcon(
  TablerBallFootballIcon,
  'BallFootballIcon',
);
export const BalloonIcon = createLunaIcon(TablerBalloonIcon, 'BalloonIcon');
export const BarbellIcon = createLunaIcon(TablerBarbellIcon, 'BarbellIcon');
export const BasketIcon = createLunaIcon(TablerBasketIcon, 'BasketIcon');
export const BedIcon = createLunaIcon(TablerBedIcon, 'BedIcon');
export const BikeIcon = createLunaIcon(TablerBikeIcon, 'BikeIcon');
export const BoltIcon = createLunaIcon(TablerBoltIcon, 'BoltIcon');
export const BookIcon = createLunaIcon(TablerBookIcon, 'BookIcon');
export const BriefcaseIcon = createLunaIcon(
  TablerBriefcaseIcon,
  'BriefcaseIcon',
);
export const BuildingIcon = createLunaIcon(TablerBuildingIcon, 'BuildingIcon');
export const BuildingBankIcon = createLunaIcon(
  TablerBuildingBankIcon,
  'BuildingBankIcon',
);
export const BuildingStoreIcon = createLunaIcon(
  TablerBuildingStoreIcon,
  'BuildingStoreIcon',
);
export const BusIcon = createLunaIcon(TablerBusIcon, 'BusIcon');
export const CameraIcon = createLunaIcon(TablerCameraIcon, 'CameraIcon');
export const CarIcon = createLunaIcon(TablerCarIcon, 'CarIcon');
export const CashIcon = createLunaIcon(TablerCashIcon, 'CashIcon');
export const ChartBarIcon = createLunaIcon(TablerChartBarIcon, 'ChartBarIcon');
export const ClockIcon = createLunaIcon(TablerClockIcon, 'ClockIcon');
export const CoffeeIcon = createLunaIcon(TablerCoffeeIcon, 'CoffeeIcon');
export const ConfettiIcon = createLunaIcon(TablerConfettiIcon, 'ConfettiIcon');
export const CreditCardIcon = createLunaIcon(
  TablerCreditCardIcon,
  'CreditCardIcon',
);
export const CupIcon = createLunaIcon(TablerCupIcon, 'CupIcon');
export const DeviceGamepad2Icon = createLunaIcon(
  TablerDeviceGamepad2Icon,
  'DeviceGamepad2Icon',
);
export const DeviceLaptopIcon = createLunaIcon(
  TablerDeviceLaptopIcon,
  'DeviceLaptopIcon',
);
export const DeviceMobileIcon = createLunaIcon(
  TablerDeviceMobileIcon,
  'DeviceMobileIcon',
);
export const DeviceTvIcon = createLunaIcon(TablerDeviceTvIcon, 'DeviceTvIcon');
export const DiamondIcon = createLunaIcon(TablerDiamondIcon, 'DiamondIcon');
export const DiceIcon = createLunaIcon(TablerDiceIcon, 'DiceIcon');
export const DotsIcon = createLunaIcon(TablerDotsIcon, 'DotsIcon');
export const DropletIcon = createLunaIcon(TablerDropletIcon, 'DropletIcon');
export const EyeIcon = createLunaIcon(TablerEyeIcon, 'EyeIcon');
export const FlowerIcon = createLunaIcon(TablerFlowerIcon, 'FlowerIcon');
export const GasStationIcon = createLunaIcon(
  TablerGasStationIcon,
  'GasStationIcon',
);
export const GiftIcon = createLunaIcon(TablerGiftIcon, 'GiftIcon');
export const GuitarIcon = createLunaIcon(TablerGuitarIcon, 'GuitarIcon');
export const HammerIcon = createLunaIcon(TablerHammerIcon, 'HammerIcon');
export const HeartIcon = createLunaIcon(TablerHeartIcon, 'HeartIcon');
export const HeartHandshakeIcon = createLunaIcon(
  TablerHeartHandshakeIcon,
  'HeartHandshakeIcon',
);
export const HomeIcon = createLunaIcon(TablerHomeIcon, 'HomeIcon');
export const LegoIcon = createLunaIcon(TablerLegoIcon, 'LegoIcon');
export const MapIcon = createLunaIcon(TablerMapIcon, 'MapIcon');
export const MapPinIcon = createLunaIcon(TablerMapPinIcon, 'MapPinIcon');
export const MovieIcon = createLunaIcon(TablerMovieIcon, 'MovieIcon');
export const MusicIcon = createLunaIcon(TablerMusicIcon, 'MusicIcon');
export const PackageIcon = createLunaIcon(TablerPackageIcon, 'PackageIcon');
export const PaletteIcon = createLunaIcon(TablerPaletteIcon, 'PaletteIcon');
export const ParkingIcon = createLunaIcon(TablerParkingIcon, 'ParkingIcon');
export const PawIcon = createLunaIcon(TablerPawIcon, 'PawIcon');
export const PencilIcon = createLunaIcon(TablerPencilIcon, 'PencilIcon');
export const PercentageIcon = createLunaIcon(
  TablerPercentageIcon,
  'PercentageIcon',
);
export const PhoneIcon = createLunaIcon(TablerPhoneIcon, 'PhoneIcon');
export const PigMoneyIcon = createLunaIcon(TablerPigMoneyIcon, 'PigMoneyIcon');
export const PillIcon = createLunaIcon(TablerPillIcon, 'PillIcon');
export const PlaneIcon = createLunaIcon(TablerPlaneIcon, 'PlaneIcon');
export const PlugIcon = createLunaIcon(TablerPlugIcon, 'PlugIcon');
export const QuestionMarkIcon = createLunaIcon(
  TablerQuestionMarkIcon,
  'QuestionMarkIcon',
);
export const ReceiptIcon = createLunaIcon(TablerReceiptIcon, 'ReceiptIcon');
export const RunIcon = createLunaIcon(TablerRunIcon, 'RunIcon');
export const SchoolIcon = createLunaIcon(TablerSchoolIcon, 'SchoolIcon');
export const ScissorsIcon = createLunaIcon(TablerScissorsIcon, 'ScissorsIcon');
export const ShieldIcon = createLunaIcon(TablerShieldIcon, 'ShieldIcon');
export const ShirtIcon = createLunaIcon(TablerShirtIcon, 'ShirtIcon');
export const ShoppingCartIcon = createLunaIcon(
  TablerShoppingCartIcon,
  'ShoppingCartIcon',
);
export const SofaIcon = createLunaIcon(TablerSofaIcon, 'SofaIcon');
export const SparklesIcon = createLunaIcon(TablerSparklesIcon, 'SparklesIcon');
export const StarIcon = createLunaIcon(TablerStarIcon, 'StarIcon');
export const StethoscopeIcon = createLunaIcon(
  TablerStethoscopeIcon,
  'StethoscopeIcon',
);
export const TagIcon = createLunaIcon(TablerTagIcon, 'TagIcon');
export const ToolsIcon = createLunaIcon(TablerToolsIcon, 'ToolsIcon');
export const ToolsKitchen2Icon = createLunaIcon(
  TablerToolsKitchen2Icon,
  'ToolsKitchen2Icon',
);
export const ToolsKitchen3Icon = createLunaIcon(
  TablerToolsKitchen3Icon,
  'ToolsKitchen3Icon',
);
export const TreeIcon = createLunaIcon(TablerTreeIcon, 'TreeIcon');
export const TrendingUpIcon = createLunaIcon(
  TablerTrendingUpIcon,
  'TrendingUpIcon',
);
export const TrophyIcon = createLunaIcon(TablerTrophyIcon, 'TrophyIcon');
export const UsersIcon = createLunaIcon(TablerUsersIcon, 'UsersIcon');
export const WalkIcon = createLunaIcon(TablerWalkIcon, 'WalkIcon');
export const WifiIcon = createLunaIcon(TablerWifiIcon, 'WifiIcon');

export const MoneyIcon = CashIcon;
export const UnknownCategoryIcon = QuestionMarkIcon;

const categoryIconRegistry: Record<CategoryIconName, FC<LunaIconProps>> = {
  IconActivity: ActivityIcon,
  IconAlertTriangle: AlertTriangleIcon,
  IconArrowBackUp: ArrowBackUpIcon,
  IconArrowRight: ArrowRightIcon,
  IconArrowsLeftRight: ArrowsLeftRightIcon,
  IconBabyCarriage: BabyCarriageIcon,
  IconBallFootball: BallFootballIcon,
  IconBalloon: BalloonIcon,
  IconBarbell: BarbellIcon,
  IconBasket: BasketIcon,
  IconBed: BedIcon,
  IconBike: BikeIcon,
  IconBolt: BoltIcon,
  IconBook: BookIcon,
  IconBriefcase: BriefcaseIcon,
  IconBuilding: BuildingIcon,
  IconBuildingBank: BuildingBankIcon,
  IconBuildingStore: BuildingStoreIcon,
  IconBus: BusIcon,
  IconCamera: CameraIcon,
  IconCar: CarIcon,
  IconCash: CashIcon,
  IconChartBar: ChartBarIcon,
  IconClock: ClockIcon,
  IconCoffee: CoffeeIcon,
  IconConfetti: ConfettiIcon,
  IconCreditCard: CreditCardIcon,
  IconCup: CupIcon,
  IconDeviceGamepad2: DeviceGamepad2Icon,
  IconDeviceLaptop: DeviceLaptopIcon,
  IconDeviceMobile: DeviceMobileIcon,
  IconDeviceTv: DeviceTvIcon,
  IconDiamond: DiamondIcon,
  IconDice: DiceIcon,
  IconDots: DotsIcon,
  IconDroplet: DropletIcon,
  IconEye: EyeIcon,
  IconFlower: FlowerIcon,
  IconGasStation: GasStationIcon,
  IconGift: GiftIcon,
  IconGuitar: GuitarIcon,
  IconHammer: HammerIcon,
  IconHeart: HeartIcon,
  IconHeartHandshake: HeartHandshakeIcon,
  IconHome: HomeIcon,
  IconLego: LegoIcon,
  IconMap: MapIcon,
  IconMapPin: MapPinIcon,
  IconMovie: MovieIcon,
  IconMusic: MusicIcon,
  IconPackage: PackageIcon,
  IconPalette: PaletteIcon,
  IconParking: ParkingIcon,
  IconPaw: PawIcon,
  IconPencil: PencilIcon,
  IconPercentage: PercentageIcon,
  IconPhone: PhoneIcon,
  IconPigMoney: PigMoneyIcon,
  IconPill: PillIcon,
  IconPlane: PlaneIcon,
  IconPlug: PlugIcon,
  IconQuestionMark: QuestionMarkIcon,
  IconReceipt: ReceiptIcon,
  IconRun: RunIcon,
  IconSchool: SchoolIcon,
  IconScissors: ScissorsIcon,
  IconShield: ShieldIcon,
  IconShirt: ShirtIcon,
  IconShoppingCart: ShoppingCartIcon,
  IconSofa: SofaIcon,
  IconSparkles: SparklesIcon,
  IconStar: StarIcon,
  IconStethoscope: StethoscopeIcon,
  IconTag: TagIcon,
  IconTools: ToolsIcon,
  IconToolsKitchen2: ToolsKitchen2Icon,
  IconToolsKitchen3: ToolsKitchen3Icon,
  IconTree: TreeIcon,
  IconTrendingUp: TrendingUpIcon,
  IconTrophy: TrophyIcon,
  IconUsers: UsersIcon,
  IconWalk: WalkIcon,
  IconWifi: WifiIcon,
};

export interface CategoryIconProps extends LunaIconProps {
  name?: string | null;
}

/**
 * Renders a supported persisted category icon, falling back safely for unknown
 * or missing values.
 */
export function CategoryIcon({ name, ...props }: Readonly<CategoryIconProps>) {
  const resolvedName = isCategoryIconName(name)
    ? name
    : categoryIconFallbackName;
  const IconComponent = categoryIconRegistry[resolvedName];

  return <IconComponent {...props} />;
}
