import {
  ActionIcon,
  Column,
  Label,
  ModalLoaderOverlay,
  PrimaryButton,
  SecondaryButton,
  Spacing,
} from "@guallet/ui-react-native";
import { Modal, View } from "react-native";
import { NativeStackNavigationOptions } from "@react-navigation/native-stack";
import { Stack } from "expo-router";
import { useState } from "react";

interface FlowScreenProps extends React.ComponentProps<typeof View> {
  isLoading?: boolean;
  loadingMessage?: string;
  headerOptions?: NativeStackNavigationOptions;
  headerTitle?: string;
  canGoBack?: boolean;
  canClose?: boolean;
  showCloseConfirmation?: boolean;
  onClose?: () => void;
}

export function FlowScreen({
  isLoading = false,
  loadingMessage,
  children,
  headerTitle,
  headerOptions,
  canGoBack = true,
  canClose = true,
  onClose,
  showCloseConfirmation = true,
  ...props
}: FlowScreenProps) {
  const [isDismissFlowAlertVisible, setIsDismissFlowAlertVisible] =
    useState(false);

  let combinedHeaderOptions: NativeStackNavigationOptions = {
    headerTitleAlign: "center",
  };

  if (headerTitle && headerTitle !== "") {
    combinedHeaderOptions = {
      ...combinedHeaderOptions,
      title: headerTitle,
    };
  }

  if (!canGoBack) {
    combinedHeaderOptions = {
      ...combinedHeaderOptions,
      headerBackVisible: false,
    };
  }

  if (canClose) {
    combinedHeaderOptions = {
      ...combinedHeaderOptions,
      headerRight: () => {
        return (
          <ActionIcon
            name="xmark"
            size={24}
            onClick={() => {
              if (showCloseConfirmation) {
                setIsDismissFlowAlertVisible(true);
              } else {
                onClose?.();
              }
            }}
          />
        );
      },
    };
  }

  // Overrides all the header values with the one passed as parameter
  combinedHeaderOptions = {
    ...combinedHeaderOptions,
    ...headerOptions,
  };

  return (
    <View
      style={[
        {
          flex: 1,
          paddingHorizontal: Spacing.medium,
          paddingBottom: Spacing.medium,
          paddingTop: Spacing.small,
        },
        props.style,
      ]}
    >
      <Stack.Screen options={combinedHeaderOptions} />
      <ModalLoaderOverlay
        isVisible={isLoading}
        loadingMessage={loadingMessage}
      />
      <DismissFlowAlert
        isVisible={isDismissFlowAlertVisible}
        onDismiss={() => {
          setIsDismissFlowAlertVisible(false);
        }}
        onAccept={() => {
          setIsDismissFlowAlertVisible(false);
          onClose?.();
        }}
        onCancel={() => {
          setIsDismissFlowAlertVisible(false);
        }}
      />
      {children}
    </View>
  );
}

interface DismissFlowAlertProps {
  isVisible: boolean;
  onDismiss: () => void;
  onAccept: () => void;
  onCancel: () => void;
}
function DismissFlowAlert({
  isVisible,
  onDismiss,
  onAccept,
  onCancel,
}: DismissFlowAlertProps) {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isVisible}
      onRequestClose={() => {
        onDismiss();
      }}
    >
      <Column
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "rgba(100, 100, 100, 0.6)",
        }}
      >
        <Column
          style={{
            backgroundColor: "white",
            padding: 40,
            borderRadius: 20,

            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 4,
            elevation: 5,
          }}
        >
          <Label>Exit the flow. Are you sure?</Label>
          <Column
            style={{
              marginTop: Spacing.medium,
              gap: Spacing.small,
            }}
          >
            <PrimaryButton title="Cancel" onClick={onCancel} />
            <SecondaryButton title="Exit" onClick={onAccept} />
          </Column>
        </Column>
      </Column>
    </Modal>
  );
}
