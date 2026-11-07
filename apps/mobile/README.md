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
API. Compatible JavaScript and bundled environment changes can be delivered
through EAS Update after installing a build configured for OTA updates.

The preview uses the `Guallet` name and `io.guallet.mobile` package identifier,
so it shares the production app's installation slot. The `development` profile
is for development-client builds that connect to Metro.

## EAS Update and GitHub Actions

The app uses `expo-updates` to download JavaScript bundles and their assets for
Android and iOS. OTA updates cannot change the native binary. The existing EAS
project is `guallet/guallet` (`4933c830-42b4-4f94-b2f7-a4ee70331431`).

| Build profile | EAS environment | Update channel | Purpose                                        |
| ------------- | --------------- | -------------- | ---------------------------------------------- |
| `development` | `development`   | `development`  | Development client; iOS simulator              |
| `preview`     | `preview`       | `preview`      | Internal release build for testing OTA updates |
| `production`  | `production`    | `production`   | Store builds                                   |

### One-time setup

1. Add an Expo access token with access to this project as the GitHub Actions
   repository secret `EXPO_TOKEN`.
2. In the Expo dashboard, configure the project's **preview** environment with
   `EXPO_PUBLIC_API_URL` pointing at the API used by testers. Optionally set
   `EXPO_PUBLIC_SENTRY_DSN` and `EXPO_PUBLIC_VEXO_KEY`. Use plain text or sensitive
   visibility; EAS Update cannot read variables with secret visibility. These
   `EXPO_PUBLIC_` values are embedded in the bundle and are visible to app users.
   Keep `APP_VARIANT` unset for preview (or set it to `preview`). Configure the
   development and production environments separately when using those profiles.
3. If using Sentry, configure `SENTRY_AUTH_TOKEN` as an EAS secret for native
   builds and as a GitHub Actions secret for update sourcemap uploads. The
   workflow skips the OTA sourcemap upload when that GitHub secret is absent.
4. Create and install a new **preview** native build. Previously installed builds
   cannot acquire the new native update module or channel through an OTA update.
   For initial signing/device registration, run the build interactively first:

   ```bash
   cd apps/mobile
   pnpm dlx eas-cli@latest build --profile preview --platform all
   ```

   Android testers install the APK. iOS internal distribution requires registered
   devices and Apple signing credentials. Subsequent builds can use the manual
   **EAS Build** GitHub workflow, selecting the `develop` ref, `preview` profile,
   and desired platform. Credentials must already be configured for CI.

5. Verify the channel mapping with `pnpm dlx eas-cli@latest channel:view preview`.
   Normally the preview build creates the channel linked to the `preview` EAS
   branch. If an existing channel points elsewhere, align it explicitly:

   ```bash
   pnpm dlx eas-cli@latest branch:create preview
   pnpm dlx eas-cli@latest channel:edit preview --branch preview
   ```

   Only create the EAS branch if it does not already exist. The EAS branch named
   `preview` is separate from the Git branch named `develop`.

### Automatic preview updates

Every push to `develop` triggers `.github/workflows/eas-update.yml`, including
changes in shared workspace packages. It installs the frozen workspace lockfile
and publishes through `expo/expo-github-action/preview@v8` with PR comments
disabled. The run summary contains an update link and QR code. The command is:

```bash
eas update --channel preview --environment preview --platform all \
  --message "develop <commit-sha>" --non-interactive
```

Builds and updates both use the EAS `preview` environment. With the current Expo
SDK, the update's `--environment` flag is required; local `.env` files and the old
`MOBILE_ENV_FILE_DEV`/`MOBILE_ENV_FILE_PROD` GitHub secrets are not used by these
workflows. The obsolete Firebase config generation has also been removed;
authentication uses Better Auth.

The app checks on each cold launch and downloads in the background while running
its cached bundle. After the download finishes, fully close and reopen the app to
load the update. No forced reload interrupts an active session. Test using an
installed preview release build; Expo Go and a development session connected to
Metro do not exercise this release update flow.

The update workflow uses a concurrency group to prevent simultaneous publishes.
GitHub may replace an older pending run when several pushes arrive while a run is
active, so rapid pushes converge on the latest pending commit.

For a manual preview publish, run `pnpm eas:update:preview` from `apps/mobile`
with EAS CLI installed and authenticated, or dispatch **EAS Update - Preview**
on the `develop` ref in GitHub Actions.

### Pull request previews

Pull requests targeting `develop` also run the update workflow, using
`expo/expo-github-action/preview@v8` from Expo's
[GitHub Actions example](https://docs.expo.dev/eas-update/github-actions/).
Each PR publishes Android and iOS updates to its own EAS branch, `pr-<number>`,
using the `preview` environment. The action adds or updates a PR comment with
update links and QR codes. It checks out the PR head commit and runs in
`apps/mobile`, while dependencies are installed at the monorepo root.

These updates do not change the `preview` channel's branch mapping. Use a
compatible development build to open the PR update from the QR code or the
Extensions tab. A standalone preview release build continues to receive
updates from the `preview` channel when changes are pushed to `develop`.
Changes affecting the native runtime still require a compatible new build.
Fork and Dependabot PRs skip publishing because repository secrets are not
available to those runs. Push and PR publishes have separate concurrency groups.

For local worktrees, install dependencies inside each checkout with
`pnpm install --frozen-lockfile`. Do not link the checkout's `node_modules` to
another repository directory: config plugin paths contribute to the fingerprint
and external paths can make local runtime versions differ from EAS.

### Native changes require a new build

`runtimeVersion.policy` is `fingerprint`. Expo computes compatibility from inputs
that can affect the native runtime, so an update with a different fingerprint
will not be delivered to an installed build. Adding or updating native modules,
changing config plugins or permissions, and upgrading Expo/React Native require
a fresh preview native build. Publishing an update does not create that build.

`.github/workflows/eas-build.yml` is manual, defaults to the `preview` profile,
and supports Android, iOS, or both. Build and install a new preview binary after
native changes. Compatible JavaScript, styling, and asset changes continue to
arrive through OTA updates. Production updates are not published automatically.

See Expo's [EAS Update setup](https://docs.expo.dev/eas-update/getting-started/),
[runtime compatibility](https://docs.expo.dev/eas-update/runtime-versions/), and
[EAS environments](https://docs.expo.dev/eas/environment-variables/usage/).

## Built with

![React Native](https://img.shields.io/badge/react_native-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![React Query](https://img.shields.io/badge/-React%20Query-FF4154?style=for-the-badge&logo=react%20query&logoColor=white)
![React Hook Form](https://img.shields.io/badge/React%20Hook%20Form-%23EC5990.svg?style=for-the-badge&logo=reacthookform&logoColor=white)
![Better Auth](https://img.shields.io/badge/better_auth-%23EC5990.svg?style=for-the-badge&logo=reacthookform&logoColor=white)
