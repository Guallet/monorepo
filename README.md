# Guallet: Personal Finances Manager

Guallet is an open-source personal finances manager. Inspired by Firefly III and other commercial apps like MoneyDashboard, MoneyHub or Mint.

## (Almost) 100% Typescript

In order to simplify the tech-stack, Typescript was selected for its ability to deliver server, web apps and mobile apps in the same language and tools.
Also, the available tools around the TS ecosystem make it perfect for self-hosting.

Yes, other languages might have been better options, but at this stage of the project, the benefits of having a single language outweigh those inconveniences.

## What's inside?

This Turborepo includes the following packages/apps:

### Apps and Packages

- `api`: a [NestJS](https://nestjs.com/) app, providing a REST API (GraphQL API might be available in the future)
- `webapp`: a Vite+React app
- `mobile`: an Expo app for iOS and Android

Each package/app aims to be 100% [TypeScript](https://www.typescriptlang.org/).

### Requirements

In order to compile/run the project locally, you will need:

- Node >=v22.x
- PNPM >= 10.0.0
- Postgres database
- Redis

### Docker Deployment (Recommended)

The easiest way to run the entire project is using Docker. See [DOCKER.md](./DOCKER.md) for detailed instructions.

Quick start with Docker (using npm scripts):

```bash
# Initialize the repository and generate env files
cp database.env.sample database.env
cp api.env.sample api.env
cp webapp.env.sample webapp.env

# Edit .env files with your configuration (API keys, etc.)

# Start all services
pnpm docker:compose:up

# Or start with rebuilding images
pnpm docker:compose:up:build

# Stop all services
pnpm docker:compose:down
```

This will start:

- PostgreSQL database (internal network only)
- Redis for background jobs (internal network only)
- API server on http://localhost:5000
- Web app on http://localhost:3000
- pgAdmin for database management on http://localhost:5050

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
- [Redis](https://redis.io/): Used for backend queues processing

### Support

![KO-FI](https://img.shields.io/badge/Ko--fi-F16061?style=for-the-badge&logo=ko-fi&logoColor=white)
![Sponsor](https://img.shields.io/badge/sponsor-30363D?style=for-the-badge&logo=GitHub-Sponsors&logoColor=#white)
