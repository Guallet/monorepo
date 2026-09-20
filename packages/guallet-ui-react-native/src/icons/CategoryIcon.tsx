import {
  IconActivity as TablerActivityIcon,
  IconAlertTriangle as TablerAlertTriangleIcon,
  IconArrowBackUp as TablerArrowBackUpIcon,
  IconArrowRight as TablerArrowRightIcon,
  IconArrowsLeftRight as TablerArrowsLeftRightIcon,
  IconBabyCarriage as TablerBabyCarriageIcon,
  IconBallFootball as TablerBallFootballIcon,
  IconBalloon as TablerBalloonIcon,
  IconBarbell as TablerBarbellIcon,
  IconBasket as TablerBasketIcon,
  IconBed as TablerBedIcon,
  IconBike as TablerBikeIcon,
  IconBolt as TablerBoltIcon,
  IconBook as TablerBookIcon,
  IconBriefcase as TablerBriefcaseIcon,
  IconBuilding as TablerBuildingIcon,
  IconBuildingBank as TablerBuildingBankIcon,
  IconBuildingStore as TablerBuildingStoreIcon,
  IconBus as TablerBusIcon,
  IconCamera as TablerCameraIcon,
  IconCar as TablerCarIcon,
  IconCash as TablerCashIcon,
  IconChartBar as TablerChartBarIcon,
  IconClock as TablerClockIcon,
  IconCoffee as TablerCoffeeIcon,
  IconConfetti as TablerConfettiIcon,
  IconCreditCard as TablerCreditCardIcon,
  IconCup as TablerCupIcon,
  IconDeviceGamepad2 as TablerDeviceGamepad2Icon,
  IconDeviceLaptop as TablerDeviceLaptopIcon,
  IconDeviceMobile as TablerDeviceMobileIcon,
  IconDeviceTv as TablerDeviceTvIcon,
  IconDiamond as TablerDiamondIcon,
  IconDice as TablerDiceIcon,
  IconDots as TablerDotsIcon,
  IconDroplet as TablerDropletIcon,
  IconEye as TablerEyeIcon,
  IconFlower as TablerFlowerIcon,
  IconGasStation as TablerGasStationIcon,
  IconGift as TablerGiftIcon,
  IconGuitarPick as TablerGuitarIcon,
  IconHammer as TablerHammerIcon,
  IconHeart as TablerHeartIcon,
  IconHeartHandshake as TablerHeartHandshakeIcon,
  IconHome as TablerHomeIcon,
  IconLego as TablerLegoIcon,
  IconMap as TablerMapIcon,
  IconMapPin as TablerMapPinIcon,
  IconMovie as TablerMovieIcon,
  IconMusic as TablerMusicIcon,
  IconPackage as TablerPackageIcon,
  IconPalette as TablerPaletteIcon,
  IconParking as TablerParkingIcon,
  IconPaw as TablerPawIcon,
  IconPencil as TablerPencilIcon,
  IconPercentage as TablerPercentageIcon,
  IconPhone as TablerPhoneIcon,
  IconPigMoney as TablerPigMoneyIcon,
  IconPill as TablerPillIcon,
  IconPlane as TablerPlaneIcon,
  IconPlug as TablerPlugIcon,
  IconQuestionMark as TablerQuestionMarkIcon,
  IconReceipt as TablerReceiptIcon,
  IconRun as TablerRunIcon,
  IconSchool as TablerSchoolIcon,
  IconScissors as TablerScissorsIcon,
  IconShield as TablerShieldIcon,
  IconShirt as TablerShirtIcon,
  IconShoppingCart as TablerShoppingCartIcon,
  IconSofa as TablerSofaIcon,
  IconSparkles as TablerSparklesIcon,
  IconStar as TablerStarIcon,
  IconStethoscope as TablerStethoscopeIcon,
  IconTag as TablerTagIcon,
  IconTools as TablerToolsIcon,
  IconToolsKitchen2 as TablerToolsKitchen2Icon,
  IconToolsKitchen3 as TablerToolsKitchen3Icon,
  IconTree as TablerTreeIcon,
  IconTrendingUp as TablerTrendingUpIcon,
  IconTrophy as TablerTrophyIcon,
  IconUsers as TablerUsersIcon,
  IconWalk as TablerWalkIcon,
  IconWifi as TablerWifiIcon,
  type IconProps,
} from '@tabler/icons-react';
import {
  categoryIconFallbackName,
  isCategoryIconName,
  type CategoryIconName,
} from '@guallet/theme';
import type { ComponentType, FC } from 'react';

function createLunaIcon(
  IconComponent: ComponentType<IconProps>,
  displayName: string,
): FC<IconProps> {
  const LunaIcon: FC<IconProps> = (props) => (
    <IconComponent stroke={1.5} {...props} />
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
