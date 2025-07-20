export default () => ({
  database: process.env.DATABASE_URL,
  logging: {
    level: process.env.NODE_ENV !== 'production' ? 'debug' : 'info',
  },
  auth: {
    jwtSecret: process.env.AUTH_JWT_SECRET,
  },
  nordigen: {
    clientId: process.env.NORDIGEN_CLIENT_ID,
    clientSecret: process.env.NORDIGEN_CLIENT_SECRET,
  },
  supabase: {
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_KEY,
  },
});
