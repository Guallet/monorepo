// TODO: Move this to the server
import { Account } from "../../accounts/models/Account";
import { Transaction } from "../../transactions/models/Transaction";
import { Category } from "../models/Category";

export type CategoryRule = {
  id: string;
  order: number;
  name: string;
  description: string;
  conditions: RuleConditions[];
  resultCategory: Category;
};

// export type TransactionField =
//   | "description"
//   | "account"
//   | "amount"
//   | "currency"
//   | "date";

export const TransactionField = {
  DESCRIPTION: "description",
  ACCOUNT: "account",
  AMOUNT: "amount",
  CURRENCY: "currency",
  DATE: "date",
} as const;

export type TransactionFieldKeys = keyof typeof TransactionField;
export type TransactionFieldValues =
  (typeof TransactionField)[keyof typeof TransactionField];

export const RuleConditionsOperatorValues = [
  "equals",
  "not-equals",
  "contains",
  "not-contains",
] as const;
export type RuleConditionsOperator =
  (typeof RuleConditionsOperatorValues)[number];
// export type RuleConditionsOperator =
//   | "equals"
//   | "not-equals"
//   | "contains"
//   | "not-contains";
//   | "greater-than"
//   | "less-than"
//   | "greater-than-equals"
//   | "less-than-equals"
//   | "between"
//   | "not-between"
//   | "in"
//   | "not-in"
//   | "is-null"
//   | "is-not-null"
//   | "starts-with"
//   | "ends-with"
//   | "is-empty"
//   | "is-not-empty"
//   | "is-undefined"
//   | "is-not-undefined";

export type RuleConditions = {
  field: TransactionFieldValues;
  operator: RuleConditionsOperator;
  value: string;
};

export class RulesEngine {
  rules: CategoryRule[];
  userCategories: Category[];

  constructor(userCategories: Category[]) {
    this.userCategories = userCategories;

    this.rules = [
      {
        id: "1",
        order: 1,
        name: "Groceries",
        description:
          "All Sainsbury's, Lidl, Aldi, Asda or Tesco transactions are Groceries",
        conditions: [
          {
            field: "description",
            operator: "contains",
            value: "Sainsbury",
          },
          {
            field: "description",
            operator: "contains",
            value: "Aldi",
          },
          {
            field: "description",
            operator: "contains",
            value: "Asda",
          },
          {
            field: "description",
            operator: "contains",
            value: "Tesco",
          },
          {
            field: "description",
            operator: "contains",
            value: "Lidl",
          },
          {
            field: "description",
            operator: "not-contains",
            value: "petrol",
          },
          {
            field: "description",
            operator: "not-contains",
            value: "fuel",
          },
        ],
        resultCategory: this.userCategories.find((c) =>
          c.name.includes("Groceries")
        )!,
      },
      {
        id: "2",
        order: 2,
        name: "Petrol",
        description: "All fuel transactions are Petrol",
        conditions: [
          {
            field: "description",
            operator: "contains",
            value: "petrol",
          },
        ],
        resultCategory: this.userCategories.find((c) =>
          c.name.includes("Fuel")
        )!,
      },
      {
        id: "3",
        order: 4,
        name: "Fuel",
        description: "All fuel transactions are Fuel",
        conditions: [
          {
            field: "description",
            operator: "contains",
            value: "fuel",
          },
        ],
        resultCategory: this.userCategories.find((c) =>
          c.name.includes("Fuel")
        )!,
      },
      {
        id: "4",
        order: 5,
        name: "PERKS AT WORK",
        description: "All bills transactions are Bills",
        conditions: [
          {
            field: "description",
            operator: "contains",
            value: "PERKS AT WORK",
          },
        ],
        resultCategory: this.userCategories.find((c) =>
          c.name.includes("Bills")
        )!,
      },
      {
        id: "4",
        order: 5,
        name: "PERKS AT WORK - CORPORATE PERKS",
        description: "All coporate perks transactions are Groceries",
        conditions: [
          {
            field: "description",
            operator: "contains",
            value: "CORPORATE PERKS",
          },
        ],
        resultCategory: this.userCategories.find((c) =>
          c.name.includes("Groceries")
        )!,
      },
    ];
  }

  getIsValidFieldType(
    field: TransactionFieldValues,
    value: string | number | Date | Account | null
  ): boolean {
    switch (field) {
      case "description":
      case "currency":
        return typeof value === "string";
      case "amount":
        return typeof value === "number";
      case "date":
        return value instanceof Date;
      case "account":
        return (value as Account) !== null && typeof value === "object";
      default:
        return false;
    }
  }

  getCategoryForTransaction(transaction: Transaction): Category | null {
    let category = null;

    this.rules
      .sort((a, b) => a.order - b.order)
      .forEach((rule) => {
        const match = rule.conditions.every((condition) => {
          const value = transaction[condition.field];

          const isValidFieldType = this.getIsValidFieldType(
            condition.field,
            value
          );
          if (isValidFieldType === false) {
            throw Error("Invalid field type for the condition");
          }

          const conditionValue = condition.value;
          switch (condition.operator) {
            case "equals":
              if (typeof value === "string") {
                return value
                  .toLowerCase()
                  .includes(conditionValue.toLowerCase());
              } else if (typeof value === "number") {
                return value === Number(conditionValue);
              } else if ((value as Account) !== null) {
                const account = value as Account;
                return account?.id === conditionValue;
              } else if (value instanceof Date) {
                const date = new Date(conditionValue);
                return value === date;
              } else {
                return false;
              }
            case "not-equals":
              if (typeof value === "string") {
                return (
                  value.toLowerCase().includes(conditionValue.toLowerCase()) ===
                  false
                );
              } else if (typeof value === "number") {
                return value !== Number(conditionValue);
              } else if ((value as Account) !== null) {
                const account = value as Account;
                return account?.id !== conditionValue;
              } else if (value instanceof Date) {
                const date = new Date(conditionValue);
                return value !== date;
              } else {
                return false;
              }

            case "contains":
              if (value && typeof value === "string") {
                return value
                  .toLowerCase()
                  .includes(conditionValue.toLowerCase());
              } else {
                return false;
              }
            case "not-contains":
              if (value && typeof value === "string") {
                return !value
                  .toLowerCase()
                  .includes(conditionValue.toLowerCase());
              } else {
                return false;
              }
            default:
              return false;
          }
        });
        if (match) {
          console.log(
            `Matched rule ${rule.name} for transaction ${transaction.description}`
          );
          category = rule.resultCategory;
          return category;
        }
      });

    return category;
  }
}
