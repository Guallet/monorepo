export type CategoryIcon = 'wallet' | 'coins';

const randomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

class Category {
  name: string;
  icon: CategoryIcon;
  color: string;
  subcategories: SubCategory[];

  constructor(args: {
    name: string;
    icon: CategoryIcon;
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
  icon: CategoryIcon;
  color: string;

  constructor(args: { name: string; icon: CategoryIcon; color: string }) {
    this.name = args.name;
    this.icon = args.icon;
    this.color = args.color;
  }
}

export const defaultCategories: Category[] = [
  {
    name: 'Income',
    icon: 'coins',
    color: randomColor(),
    subcategories: [
      { name: 'Salary', icon: 'wallet', color: randomColor() },
      { name: 'Bonus', icon: 'wallet', color: randomColor() },
      { name: 'Interest', icon: 'wallet', color: randomColor() },
      { name: 'Investments', icon: 'wallet', color: randomColor() },
      { name: 'Dividends', icon: 'wallet', color: randomColor() },
      { name: 'Rewards/Cashback', icon: 'wallet', color: randomColor() },
      { name: 'Benefits', icon: 'wallet', color: randomColor() },
      { name: 'Gifts', icon: 'wallet', color: randomColor() },
      { name: 'Refunded purchase', icon: 'wallet', color: randomColor() },
      { name: 'Sale', icon: 'wallet', color: randomColor() },
      { name: 'Tax refund', icon: 'wallet', color: randomColor() },
      { name: 'Loan', icon: 'wallet', color: randomColor() },
      { name: 'Pension', icon: 'wallet', color: randomColor() },
    ],
  },
  {
    name: 'Transfer',
    icon: 'coins',
    color: randomColor(),
    subcategories: [
      { name: 'Outside Guallet', icon: 'wallet', color: randomColor() },
    ],
  },
  {
    name: 'Enjoyment',
    icon: 'coins',
    color: randomColor(),
    subcategories: [
      { name: 'Videogames', icon: 'wallet', color: randomColor() },
      { name: 'Cinema', icon: 'wallet', color: randomColor() },
      {
        name: 'Books/Magazines/Newspapers',
        icon: 'wallet',
        color: randomColor(),
      },
      {
        name: 'Software and mobile apps',
        icon: 'wallet',
        color: randomColor(),
      },
      { name: 'Music', icon: 'wallet', color: randomColor() },
      { name: 'Personal electronics', icon: 'wallet', color: randomColor() },
      { name: 'TV/Movies packages', icon: 'wallet', color: randomColor() },
      { name: 'Birthday party', icon: 'wallet', color: randomColor() },
      { name: 'Charity', icon: 'wallet', color: randomColor() },
      { name: 'Gifts and presents', icon: 'wallet', color: randomColor() },
      { name: 'Flowers', icon: 'wallet', color: randomColor() },
    ],
  },
  {
    name: 'Hobbies and activities',
    icon: 'coins',
    color: randomColor(),
    subcategories: [
      { name: 'Art supplies', icon: 'wallet', color: randomColor() },
      {
        name: 'Books & Course materials',
        icon: 'wallet',
        color: randomColor(),
      },
      { name: 'Course  Tuition fees', icon: 'wallet', color: randomColor() },
      { name: 'Gambling', icon: 'wallet', color: randomColor() },
      {
        name: 'Gym membership and equipment',
        icon: 'wallet',
        color: randomColor(),
      },
      { name: 'Hobbies materials', icon: 'wallet', color: randomColor() },
      { name: 'Musical equipment', icon: 'wallet', color: randomColor() },
      { name: 'Personal training', icon: 'wallet', color: randomColor() },
      { name: 'Photography', icon: 'wallet', color: randomColor() },
      { name: 'Sports equipment', icon: 'wallet', color: randomColor() },
      {
        name: 'Stationery & consumables',
        icon: 'wallet',
        color: randomColor(),
      },
    ],
  },
  {
    name: 'Housing',
    icon: 'coins',
    color: randomColor(),
    subcategories: [
      { name: 'Rent/Mortgage', icon: 'wallet', color: randomColor() },
      { name: 'Ground rent', icon: 'wallet', color: randomColor() },
      { name: 'Service Charge', icon: 'wallet', color: randomColor() },
      { name: 'DYI / Repairs', icon: 'wallet', color: randomColor() },
      { name: 'Insurance', icon: 'wallet', color: randomColor() },
    ],
  },
  {
    name: 'Household',
    icon: 'coins',
    color: randomColor(),
    subcategories: [
      { name: 'Home electronics', icon: 'wallet', color: randomColor() },
      { name: 'Kitchen appliances', icon: 'wallet', color: randomColor() },
      {
        name: 'Food, Groceries, household',
        icon: 'wallet',
        color: randomColor(),
      },
      { name: 'Furniture', icon: 'wallet', color: randomColor() },
      { name: 'Garden', icon: 'wallet', color: randomColor() },
    ],
  },
  {
    name: 'Bills and subscriptions',
    icon: 'coins',
    color: randomColor(),
    subcategories: [
      { name: 'Council Tax', icon: 'wallet', color: randomColor() },
      { name: 'Water', icon: 'wallet', color: randomColor() },
      {
        name: 'Electricity (Gas/Energy/Other)',
        icon: 'wallet',
        color: randomColor(),
      },
      { name: 'Phone', icon: 'wallet', color: randomColor() },
      { name: 'Broadband', icon: 'wallet', color: randomColor() },
      {
        name: 'Subscriptions (music, TV, magazines...)',
        icon: 'wallet',
        color: randomColor(),
      },
    ],
  },
  {
    name: 'Transport',
    icon: 'coins',
    color: randomColor(),
    subcategories: [
      { name: 'Petrol', icon: 'wallet', color: randomColor() },
      { name: 'Insurance', icon: 'wallet', color: randomColor() },
      { name: 'Public transport', icon: 'wallet', color: randomColor() },
      { name: 'Parking', icon: 'wallet', color: randomColor() },
      { name: 'Fines and penalties', icon: 'wallet', color: randomColor() },
      { name: 'New car', icon: 'wallet', color: randomColor() },
      { name: 'Taxis or Vehicle hire', icon: 'wallet', color: randomColor() },
      {
        name: 'Service / Parts / Repairs',
        icon: 'wallet',
        color: randomColor(),
      },
      { name: 'Tax', icon: 'wallet', color: randomColor() },
    ],
  },
  {
    name: 'Kids and family',
    icon: 'coins',
    color: randomColor(),
    subcategories: [
      { name: 'School fees', icon: 'wallet', color: randomColor() },
      {
        name: 'School equipment and materials',
        icon: 'wallet',
        color: randomColor(),
      },
      { name: 'Family Activities', icon: 'wallet', color: randomColor() },
      { name: 'Family day out', icon: 'wallet', color: randomColor() },
      {
        name: 'Nursery/Childminder/Nannies',
        icon: 'wallet',
        color: randomColor(),
      },
      { name: 'Club membership', icon: 'wallet', color: randomColor() },
      { name: 'Clothes and shoes', icon: 'wallet', color: randomColor() },
      { name: 'Toys', icon: 'wallet', color: randomColor() },
      { name: 'Gifts/Parties', icon: 'wallet', color: randomColor() },
    ],
  },
  {
    name: 'Dinning or going out',
    icon: 'coins',
    color: randomColor(),
    subcategories: [
      { name: 'Lunch + Snacks + Coffee', icon: 'wallet', color: randomColor() },
      {
        name: 'Meal Deals + Work Lunches',
        icon: 'wallet',
        color: randomColor(),
      },
      { name: 'Restaurants', icon: 'wallet', color: randomColor() },
      { name: 'Take Away', icon: 'wallet', color: randomColor() },
    ],
  },
  {
    name: 'Health and fitness and beauty',
    icon: 'coins',
    color: randomColor(),
    subcategories: [
      { name: 'Insurance', icon: 'wallet', color: randomColor() },
      { name: 'Dental treatment', icon: 'wallet', color: randomColor() },
      { name: 'Eye care', icon: 'wallet', color: randomColor() },
      { name: 'Medical treatment', icon: 'wallet', color: randomColor() },
      { name: 'Medication', icon: 'wallet', color: randomColor() },
      {
        name: 'Physiotherapy / Chiropractic',
        icon: 'wallet',
        color: randomColor(),
      },
      { name: 'Personal care / Other', icon: 'wallet', color: randomColor() },
      { name: 'Beauty treatment', icon: 'wallet', color: randomColor() },
      { name: 'Hairdressing', icon: 'wallet', color: randomColor() },
    ],
  },
  {
    name: 'Clothes and shoes',
    icon: 'coins',
    color: randomColor(),
    subcategories: [
      { name: 'Designer clothes', icon: 'wallet', color: randomColor() },
      {
        name: 'Everyday or work clothes',
        icon: 'wallet',
        color: randomColor(),
      },
      { name: 'Shoes', icon: 'wallet', color: randomColor() },
      { name: 'Accessories', icon: 'wallet', color: randomColor() },
      { name: 'Jewelry', icon: 'wallet', color: randomColor() },
    ],
  },
  {
    name: 'University and education',
    icon: 'coins',
    color: randomColor(),
    subcategories: [
      { name: 'Fees', icon: 'wallet', color: randomColor() },
      { name: 'Materials', icon: 'wallet', color: randomColor() },
    ],
  },
  {
    name: 'Holidays',
    icon: 'coins',
    color: randomColor(),
    subcategories: [
      { name: 'Hotel / B&B', icon: 'wallet', color: randomColor() },
      { name: 'Parking + Transport', icon: 'wallet', color: randomColor() },
      { name: 'Flights', icon: 'wallet', color: randomColor() },
    ],
  },
  {
    name: 'Savings and investments',
    icon: 'coins',
    color: randomColor(),
    subcategories: [
      { name: 'General savings', icon: 'wallet', color: randomColor() },
      { name: 'Investments', icon: 'wallet', color: randomColor() },
    ],
  },
  {
    name: 'Repayments',
    icon: 'coins',
    color: randomColor(),
    subcategories: [
      { name: 'Loan', icon: 'wallet', color: randomColor() },
      { name: 'Credit card', icon: 'wallet', color: randomColor() },
    ],
  },
  {
    name: 'One-off or Miscellaneous',
    icon: 'coins',
    color: randomColor(),
    subcategories: [
      { name: 'Banking charges', icon: 'wallet', color: randomColor() },
      { name: 'Tax payment', icon: 'wallet', color: randomColor() },
      { name: 'Miscellaneous', icon: 'wallet', color: randomColor() },
    ],
  },
  {
    name: 'Business',
    icon: 'coins',
    color: randomColor(),
    subcategories: [
      { name: 'Avocados', icon: 'wallet', color: randomColor() },
      { name: 'Digital Aspen', icon: 'wallet', color: randomColor() },
      { name: 'Mandarina', icon: 'wallet', color: randomColor() },
      { name: 'The Nordic Bear', icon: 'wallet', color: randomColor() },
      { name: 'Guallet', icon: 'wallet', color: randomColor() },
    ],
  },
  {
    name: 'Casas',
    icon: 'coins',
    color: randomColor(),
    subcategories: [
      { name: 'Enterprise Place', icon: 'wallet', color: randomColor() },
      { name: 'Hawthorn Road', icon: 'wallet', color: randomColor() },
      { name: 'Piso Villasol', icon: 'wallet', color: randomColor() },
      { name: 'Holmes Close', icon: 'wallet', color: randomColor() },
    ],
  },
];
