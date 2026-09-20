import TablerActivityIcon from '@tabler/icons-react-native/IconActivity';
import TablerAlertTriangleIcon from '@tabler/icons-react-native/IconAlertTriangle';
import TablerArrowBackUpIcon from '@tabler/icons-react-native/IconArrowBackUp';
import TablerArrowRightIcon from '@tabler/icons-react-native/IconArrowRight';
import TablerArrowsLeftRightIcon from '@tabler/icons-react-native/IconArrowsLeftRight';
import TablerBabyCarriageIcon from '@tabler/icons-react-native/IconBabyCarriage';
import TablerBallFootballIcon from '@tabler/icons-react-native/IconBallFootball';
import TablerBalloonIcon from '@tabler/icons-react-native/IconBalloon';
import TablerBarbellIcon from '@tabler/icons-react-native/IconBarbell';
import TablerBasketIcon from '@tabler/icons-react-native/IconBasket';
import TablerBedIcon from '@tabler/icons-react-native/IconBed';
import TablerBikeIcon from '@tabler/icons-react-native/IconBike';
import TablerBoltIcon from '@tabler/icons-react-native/IconBolt';
import TablerBookIcon from '@tabler/icons-react-native/IconBook';
import TablerBriefcaseIcon from '@tabler/icons-react-native/IconBriefcase';
import TablerBuildingIcon from '@tabler/icons-react-native/IconBuilding';
import TablerBuildingBankIcon from '@tabler/icons-react-native/IconBuildingBank';
import TablerBuildingStoreIcon from '@tabler/icons-react-native/IconBuildingStore';
import TablerBusIcon from '@tabler/icons-react-native/IconBus';
import TablerCameraIcon from '@tabler/icons-react-native/IconCamera';
import TablerCarIcon from '@tabler/icons-react-native/IconCar';
import TablerCashIcon from '@tabler/icons-react-native/IconCash';
import TablerChartBarIcon from '@tabler/icons-react-native/IconChartBar';
import TablerClockIcon from '@tabler/icons-react-native/IconClock';
import TablerCoffeeIcon from '@tabler/icons-react-native/IconCoffee';
import TablerConfettiIcon from '@tabler/icons-react-native/IconConfetti';
import TablerCreditCardIcon from '@tabler/icons-react-native/IconCreditCard';
import TablerCupIcon from '@tabler/icons-react-native/IconCup';
import TablerDeviceGamepad2Icon from '@tabler/icons-react-native/IconDeviceGamepad2';
import TablerDeviceLaptopIcon from '@tabler/icons-react-native/IconDeviceLaptop';
import TablerDeviceMobileIcon from '@tabler/icons-react-native/IconDeviceMobile';
import TablerDeviceTvIcon from '@tabler/icons-react-native/IconDeviceTv';
import TablerDiamondIcon from '@tabler/icons-react-native/IconDiamond';
import TablerDiceIcon from '@tabler/icons-react-native/IconDice';
import TablerDotsIcon from '@tabler/icons-react-native/IconDots';
import TablerDropletIcon from '@tabler/icons-react-native/IconDroplet';
import TablerEyeIcon from '@tabler/icons-react-native/IconEye';
import TablerFlowerIcon from '@tabler/icons-react-native/IconFlower';
import TablerGasStationIcon from '@tabler/icons-react-native/IconGasStation';
import TablerGiftIcon from '@tabler/icons-react-native/IconGift';
import TablerGuitarIcon from '@tabler/icons-react-native/IconGuitarPick';
import TablerHammerIcon from '@tabler/icons-react-native/IconHammer';
import TablerHeartIcon from '@tabler/icons-react-native/IconHeart';
import TablerHeartHandshakeIcon from '@tabler/icons-react-native/IconHeartHandshake';
import TablerHomeIcon from '@tabler/icons-react-native/IconHome';
import TablerLegoIcon from '@tabler/icons-react-native/IconLego';
import TablerMapIcon from '@tabler/icons-react-native/IconMap';
import TablerMapPinIcon from '@tabler/icons-react-native/IconMapPin';
import TablerMovieIcon from '@tabler/icons-react-native/IconMovie';
import TablerMusicIcon from '@tabler/icons-react-native/IconMusic';
import TablerPackageIcon from '@tabler/icons-react-native/IconPackage';
import TablerPaletteIcon from '@tabler/icons-react-native/IconPalette';
import TablerParkingIcon from '@tabler/icons-react-native/IconParking';
import TablerPawIcon from '@tabler/icons-react-native/IconPaw';
import TablerPencilIcon from '@tabler/icons-react-native/IconPencil';
import TablerPercentageIcon from '@tabler/icons-react-native/IconPercentage';
import TablerPhoneIcon from '@tabler/icons-react-native/IconPhone';
import TablerPigMoneyIcon from '@tabler/icons-react-native/IconPigMoney';
import TablerPillIcon from '@tabler/icons-react-native/IconPill';
import TablerPlaneIcon from '@tabler/icons-react-native/IconPlane';
import TablerPlugIcon from '@tabler/icons-react-native/IconPlug';
import TablerQuestionMarkIcon from '@tabler/icons-react-native/IconQuestionMark';
import TablerReceiptIcon from '@tabler/icons-react-native/IconReceipt';
import TablerRunIcon from '@tabler/icons-react-native/IconRun';
import TablerSchoolIcon from '@tabler/icons-react-native/IconSchool';
import TablerScissorsIcon from '@tabler/icons-react-native/IconScissors';
import TablerShieldIcon from '@tabler/icons-react-native/IconShield';
import TablerShirtIcon from '@tabler/icons-react-native/IconShirt';
import TablerShoppingCartIcon from '@tabler/icons-react-native/IconShoppingCart';
import TablerSofaIcon from '@tabler/icons-react-native/IconSofa';
import TablerSparklesIcon from '@tabler/icons-react-native/IconSparkles';
import TablerStarIcon from '@tabler/icons-react-native/IconStar';
import TablerStethoscopeIcon from '@tabler/icons-react-native/IconStethoscope';
import TablerTagIcon from '@tabler/icons-react-native/IconTag';
import TablerToolsIcon from '@tabler/icons-react-native/IconTools';
import TablerToolsKitchen2Icon from '@tabler/icons-react-native/IconToolsKitchen2';
import TablerToolsKitchen3Icon from '@tabler/icons-react-native/IconToolsKitchen3';
import TablerTreeIcon from '@tabler/icons-react-native/IconTree';
import TablerTrendingUpIcon from '@tabler/icons-react-native/IconTrendingUp';
import TablerTrophyIcon from '@tabler/icons-react-native/IconTrophy';
import TablerUsersIcon from '@tabler/icons-react-native/IconUsers';
import TablerWalkIcon from '@tabler/icons-react-native/IconWalk';
import TablerWifiIcon from '@tabler/icons-react-native/IconWifi';
import {
  categoryIconFallbackName,
  isCategoryIconName,
  type CategoryIconName,
} from '@guallet/theme';
import type { IconProps } from '@tabler/icons-react-native';
import type { ComponentType, FC } from 'react';

function createLunaIcon(
  IconComponent: ComponentType<IconProps>,
  displayName: string,
): FC<IconProps> {
  const LunaIcon: FC<IconProps> = (props) => (
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

const categoryIconRegistry: Record<CategoryIconName, FC<IconProps>> = {
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

export interface CategoryIconProps extends Omit<IconProps, 'name'> {
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
