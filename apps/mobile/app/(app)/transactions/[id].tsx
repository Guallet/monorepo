import { AutoSizeModalSheet } from "@/components/ModalSheet/AutoSizeModalSheet";
import { ModalSheet } from "@/components/ModalSheet/ModalSheet";
import { useAccount } from "@/features/accounts/useAccounts";
import { useInstitution } from "@/features/institutions/useInstitutions";
import { useTransactionMutations } from "@/features/transactions/useTransactionMutations";
import { useTransaction } from "@/features/transactions/useTransactions";
import { Money } from "@guallet/money";
import {
  Avatar,
  DangerButton,
  Divider,
  Label,
  PrimaryButton,
  SecondaryButton,
  Spacing,
  ValueRow,
} from "@guallet/ui-react-native";
import dayjs from "dayjs";
import { Stack, useLocalSearchParams } from "expo-router";
import { useRef, useState } from "react";
import { View } from "react-native";
import { TextInput } from "react-native-gesture-handler";

var localizedFormat = require("dayjs/plugin/localizedFormat");
dayjs.extend(localizedFormat);

export default function TransactionDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { transaction } = useTransaction(id);
  const { updateTransactionNotes } = useTransactionMutations();
  const { account } = useAccount(transaction?.accountId ?? "");
  const { institution } = useInstitution(account?.institutionId ?? "");

  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  const [notes, setNotes] = useState(transaction?.notes ?? "");

  const money =
    transaction &&
    Money.fromCurrencyCode({
      currencyCode: transaction.currency,
      amount: transaction.amount,
    });

  function onSaveNotes(notes: string) {
    // Save the notes
    if (transaction) {
      updateTransactionNotes(transaction.id, notes);
    }
  }

  return (
    <View
      style={{
        flex: 1,
        flexDirection: "column",
        padding: Spacing.medium,
      }}
    >
      <Stack.Screen
        options={{
          title: "Transaction details",
          headerTitleAlign: "center",
        }}
      />
      <View
        style={{
          flexDirection: "column",
          flexGrow: 1,
        }}
      >
        <View
          style={{
            flexDirection: "column",
          }}
        >
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

          <Label
            style={{
              fontWeight: "bold",
              fontSize: 16,
              alignSelf: "center",
            }}
          >
            {money?.format()}
          </Label>
          <Label
            style={{
              alignSelf: "center",
            }}
          >
            {dayjs(transaction?.date).format("LL")}
          </Label>
        </View>

        <View>
          <Divider style={{ margin: 20 }} />
          <ValueRow
            title="Account"
            value={account?.name ?? "Unknown account"}
            showDivider={false}
          />
          {institution && (
            <View style={{ flexDirection: "row" }}>
              <ValueRow
                title="Institution"
                value={institution.name}
                showDivider={false}
                style={{ flex: 1 }}
              />
              <Avatar
                imageUrl={institution.image_src}
                size={40}
                style={{ marginEnd: Spacing.small }}
              />
            </View>
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
            value={notes.length === 0 ? "Add notes" : notes}
            showDivider={false}
            rightIconName="pen-to-square"
            onClick={() => {
              setIsNotesModalOpen(true);
            }}
          />
        </View>
        <View
          style={{
            flexGrow: 1,
            justifyContent: "flex-end",
            gap: Spacing.small,
          }}
        >
          <SecondaryButton title="Edit transaction" />
          <DangerButton title="Delete transaction" />
        </View>
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
            value={notes}
            onChangeText={setNotes}
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
                onSaveNotes(notes);
              }}
            />
          </View>
        </View>
      </AutoSizeModalSheet>
    </View>
  );
}
