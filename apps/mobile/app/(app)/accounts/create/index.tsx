import { AccountTypeDto } from "@guallet/api-client";
import { Currency } from "@guallet/money";
import { Redirect } from "expo-router";
import { atom } from "jotai";

export type CreateAccountFlowState = {
  accountName: string;
  accountType: AccountTypeDto;
  currency: Currency;
  balance: number;
};

export const createAccountAtom = atom<CreateAccountFlowState>({
  accountName: "",
  accountType: AccountTypeDto.CURRENT_ACCOUNT,
  currency: Currency.fromISOCode("GBP"),
  balance: 0,
});

export default function CreateAccountScree() {
  return <Redirect href="/(app)/accounts/create/name" />;
}
