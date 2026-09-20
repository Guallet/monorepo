class Category {
  name: string;
  icon: string;
  color: string;
  subcategories: SubCategory[];

  constructor(args: {
    name: string;
    icon: string;
    color: string;
    subcategories: SubCategory[];
  }) {
    this.name = args.name;
    this.icon = args.icon;
    this.color = args.color;
    this.subcategories = args.subcategories;
  }
}

class SubCategory {
  name: string;
  icon: string;
  color: string;

  constructor(args: { name: string; icon: string; color: string }) {
    this.name = args.name;
    this.icon = args.icon;
    this.color = args.color;
  }
}

export const defaultCategories: Category[] = [
  {
    name: 'Income',
    icon: 'IconCash',
    color: '#22c55e',
    subcategories: [
      { name: 'Salary', icon: 'IconBriefcase', color: '#22c55e' },
      { name: 'Bonus', icon: 'IconTrophy', color: '#22c55e' },
      { name: 'Interest', icon: 'IconPercentage', color: '#22c55e' },
      { name: 'Investments', icon: 'IconTrendingUp', color: '#22c55e' },
      { name: 'Dividends', icon: 'IconChartBar', color: '#22c55e' },
      { name: 'Rewards/Cashback', icon: 'IconGift', color: '#22c55e' },
      { name: 'Benefits', icon: 'IconHeartHandshake', color: '#22c55e' },
      { name: 'Gifts', icon: 'IconGift', color: '#22c55e' },
      { name: 'Refunded purchase', icon: 'IconArrowBackUp', color: '#22c55e' },
      { name: 'Sale', icon: 'IconTag', color: '#22c55e' },
      { name: 'Tax refund', icon: 'IconReceipt', color: '#22c55e' },
      { name: 'Loan', icon: 'IconBuildingBank', color: '#22c55e' },
      { name: 'Pension', icon: 'IconClock', color: '#22c55e' },
    ],
  },
  {
    name: 'Transfer',
    icon: 'IconArrowsLeftRight',
    color: '#6366f1',
    subcategories: [
      { name: 'Outside Guallet', icon: 'IconArrowRight', color: '#6366f1' },
    ],
  },
  {
    name: 'Enjoyment',
    icon: 'IconConfetti',
    color: '#f59e0b',
    subcategories: [
      { name: 'Videogames', icon: 'IconDeviceGamepad2', color: '#f59e0b' },
      { name: 'Cinema', icon: 'IconMovie', color: '#f59e0b' },
      {
        name: 'Books/Magazines/Newspapers',
        icon: 'IconBook',
        color: '#f59e0b',
      },
      {
        name: 'Software and mobile apps',
        icon: 'IconDeviceMobile',
        color: '#f59e0b',
      },
      { name: 'Music', icon: 'IconMusic', color: '#f59e0b' },
      {
        name: 'Personal electronics',
        icon: 'IconDeviceLaptop',
        color: '#f59e0b',
      },
      { name: 'TV/Movies packages', icon: 'IconDeviceTv', color: '#f59e0b' },
      { name: 'Birthday party', icon: 'IconBalloon', color: '#f59e0b' },
      { name: 'Charity', icon: 'IconHeartHandshake', color: '#f59e0b' },
      { name: 'Gifts and presents', icon: 'IconGift', color: '#f59e0b' },
      { name: 'Flowers', icon: 'IconFlower', color: '#f59e0b' },
    ],
  },
  {
    name: 'Hobbies and activities',
    icon: 'IconPalette',
    color: '#8b5cf6',
    subcategories: [
      { name: 'Art supplies', icon: 'IconPalette', color: '#8b5cf6' },
      {
        name: 'Books & Course materials',
        icon: 'IconBook',
        color: '#8b5cf6',
      },
      { name: 'Course  Tuition fees', icon: 'IconSchool', color: '#8b5cf6' },
      { name: 'Gambling', icon: 'IconDice', color: '#8b5cf6' },
      {
        name: 'Gym membership and equipment',
        icon: 'IconBarbell',
        color: '#8b5cf6',
      },
      { name: 'Hobbies materials', icon: 'IconTools', color: '#8b5cf6' },
      { name: 'Musical equipment', icon: 'IconGuitar', color: '#8b5cf6' },
      { name: 'Personal training', icon: 'IconRun', color: '#8b5cf6' },
      { name: 'Photography', icon: 'IconCamera', color: '#8b5cf6' },
      { name: 'Sports equipment', icon: 'IconBallFootball', color: '#8b5cf6' },
      {
        name: 'Stationery & consumables',
        icon: 'IconPencil',
        color: '#8b5cf6',
      },
    ],
  },
  {
    name: 'Housing',
    icon: 'IconHome',
    color: '#ef4444',
    subcategories: [
      { name: 'Rent/Mortgage', icon: 'IconBuildingBank', color: '#ef4444' },
      { name: 'Ground rent', icon: 'IconMapPin', color: '#ef4444' },
      { name: 'Service Charge', icon: 'IconReceipt', color: '#ef4444' },
      { name: 'DYI / Repairs', icon: 'IconHammer', color: '#ef4444' },
      { name: 'Insurance', icon: 'IconShield', color: '#ef4444' },
    ],
  },
  {
    name: 'Household',
    icon: 'IconSofa',
    color: '#f97316',
    subcategories: [
      { name: 'Home electronics', icon: 'IconDeviceTv', color: '#f97316' },
      {
        name: 'Kitchen appliances',
        icon: 'IconToolsKitchen2',
        color: '#f97316',
      },
      {
        name: 'Food, Groceries, household',
        icon: 'IconShoppingCart',
        color: '#f97316',
      },
      { name: 'Furniture', icon: 'IconSofa', color: '#f97316' },
      { name: 'Garden', icon: 'IconTree', color: '#f97316' },
    ],
  },
  {
    name: 'Bills and subscriptions',
    icon: 'IconReceipt',
    color: '#0ea5e9',
    subcategories: [
      { name: 'Council Tax', icon: 'IconBuilding', color: '#0ea5e9' },
      { name: 'Water', icon: 'IconDroplet', color: '#0ea5e9' },
      {
        name: 'Electricity (Gas/Energy/Other)',
        icon: 'IconBolt',
        color: '#0ea5e9',
      },
      { name: 'Phone', icon: 'IconPhone', color: '#0ea5e9' },
      { name: 'Broadband', icon: 'IconWifi', color: '#0ea5e9' },
      {
        name: 'Subscriptions (music, TV, magazines...)',
        icon: 'IconCreditCard',
        color: '#0ea5e9',
      },
    ],
  },
  {
    name: 'Transport',
    icon: 'IconCar',
    color: '#64748b',
    subcategories: [
      { name: 'Petrol', icon: 'IconGasStation', color: '#64748b' },
      { name: 'Insurance', icon: 'IconShield', color: '#64748b' },
      { name: 'Public transport', icon: 'IconBus', color: '#64748b' },
      { name: 'Parking', icon: 'IconParking', color: '#64748b' },
      {
        name: 'Fines and penalties',
        icon: 'IconAlertTriangle',
        color: '#64748b',
      },
      { name: 'New car', icon: 'IconCar', color: '#64748b' },
      { name: 'Taxis or Vehicle hire', icon: 'IconCar', color: '#64748b' },
      {
        name: 'Service / Parts / Repairs',
        icon: 'IconTools',
        color: '#64748b',
      },
      { name: 'Tax', icon: 'IconReceipt', color: '#64748b' },
    ],
  },
  {
    name: 'Kids and family',
    icon: 'IconBabyCarriage',
    color: '#ec4899',
    subcategories: [
      { name: 'School fees', icon: 'IconSchool', color: '#ec4899' },
      {
        name: 'School equipment and materials',
        icon: 'IconPencil',
        color: '#ec4899',
      },
      { name: 'Family Activities', icon: 'IconUsers', color: '#ec4899' },
      { name: 'Family day out', icon: 'IconMap', color: '#ec4899' },
      {
        name: 'Nursery/Childminder/Nannies',
        icon: 'IconHome',
        color: '#ec4899',
      },
      { name: 'Club membership', icon: 'IconUsers', color: '#ec4899' },
      { name: 'Clothes and shoes', icon: 'IconShirt', color: '#ec4899' },
      { name: 'Toys', icon: 'IconStar', color: '#ec4899' },
      { name: 'Gifts/Parties', icon: 'IconGift', color: '#ec4899' },
    ],
  },
  {
    name: 'Dinning or going out',
    icon: 'IconToolsKitchen2',
    color: '#d97706',
    subcategories: [
      { name: 'Lunch + Snacks + Coffee', icon: 'IconCoffee', color: '#d97706' },
      {
        name: 'Meal Deals + Work Lunches',
        icon: 'IconToolsKitchen2',
        color: '#d97706',
      },
      { name: 'Restaurants', icon: 'IconBuildingStore', color: '#d97706' },
      { name: 'Take Away', icon: 'IconPackage', color: '#d97706' },
    ],
  },
  {
    name: 'Health and fitness and beauty',
    icon: 'IconHeart',
    color: '#e11d48',
    subcategories: [
      { name: 'Insurance', icon: 'IconShield', color: '#e11d48' },
      { name: 'Dental treatment', icon: 'IconStethoscope', color: '#e11d48' },
      { name: 'Eye care', icon: 'IconEye', color: '#e11d48' },
      { name: 'Medical treatment', icon: 'IconStethoscope', color: '#e11d48' },
      { name: 'Medication', icon: 'IconPill', color: '#e11d48' },
      {
        name: 'Physiotherapy / Chiropractic',
        icon: 'IconActivity',
        color: '#e11d48',
      },
      { name: 'Personal care / Other', icon: 'IconSparkles', color: '#e11d48' },
      { name: 'Beauty treatment', icon: 'IconSparkles', color: '#e11d48' },
      { name: 'Hairdressing', icon: 'IconScissors', color: '#e11d48' },
    ],
  },
  {
    name: 'Clothes and shoes',
    icon: 'IconShirt',
    color: '#a855f7',
    subcategories: [
      { name: 'Designer clothes', icon: 'IconDiamond', color: '#a855f7' },
      {
        name: 'Everyday or work clothes',
        icon: 'IconShirt',
        color: '#a855f7',
      },
      { name: 'Shoes', icon: 'IconWalk', color: '#a855f7' },
      { name: 'Accessories', icon: 'IconTag', color: '#a855f7' },
      { name: 'Jewelry', icon: 'IconDiamond', color: '#a855f7' },
    ],
  },
  {
    name: 'University and education',
    icon: 'IconSchool',
    color: '#0284c7',
    subcategories: [
      { name: 'Fees', icon: 'IconReceipt', color: '#0284c7' },
      { name: 'Materials', icon: 'IconBook', color: '#0284c7' },
    ],
  },
  {
    name: 'Holidays',
    icon: 'IconPlane',
    color: '#0d9488',
    subcategories: [
      { name: 'Hotel / B&B', icon: 'IconBed', color: '#0d9488' },
      { name: 'Parking + Transport', icon: 'IconCar', color: '#0d9488' },
      { name: 'Flights', icon: 'IconPlane', color: '#0d9488' },
    ],
  },
  {
    name: 'Savings and investments',
    icon: 'IconPigMoney',
    color: '#16a34a',
    subcategories: [
      { name: 'General savings', icon: 'IconPigMoney', color: '#16a34a' },
      { name: 'Investments', icon: 'IconTrendingUp', color: '#16a34a' },
    ],
  },
  {
    name: 'Repayments',
    icon: 'IconCreditCard',
    color: '#dc2626',
    subcategories: [
      { name: 'Loan', icon: 'IconCash', color: '#dc2626' },
      { name: 'Credit card', icon: 'IconCreditCard', color: '#dc2626' },
    ],
  },
  {
    name: 'One-off or Miscellaneous',
    icon: 'IconDots',
    color: '#94a3b8',
    subcategories: [
      { name: 'Banking charges', icon: 'IconBuildingBank', color: '#94a3b8' },
      { name: 'Tax payment', icon: 'IconReceipt', color: '#94a3b8' },
      { name: 'Miscellaneous', icon: 'IconDots', color: '#94a3b8' },
    ],
  },
];
