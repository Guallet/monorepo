This uses Better auth.
To generate the Database tables, from the NestJS root directory run 

> npx @better-auth/cli generate --config src/auth/better-auth.ts

and

> npx @better-auth/cli migrate --config src/auth/better-auth.ts

This should generate the required DB tables