import { ActivityIndicator, Modal, View } from "react-native";
import { Label } from "../Text";

interface OverlayLoaderProps {
  isVisible: boolean;
  loadingMessage?: string;
}

export function ModalLoaderOverlay({
  isVisible,
  loadingMessage,
}: OverlayLoaderProps) {
  return (
    <Modal
      transparent={true}
      visible={isVisible}
      animationType="fade"
      onRequestClose={() => {
        // do nothing... this is controlled by the parent.
        // The user cannot dismiss this view
      }}
    >
      <View
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
        <View
          style={{
            backgroundColor: "white",
            padding: 40,
            borderRadius: 20,
          }}
        >
          <ActivityIndicator size="large" />
          {loadingMessage && (
            <Label
              style={{
                fontSize: 18,
                marginTop: 12,
              }}
            >
              {loadingMessage}
            </Label>
          )}
        </View>
      </View>
    </Modal>
  );
}
