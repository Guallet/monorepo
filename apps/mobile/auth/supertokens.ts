import SuperTokens from "supertokens-react-native";

export const initializeSupertokens = () => {
  console.log("Initializing Supertokens");

  try {
    SuperTokens.init({
      //   apiDomain: "https://guallet-api.fzx1cu.easypanel.host",
      apiDomain: "http://localhost:5000",
      //   apiBasePath: "/auth",
      //   enableDebugLogs: true,
      //   tokenTransferMethod: "header",
    });
  } catch (e) {
    console.error("Failed to initialize Supertokens", e);
  }
};
