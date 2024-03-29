import { AccountTypeDto } from "@guallet/api-client";
import { Currency } from "@guallet/money";
import { Redirect } from "expo-router";
import { atom } from "jotai";

export type CreateAccountFlowState = {
  accountName: string;
  accountType: AccountTypeDto | null;
  currency: Currency | null;
  balance: number;
};

export const initialCreateAccountFlowState: CreateAccountFlowState = {
  accountName: "",
  accountType: null, // AccountTypeDto.CURRENT_ACCOUNT,
  currency: null, //Currency.fromISOCode("GBP"),
  balance: 0,
};

export const createAccountAtom = atom<CreateAccountFlowState>(
  initialCreateAccountFlowState
);

export default function CreateAccountScree() {
  return <Redirect href="/(app)/accounts/create/name" />;
}
