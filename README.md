# Guallet: Personal Finances Manager

Guallet is a open-source personal finances manager. Inspired in Firefly III and other commercial apps like MoneyDashboard or Mint.

## (Almost) 100% Typescript
In order to simplify the tech-stack, Typescript was selected for it's ability to deliver server, web apps and mobiles apps in the same language and tools.
Also, the available tools around the TS ecosystems makes it perfect for self-hosting.

Yes, other languages would have been better options, but as at this stage of the project the benefits of having a single language outweigh those inconvenients. 

## What's inside?

This Turborepo includes the following packages/apps:

### Apps and Packages

- `api`: a [NestJS](https://nestjs.com/) app, providing a REST and GraphQL apis
- `webapp`: a Vite+React app
- `ui`: a stub React component library shared by all applications
- `eslint-config-custom`: `eslint` configurations (includes `eslint-config-next` and `eslint-config-prettier`)
- `tsconfig`: `tsconfig.json`s used throughout the monorepo

Each package/app is 100% [TypeScript](https://www.typescriptlang.org/).

### Utilities

This Turborepo has some additional tools already setup for you:

- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io) for code formatting

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

## Useful Links

Learn more about the power of Turborepo:

- [Tasks](https://turbo.build/repo/docs/core-concepts/monorepos/running-tasks)
- [Caching](https://turbo.build/repo/docs/core-concepts/caching)
- [Remote Caching](https://turbo.build/repo/docs/core-concepts/remote-caching)
- [Filtering](https://turbo.build/repo/docs/core-concepts/monorepos/filtering)
- [Configuration Options](https://turbo.build/repo/docs/reference/configuration)
- [CLI Usage](https://turbo.build/repo/docs/reference/command-line-reference)

### Dependencies
- [Supabase](https://supabase.com/): Used for AUTH only. I didn't want to implement my own auth mechanisim, so better idea to rely on a third party. Supabas was selected because it offers a generous free tier, but also can be self-hosted in your server (Disclaimer: I didn't try to slef-host it, so not sure how easy/hard it will be)


