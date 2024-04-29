export type CategoryIcon = 'salary' | 'money';

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
    icon: 'money',
    color: randomColor(),
    subcategories: [
      { name: 'Salary', icon: 'salary', color: randomColor() },
      { name: 'Bonus', icon: 'salary', color: randomColor() },
      { name: 'Interest', icon: 'salary', color: randomColor() },
      { name: 'Investments', icon: 'salary', color: randomColor() },
      { name: 'Dividends', icon: 'salary', color: randomColor() },
      { name: 'Rewards/Cashback', icon: 'salary', color: randomColor() },
      { name: 'Benefits', icon: 'salary', color: randomColor() },
      { name: 'Gifts', icon: 'salary', color: randomColor() },
      { name: 'Refunded purchase', icon: 'salary', color: randomColor() },
      { name: 'Sale', icon: 'salary', color: randomColor() },
      { name: 'Tax refund', icon: 'salary', color: randomColor() },
      { name: 'Loan', icon: 'salary', color: randomColor() },
      { name: 'Pension', icon: 'salary', color: randomColor() },
    ],
  },
  {
    name: 'Transfer',
    icon: 'money',
    color: randomColor(),
    subcategories: [
      { name: 'Outside Guallet', icon: 'salary', color: randomColor() },
    ],
  },
  {
    name: 'Enjoyment',
    icon: 'money',
    color: randomColor(),
    subcategories: [
      { name: 'Videogames', icon: 'salary', color: randomColor() },
      { name: 'Cinema', icon: 'salary', color: randomColor() },
      {
        name: 'Books/Magazines/Newspapers',
        icon: 'salary',
        color: randomColor(),
      },
      {
        name: 'Software and mobile apps',
        icon: 'salary',
        color: randomColor(),
      },
      { name: 'Music', icon: 'salary', color: randomColor() },
      { name: 'Personal electronics', icon: 'salary', color: randomColor() },
      { name: 'TV/Movies packages', icon: 'salary', color: randomColor() },
      { name: 'Birthday party', icon: 'salary', color: randomColor() },
      { name: 'Charity', icon: 'salary', color: randomColor() },
      { name: 'Gifts and presents', icon: 'salary', color: randomColor() },
      { name: 'Flowers', icon: 'salary', color: randomColor() },
    ],
  },
  {
    name: 'Hobbies and activities',
    icon: 'money',
    color: randomColor(),
    subcategories: [
      { name: 'Art supplies', icon: 'salary', color: randomColor() },
      {
        name: 'Books & Course materials',
        icon: 'salary',
        color: randomColor(),
      },
      { name: 'Course  Tuition fees', icon: 'salary', color: randomColor() },
      { name: 'Gambling', icon: 'salary', color: randomColor() },
      {
        name: 'Gym membership and equipment',
        icon: 'salary',
        color: randomColor(),
      },
      { name: 'Hobbies materials', icon: 'salary', color: randomColor() },
      { name: 'Musical equipment', icon: 'salary', color: randomColor() },
      { name: 'Personal training', icon: 'salary', color: randomColor() },
      { name: 'Photography', icon: 'salary', color: randomColor() },
      { name: 'Sports equipment', icon: 'salary', color: randomColor() },
      {
        name: 'Stationery & consumables',
        icon: 'salary',
        color: randomColor(),
      },
    ],
  },
  {
    name: 'Housing',
    icon: 'money',
    color: randomColor(),
    subcategories: [
      { name: 'Rent/Mortgage', icon: 'salary', color: randomColor() },
      { name: 'Ground rent', icon: 'salary', color: randomColor() },
      { name: 'Service Charge', icon: 'salary', color: randomColor() },
      { name: 'DYI / Repairs', icon: 'salary', color: randomColor() },
      { name: 'Insurance', icon: 'salary', color: randomColor() },
    ],
  },
  {
    name: 'Household',
    icon: 'money',
    color: randomColor(),
    subcategories: [
      { name: 'Home electronics', icon: 'salary', color: randomColor() },
      { name: 'Kitchen appliances', icon: 'salary', color: randomColor() },
      {
        name: 'Food, Groceries, household',
        icon: 'salary',
        color: randomColor(),
      },
      { name: 'Furniture', icon: 'salary', color: randomColor() },
      { name: 'Garden', icon: 'salary', color: randomColor() },
    ],
  },
  {
    name: 'Bills and subscriptions',
    icon: 'money',
    color: randomColor(),
    subcategories: [
      { name: 'Council Tax', icon: 'salary', color: randomColor() },
      { name: 'Water', icon: 'salary', color: randomColor() },
      {
        name: 'Electricity (Gas/Energy/Other)',
        icon: 'salary',
        color: randomColor(),
      },
      { name: 'Phone', icon: 'salary', color: randomColor() },
      { name: 'Broadband', icon: 'salary', color: randomColor() },
      {
        name: 'Subscriptions (music, TV, magazines...)',
        icon: 'salary',
        color: randomColor(),
      },
    ],
  },
  {
    name: 'Transport',
    icon: 'money',
    color: randomColor(),
    subcategories: [
      { name: 'Petrol', icon: 'salary', color: randomColor() },
      { name: 'Insurance', icon: 'salary', color: randomColor() },
      { name: 'Public transport', icon: 'salary', color: randomColor() },
      { name: 'Parking', icon: 'salary', color: randomColor() },
      { name: 'Fines and penalties', icon: 'salary', color: randomColor() },
      { name: 'New car', icon: 'salary', color: randomColor() },
      { name: 'Taxis or Vehicle hire', icon: 'salary', color: randomColor() },
      {
        name: 'Service / Parts / Repairs',
        icon: 'salary',
        color: randomColor(),
      },
      { name: 'Tax', icon: 'salary', color: randomColor() },
    ],
  },
  {
    name: 'Kids and family',
    icon: 'money',
    color: randomColor(),
    subcategories: [
      { name: 'School fees', icon: 'salary', color: randomColor() },
      {
        name: 'School equipment and materials',
        icon: 'salary',
        color: randomColor(),
      },
      { name: 'Family Activities', icon: 'salary', color: randomColor() },
      { name: 'Family day out', icon: 'salary', color: randomColor() },
      {
        name: 'Nursery/Childminder/Nannies',
        icon: 'salary',
        color: randomColor(),
      },
      { name: 'Club membership', icon: 'salary', color: randomColor() },
      { name: 'Clothes and shoes', icon: 'salary', color: randomColor() },
      { name: 'Toys', icon: 'salary', color: randomColor() },
      { name: 'Gifts/Parties', icon: 'salary', color: randomColor() },
    ],
  },
  {
    name: 'Dinning or going out',
    icon: 'money',
    color: randomColor(),
    subcategories: [
      { name: 'Lunch + Snacks + Coffee', icon: 'salary', color: randomColor() },
      {
        name: 'Meal Deals + Work Lunches',
        icon: 'salary',
        color: randomColor(),
      },
      { name: 'Restaurants', icon: 'salary', color: randomColor() },
      { name: 'Take Away', icon: 'salary', color: randomColor() },
    ],
  },
  {
    name: 'Health and fitness and beauty',
    icon: 'money',
    color: randomColor(),
    subcategories: [
      { name: 'Insurance', icon: 'salary', color: randomColor() },
      { name: 'Dental treatment', icon: 'salary', color: randomColor() },
      { name: 'Eye care', icon: 'salary', color: randomColor() },
      { name: 'Medical treatment', icon: 'salary', color: randomColor() },
      { name: 'Medication', icon: 'salary', color: randomColor() },
      {
        name: 'Physiotherapy / Chiropractic',
        icon: 'salary',
        color: randomColor(),
      },
      { name: 'Personal care / Other', icon: 'salary', color: randomColor() },
      { name: 'Beauty treatment', icon: 'salary', color: randomColor() },
      { name: 'Hairdressing', icon: 'salary', color: randomColor() },
    ],
  },
  {
    name: 'Clothes and shoes',
    icon: 'money',
    color: randomColor(),
    subcategories: [
      { name: 'Designer clothes', icon: 'salary', color: randomColor() },
      {
        name: 'Everyday or work clothes',
        icon: 'salary',
        color: randomColor(),
      },
      { name: 'Shoes', icon: 'salary', color: randomColor() },
      { name: 'Accessories', icon: 'salary', color: randomColor() },
      { name: 'Jewelry', icon: 'salary', color: randomColor() },
    ],
  },
  {
    name: 'University and education',
    icon: 'money',
    color: randomColor(),
    subcategories: [
      { name: 'Fees', icon: 'salary', color: randomColor() },
      { name: 'Materials', icon: 'salary', color: randomColor() },
    ],
  },
  {
    name: 'Holidays',
    icon: 'money',
    color: randomColor(),
    subcategories: [
      { name: 'Hotel / B&B', icon: 'salary', color: randomColor() },
      { name: 'Parking + Transport', icon: 'salary', color: randomColor() },
      { name: 'Flights', icon: 'salary', color: randomColor() },
    ],
  },
  {
    name: 'Savings and investments',
    icon: 'money',
    color: randomColor(),
    subcategories: [
      { name: 'General savings', icon: 'salary', color: randomColor() },
      { name: 'Investments', icon: 'salary', color: randomColor() },
    ],
  },
  {
    name: 'Repayments',
    icon: 'money',
    color: randomColor(),
    subcategories: [
      { name: 'Loan', icon: 'salary', color: randomColor() },
      { name: 'Credit card', icon: 'salary', color: randomColor() },
    ],
  },
  {
    name: 'One-off or Miscellaneous',
    icon: 'money',
    color: randomColor(),
    subcategories: [
      { name: 'Banking charges', icon: 'salary', color: randomColor() },
      { name: 'Tax payment', icon: 'salary', color: randomColor() },
      { name: 'Miscellaneous', icon: 'salary', color: randomColor() },
    ],
  },
  {
    name: 'Business',
    icon: 'money',
    color: randomColor(),
    subcategories: [
      { name: 'Avocados', icon: 'salary', color: randomColor() },
      { name: 'Digital Aspen', icon: 'salary', color: randomColor() },
      { name: 'Mandarina', icon: 'salary', color: randomColor() },
      { name: 'The Nordic Bear', icon: 'salary', color: randomColor() },
      { name: 'Guallet', icon: 'salary', color: randomColor() },
    ],
  },
  {
    name: 'Casas',
    icon: 'money',
    color: randomColor(),
    subcategories: [
      { name: 'Enterprise Place', icon: 'salary', color: randomColor() },
      { name: 'Hawthorn Road', icon: 'salary', color: randomColor() },
      { name: 'Piso Villasol', icon: 'salary', color: randomColor() },
      { name: 'Holmes Close', icon: 'salary', color: randomColor() },
    ],
  },
];
