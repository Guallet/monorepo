import React from "react";
import { Stack } from "expo-router";

export default function ConnectionsLayout() {
  return (
    <Stack
      screenOptions={{
        // Fixes the issue during loading an navigation. I prefer to display an empty string rather than the URL path
        title: "",
      }}
    />
  );
}
