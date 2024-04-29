export default () => ({
  database: process.env.DATABASE_URL,
  logging: {
    level: process.env.NODE_ENV !== 'production' ? 'debug' : 'info',
    axiom: {
      isEnabled: process.env.AXIOM_ENABLED === 'true',
      dataset: process.env.AXIOM_DATASET,
      token: process.env.AXIOM_TOKEN,
    },
  },
  auth: {
    jwtSecret: process.env.AUTH_JWT_SECRET,
  },
  nordigen: {
    clientId: process.env.NORDIGEN_CLIENT_ID,
    clientSecret: process.env.NORDIGEN_CLIENT_SECRET,
  },
});
