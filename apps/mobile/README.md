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

## Standalone Android preview APK

The `preview` profile in `eas.json` builds a release APK for internal
distribution. It includes the JavaScript bundle and runs without a Metro
server. Use this profile when sharing the app with testers.

Before building, sign in to EAS with `eas login` and configure the `preview`
environment in the Guallet project on the Expo dashboard:

- Set `EXPO_PUBLIC_API_URL` to an HTTPS API URL reachable from the test device.
  `localhost` points to the device itself, so do not use it for a hosted preview.
- Set `EXPO_PUBLIC_SENTRY_DSN` and `EXPO_PUBLIC_VEXO_KEY` if those integrations
  are needed.
- Configure `SENTRY_AUTH_TOKEN` as a secret for Sentry source-map uploads.

Use plain-text or sensitive visibility for `EXPO_PUBLIC_*` values, since Expo
inlines them into the bundle. They must not contain secrets. EAS builds use the
selected EAS environment; an ignored local `.env` file is not uploaded.

From the monorepo root, run:

```bash
pnpm --filter mobile eas:android:preview
```

Or from `apps/mobile`, run:

```bash
eas build --profile preview --platform android
```

After EAS finishes, download the APK from the build link and install it on the
Android device. Open Guallet directly; there is no need to run `pnpm start` or
scan a development-server QR code. Login and data still require access to the
API. Changes to JavaScript or bundled environment values require a new build.

The preview uses the `Guallet` name and `io.guallet.mobile` package identifier,
so it shares the production app's installation slot. The `development` profile
is for development-client builds that connect to Metro.

## Github Actions and CI/EAS

There are some Github Actions files inside the `.github/workflows` folder that help with some internal EAS preview/deployment. You can have a look at them and adjust them to replicate them to work with your own EAS account.

## Built with

![React Native](https://img.shields.io/badge/react_native-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![React Query](https://img.shields.io/badge/-React%20Query-FF4154?style=for-the-badge&logo=react%20query&logoColor=white)
![React Hook Form](https://img.shields.io/badge/React%20Hook%20Form-%23EC5990.svg?style=for-the-badge&logo=reacthookform&logoColor=white)
![Better Auth](https://img.shields.io/badge/better_auth-%23EC5990.svg?style=for-the-badge&logo=reacthookform&logoColor=white)
