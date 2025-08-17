import { GualletClient } from "@guallet/api-client";
import React, { JSX } from "react";

export const GualletClientContext = React.createContext<
  GualletClient | undefined
>(undefined);

export const useGualletClient = (gualletClient?: GualletClient) => {
  const client = React.useContext(GualletClientContext);

  if (gualletClient) {
    return gualletClient;
  }

  if (!client) {
    throw new Error(
      "No GualletClient set, use GualletClientProvider to set one"
    );
  }

  return client;
};

export type GualletClientProviderProps = {
  client: GualletClient;
  children?: React.ReactNode;
};

export const GualletClientProvider = ({
  client,
  children,
}: GualletClientProviderProps): JSX.Element => {
  return (
    <GualletClientContext.Provider value={client}>
      {children}
    </GualletClientContext.Provider>
  );
};
