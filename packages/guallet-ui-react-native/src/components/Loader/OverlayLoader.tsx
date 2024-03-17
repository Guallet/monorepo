import { ActivityIndicator, Modal, View } from "react-native";
import { Label } from "../Text";

interface OverlayLoaderProps {
  isVisible: boolean;
  loadingMessage?: string;
}

export function OverlayLoader({
  isVisible,
  loadingMessage,
}: OverlayLoaderProps) {
  if (!isVisible) {
    return null;
  }

  return (
    <Modal transparent={true}>
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
