import { AutoSizeModalSheet } from "@/components/ModalSheet/AutoSizeModalSheet";
import { ModalSheet } from "@/components/ModalSheet/ModalSheet";
import { useAccount } from "@/features/accounts/useAccounts";
import { useInstitution } from "@/features/institutions/useInstitutions";
import { useTransaction } from "@/features/transactions/useTransactions";
import { Money } from "@guallet/money";
import {
  Avatar,
  Divider,
  Label,
  PrimaryButton,
  Spacing,
  ValueRow,
} from "@guallet/ui-react-native";
import dayjs from "dayjs";
import { Stack, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
import { TextInput } from "react-native-gesture-handler";

var localizedFormat = require("dayjs/plugin/localizedFormat");
dayjs.extend(localizedFormat);

export default function TransactionDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { transaction } = useTransaction(id);
  const { account } = useAccount(transaction?.accountId ?? "");
  const { institution } = useInstitution(account?.institutionId ?? "");

  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  const money =
    transaction &&
    Money.fromCurrencyCode({
      currencyCode: transaction.currency,
      amount: transaction.amount,
    });

  return (
    <View>
      <Stack.Screen
        options={{
          title: "Transaction details",
          headerTitleAlign: "center",
        }}
      />
      <View>
        <View
          style={{
            flexDirection: "row",
            padding: Spacing.medium,
          }}
        >
          <Avatar imageUrl={institution?.image_src} size={40} />
          <View
            style={{
              flexDirection: "column",
              paddingHorizontal: Spacing.medium,
            }}
          >
            <Label
              style={{
                fontWeight: "bold",
                fontSize: 16,
              }}
            >
              {money?.format()}
            </Label>
            <Label>{dayjs(transaction?.date).format("LL")}</Label>
          </View>
        </View>

        <Label
          style={{
            padding: Spacing.medium,
            fontSize: 20,
            fontWeight: "bold",
            alignSelf: "center",
          }}
        >
          {transaction?.description}
        </Label>

        <Divider style={{ margin: 20 }} />
        <ValueRow
          title="Account"
          value={account?.name ?? "Unknown account"}
          showDivider={false}
        />
        {institution && (
          <ValueRow
            title="Institution"
            value={institution?.name ?? ""}
            showDivider={false}
          />
        )}

        <ValueRow
          title="Category"
          value={transaction?.categoryId ?? "Unknown"}
          showDivider={false}
          rightIconName="pen-to-square"
          onClick={() => {
            setIsCategoryModalOpen(true);
          }}
        />

        <ValueRow
          title="Notes"
          value={transaction?.notes ?? "Add notes"}
          showDivider={false}
          rightIconName="pen-to-square"
          onClick={() => {
            setIsNotesModalOpen(true);
          }}
        />
      </View>

      {/* MODALS */}
      <ModalSheet
        title="Edit category"
        isOpen={isCategoryModalOpen}
        onClose={() => {
          setIsCategoryModalOpen(false);
        }}
      >
        <View>
          <Label>Category</Label>
        </View>
      </ModalSheet>

      <AutoSizeModalSheet
        title="Edit notes"
        isOpen={isNotesModalOpen}
        onClose={() => {
          setIsNotesModalOpen(false);
        }}
      >
        <View
          style={{
            margin: Spacing.small,
          }}
        >
          <TextInput
            style={{
              height: 150,
              borderWidth: 1,
              padding: Spacing.medium,
              flexGrow: 1,
              marginBottom: Spacing.medium,
            }}
            multiline
            inputMode="text"
            textAlignVertical="top"
            maxLength={256}
          />
          <View
            style={{
              padding: 10,
              flexGrow: 1,
              flexDirection: "column",
            }}
          >
            <PrimaryButton
              title="Save"
              onClick={() => {
                // Save the notes
                setIsNotesModalOpen(false);
              }}
            />
          </View>
        </View>
      </AutoSizeModalSheet>
    </View>
  );
}
