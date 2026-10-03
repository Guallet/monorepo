## Guallet Mobile app

## How to build and run the app

From the `apps/mobile` directory, run

```bash
pnpm install
pnpm start
```

to install the dependencies and run the Metro server. You will need to configure some prerequisites to run the app as expected:

### Create .env file

Create a `.env` file in the mobile root folder

```bash
cd apps/mobile
touch .env
```

Use the `.env.sample` file to see the required variables the app requires.

### Configure Better Auth

Mobile authentication uses the Better Auth Expo client. Set
`EXPO_PUBLIC_API_URL` to the API base URL; the client persists the Better Auth
session cookie in `expo-secure-store` and uses the `guallet` deep-link scheme
for OAuth callbacks.

## GitHub Actions and EAS deployment

The mobile deployment workflows live in the repository's `.github/workflows`
folder:

- Changes to `develop` publish an Android OTA update to the EAS `development`
  channel.
- `EAS Build - Development` can be started manually when the dev native app
  needs to be rebuilt.
- Changes to `main` build a production Android App Bundle. The workflow pauses
  at the protected GitHub `production` environment before submitting the exact
  build to Google Play production.

Before enabling the workflows, configure these EAS environment values for both
the `development` and `production` environments:

- `APP_VARIANT` as a plain-text value (`development` or `production`)
- `EXPO_PUBLIC_API_URL`, `EXPO_PUBLIC_SENTRY_DSN`, and
  `EXPO_PUBLIC_VEXO_KEY` with the matching environment values
- `GOOGLE_SERVICES_JSON` as a secret file variable containing the matching
  Firebase `google-services.json`

Configure these GitHub secrets:

- `EXPO_TOKEN`
- `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON` with a Google Play service-account JSON
  key that can release the production application
- `SENTRY_AUTH_TOKEN` (optional, for source-map uploads)

Create the `io.guallet.mobile` application in Google Play Console, grant the
service account release permissions, and configure the protected `production`
environment with its required reviewers. The dev application uses the
`io.guallet.mobile.dev` identifier and is distributed through EAS internal
builds rather than a public store listing.

The production workflow expects the user-facing `version` in `app.config.ts`
to change on every `main` release. Android `versionCode` values are managed
and incremented remotely by EAS.

## Built with

![React Native](https://img.shields.io/badge/react_native-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![React Query](https://img.shields.io/badge/-React%20Query-FF4154?style=for-the-badge&logo=react%20query&logoColor=white)
![React Hook Form](https://img.shields.io/badge/React%20Hook%20Form-%23EC5990.svg?style=for-the-badge&logo=reacthookform&logoColor=white)
![Better Auth](https://img.shields.io/badge/better_auth-%23EC5990.svg?style=for-the-badge&logo=reacthookform&logoColor=white)
