# Guallet: Web App

This project contains the Guallet Web App

The webapp uses TanStack Start in SPA mode, with file-based TanStack Router
routes. It builds a static app shell for the Nginx deployment.

The main libraries used to build this app are:

- [Vite](https://vitejs.dev/): Local development tooling
- [TanStack Start](https://tanstack.com/start): Application framework and routing
- [Mantine UI](https://mantine.dev/): React components library
- [Zod](https://zod.dev/): Validation
- [Better Auth](https://www.better-auth.com/): Authentication

## Build and run the project

Create a `webapp.env` file (or `.env` for local dev) with the values you can find in the `webapp.env.sample` file.

And then, install the packages

```js
   pnpm install
```

and then, run the app with

```js
   pnpm dev
```
