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

## Github Actions and CI/EAS

There are some Github Actions files inside the `.github/workflows` folder that help with some internal EAS preview/deployment. You can have a look at them and adjust them to replicate them to work with your own EAS account.

## Built with

![React Native](https://img.shields.io/badge/react_native-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![React Query](https://img.shields.io/badge/-React%20Query-FF4154?style=for-the-badge&logo=react%20query&logoColor=white)
![React Hook Form](https://img.shields.io/badge/React%20Hook%20Form-%23EC5990.svg?style=for-the-badge&logo=reacthookform&logoColor=white)
![Better Auth](https://img.shields.io/badge/better_auth-%23EC5990.svg?style=for-the-badge&logo=reacthookform&logoColor=white)
