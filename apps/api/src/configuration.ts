export default () => ({
  environment: process.env.ENVIRONMENT || process.env.NODE_ENV || 'production',
  database: process.env.DATABASE_URL,
  logging: {
    level: process.env.NODE_ENV !== 'production' ? 'debug' : 'info',
  },
  auth: {
    secret: process.env.BETTER_AUTH_SECRET,
    baseUrl: process.env.BETTER_AUTH_BASE_URL,
  },
  nordigen: {
    clientId: process.env.NORDIGEN_CLIENT_ID,
    clientSecret: process.env.NORDIGEN_CLIENT_SECRET,
  },
});
