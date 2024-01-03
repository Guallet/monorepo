export default () => ({
  database: process.env.DATABASE_URL,
  logging: {
    level: process.env.NODE_ENV !== 'production' ? 'debug' : 'warning',
    axiom: {
      isEnabled: process.env.AXIOM_ENABLED === 'true',
      dataset: process.env.AXIOM_DATASET,
      token: process.env.AXIOM_TOKEN,
    },
  },
  auth: {
    supertokens: {
      connectionURI: process.env.SUPERTOKENS_CONNECTION_URI,
      apiKey: process.env.SUPERTOKENS_API_KEY,
      appInfo: {
        appName: process.env.SUPERTOKENS_APP_NAME,
        apiDomain: process.env.SUPERTOKENS_API_DOMAIN,
        apiBasePath: process.env.SUPERTOKENS_API_PATH || '/auth',
        websiteDomain: process.env.SUPERTOKENS_WEBSITE_DOMAIN,
        websiteBasePath: process.env.SUPERTOKENS_WEBSITE_PATH || '/login',
      },
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
  },
  nordigen: {
    clientId: process.env.NORDIGEN_CLIENT_ID,
    clientSecret: process.env.NORDIGEN_CLIENT_SECRET,
  },
});
