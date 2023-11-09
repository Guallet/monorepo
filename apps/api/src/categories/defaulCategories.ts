export type CategoryIcon = 'salary' | 'money';

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
    color: '#4caf50',
    subcategories: [
      { name: 'Salary', icon: 'salary', color: '#4caf50' },
      { name: 'Bonus', icon: 'salary', color: '#4caf50' },
      { name: 'Interest', icon: 'salary', color: '#4caf50' },
      { name: 'Investments', icon: 'salary', color: '#4caf50' },
      { name: 'Dividends', icon: 'salary', color: '#4caf50' },
      { name: 'Rewards/Cashback', icon: 'salary', color: '#4caf50' },
      { name: 'Benefits', icon: 'salary', color: '#4caf50' },
      { name: 'Gifts', icon: 'salary', color: '#4caf50' },
      { name: 'Refunded purchase', icon: 'salary', color: '#4caf50' },
      { name: 'Sale', icon: 'salary', color: '#4caf50' },
      { name: 'Tax refund', icon: 'salary', color: '#4caf50' },
      { name: 'Loan', icon: 'salary', color: '#4caf50' },
      { name: 'Other', icon: 'salary', color: '#4caf50' },
    ],
  },
  {
    name: 'Transfer',
    icon: 'money',
    color: '#4caf50',
    subcategories: [
      { name: 'Outside Guallet', icon: 'salary', color: '#4caf50' },
    ],
  },
  {
    name: 'Housing',
    icon: 'money',
    color: '#4caf50',
    subcategories: [
      { name: 'Rent/Mortgage', icon: 'salary', color: '#4caf50' },
      { name: 'Ground rent', icon: 'salary', color: '#4caf50' },
      { name: 'Service Charge', icon: 'salary', color: '#4caf50' },
      { name: 'DYI / Repairs', icon: 'salary', color: '#4caf50' },
      { name: 'Insurance', icon: 'salary', color: '#4caf50' },
    ],
  },
  {
    name: 'Household',
    icon: 'money',
    color: '#4caf50',
    subcategories: [
      { name: 'Home electronics', icon: 'salary', color: '#4caf50' },
      { name: 'Kitchen appliances', icon: 'salary', color: '#4caf50' },
      { name: 'Food, Groceries, household', icon: 'salary', color: '#4caf50' },
      { name: 'Furniture', icon: 'salary', color: '#4caf50' },
      { name: 'Garden', icon: 'salary', color: '#4caf50' },
    ],
  },
  {
    name: 'Bills and subscriptions',
    icon: 'money',
    color: '#4caf50',
    subcategories: [
      { name: 'Council Tax', icon: 'salary', color: '#4caf50' },
      { name: 'Water', icon: 'salary', color: '#4caf50' },
      {
        name: 'Electricity (Gas/Energy/Other)',
        icon: 'salary',
        color: '#4caf50',
      },
      { name: 'Phone', icon: 'salary', color: '#4caf50' },
      { name: 'Broadband', icon: 'salary', color: '#4caf50' },
      {
        name: 'Subscriptions (music, TV, magazines...)',
        icon: 'salary',
        color: '#4caf50',
      },
    ],
  },
  {
    name: 'Transport',
    icon: 'money',
    color: '#4caf50',
    subcategories: [
      { name: 'Petrol', icon: 'salary', color: '#4caf50' },
      { name: 'Insurance', icon: 'salary', color: '#4caf50' },
      { name: 'Public transport', icon: 'salary', color: '#4caf50' },
      { name: 'Parking', icon: 'salary', color: '#4caf50' },
      { name: 'Fines and penalties', icon: 'salary', color: '#4caf50' },
      { name: 'New car', icon: 'salary', color: '#4caf50' },
      { name: 'Taxis or Vehicle hire', icon: 'salary', color: '#4caf50' },
      { name: 'Service / Parts / Repairs', icon: 'salary', color: '#4caf50' },
      { name: 'Tax', icon: 'salary', color: '#4caf50' },
    ],
  },
  {
    name: 'Kids and family',
    icon: 'money',
    color: '#4caf50',
    subcategories: [
      { name: 'School fees', icon: 'salary', color: '#4caf50' },
      {
        name: 'School equipment and materials',
        icon: 'salary',
        color: '#4caf50',
      },
      { name: 'Family Activities', icon: 'salary', color: '#4caf50' },
      { name: 'Nursery/Childminder/Nannies', icon: 'salary', color: '#4caf50' },
      { name: 'Club membership', icon: 'salary', color: '#4caf50' },
      { name: 'Clothes and shoes', icon: 'salary', color: '#4caf50' },
      { name: 'Toys', icon: 'salary', color: '#4caf50' },
      { name: 'Gifts/Parties', icon: 'salary', color: '#4caf50' },
    ],
  },
  {
    name: 'Dinning or going out',
    icon: 'money',
    color: '#4caf50',
    subcategories: [
      { name: 'Lunch + Snacks + Coffee', icon: 'salary', color: '#4caf50' },
      { name: 'Mean Deals + Work Lunches', icon: 'salary', color: '#4caf50' },
      { name: 'Restaurants', icon: 'salary', color: '#4caf50' },
      { name: 'Take Away', icon: 'salary', color: '#4caf50' },
    ],
  },
  {
    name: 'Health and fitness and beauty',
    icon: 'money',
    color: '#4caf50',
    subcategories: [
      { name: 'Insurance', icon: 'salary', color: '#4caf50' },
      { name: 'Dental treatment', icon: 'salary', color: '#4caf50' },
      { name: 'Eye care', icon: 'salary', color: '#4caf50' },
      { name: 'Medical treatment', icon: 'salary', color: '#4caf50' },
      { name: 'Medication', icon: 'salary', color: '#4caf50' },
      {
        name: 'Physiotherapy / Chiropractic',
        icon: 'salary',
        color: '#4caf50',
      },
      { name: 'Personal care / Other', icon: 'salary', color: '#4caf50' },
      { name: 'Beauty treatment', icon: 'salary', color: '#4caf50' },
      { name: 'Hairdressing', icon: 'salary', color: '#4caf50' },
    ],
  },
  {
    name: 'Clothes and shoes',
    icon: 'money',
    color: '#4caf50',
    subcategories: [
      { name: 'Designer clothes', icon: 'salary', color: '#4caf50' },
      { name: 'Everyday or work clothes', icon: 'salary', color: '#4caf50' },
      { name: 'Shoes', icon: 'salary', color: '#4caf50' },
      { name: 'Accessories', icon: 'salary', color: '#4caf50' },
      { name: 'Jewelry', icon: 'salary', color: '#4caf50' },
    ],
  },
  {
    name: 'University and education',
    icon: 'money',
    color: '#4caf50',
    subcategories: [
      { name: 'Fees', icon: 'salary', color: '#4caf50' },
      { name: 'Materials', icon: 'salary', color: '#4caf50' },
    ],
  },
  {
    name: 'Holidays',
    icon: 'money',
    color: '#4caf50',
    subcategories: [
      { name: 'Hotel / B&B', icon: 'salary', color: '#4caf50' },
      { name: 'Parking + Transport', icon: 'salary', color: '#4caf50' },
      { name: 'Flights', icon: 'salary', color: '#4caf50' },
    ],
  },
  {
    name: 'Transfer',
    icon: 'money',
    color: '#4caf50',
    subcategories: [
      { name: 'Outside', icon: 'salary', color: '#4caf50' },
      { name: 'Outside', icon: 'salary', color: '#4caf50' },
    ],
  },
  {
    name: 'Savings and investments',
    icon: 'money',
    color: '#4caf50',
    subcategories: [
      { name: 'General savings', icon: 'salary', color: '#4caf50' },
      { name: 'Investments', icon: 'salary', color: '#4caf50' },
    ],
  },
  {
    name: 'Repayments',
    icon: 'money',
    color: '#4caf50',
    subcategories: [
      { name: 'Loan', icon: 'salary', color: '#4caf50' },
      { name: 'Credit card', icon: 'salary', color: '#4caf50' },
    ],
  },
  {
    name: 'One-off or Miscellaneous',
    icon: 'money',
    color: '#4caf50',
    subcategories: [
      { name: 'Banking charges', icon: 'salary', color: '#4caf50' },
      { name: 'Tax payment', icon: 'salary', color: '#4caf50' },
      { name: 'Miscellaneous', icon: 'salary', color: '#4caf50' },
    ],
  },
];
