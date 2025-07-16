# Guallet: Personal Finances Manager

Guallet is a open-source personal finances manager. Inspired in Firefly III and other commercial apps like MoneyDashboard or Mint.

## (Almost) 100% Typescript

In order to simplify the tech-stack, Typescript was selected for it's ability to deliver server, web apps and mobiles apps in the same language and tools.
Also, the available tools around the TS ecosystems makes it perfect for self-hosting.

Yes, other languages would have been better options, but as at this stage of the project the benefits of having a single language outweigh those inconveniences.

## What's inside?

This Turborepo includes the following packages/apps:

### Apps and Packages

- `api`: a [NestJS](https://nestjs.com/) app, providing a REST and GraphQL apis
- `webapp`: a Vite+React app
- `mobile`: a Expo app for iOS and Android

Each package/app aims to be 100% [TypeScript](https://www.typescriptlang.org/).

### Requirements
In order to compile/run the project locally, you will need
- Node >=v22.x 
- PNPM
- Postgres database
- Supabase project (could be used to host your DB too)

### Build

To build all apps and packages, run the following command:

```
pnpm build
```

### Develop

To develop all apps and packages, run the following command:

```
pnpm dev
```

### Remote Caching

Turborepo can use a technique known as [Remote Caching](https://turbo.build/repo/docs/core-concepts/remote-caching) to share cache artifacts across machines, enabling you to share build caches with your team and CI/CD pipelines.

By default, Turborepo will cache locally. To enable Remote Caching you will need an account with Vercel. If you don't have an account you can [create one](https://vercel.com/signup), then enter the following commands:

```
npx turbo login
```

This will authenticate the Turborepo CLI with your [Vercel account](https://vercel.com/docs/concepts/personal-accounts/overview).

Next, you can link your Turborepo to your Remote Cache by running the following command from the root of your Turborepo:

```
npx turbo link
```

### Dependencies

- [PostgreSQL](https://www.postgresql.org/): The API requires a PostgreSQL database to read/write data.
- [Supabase](https://supabase.com/): Used for AUTH only. I didn't want to implement my own auth mechanism, so better idea to rely on a third party.

### Support

![KO-FI](https://img.shields.io/badge/Ko--fi-F16061?style=for-the-badge&logo=ko-fi&logoColor=white)
![Sponsor](https://img.shields.io/badge/sponsor-30363D?style=for-the-badge&logo=GitHub-Sponsors&logoColor=#white)
