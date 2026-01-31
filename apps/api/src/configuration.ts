export default () => ({
  environment: process.env.ENVIRONMENT || process.env.NODE_ENV || 'production',
  database: process.env.DATABASE_URL,
  logging: {
    level: process.env.NODE_ENV !== 'production' ? 'debug' : 'info',
  },
  auth: {
    jwtSecret: process.env.AUTH_JWT_SECRET,
  },
});
