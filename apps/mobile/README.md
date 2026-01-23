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

### Configure Authentication

The app uses [Better Auth](https://www.better-auth.com/) for user authentication. You will need to configure the `BETTER_AUTH_URL` to point to your API server.

### Configure Firebase files

The app uses [React Native Google Sign In](https://react-native-google-signin.github.io/) to use native Login Signin functionality. Please read their documentation to configure the login using Firebase.

Once this is ready, you will have two Firebase config files:

- google-services.json (for Android)
- GoogleService-Info.plist (for iOS)

Download the files and place them in the following directory

> app/mobile/auth/firebase

## Github Actions and CI/EAS

There are some Github Actions files inside the `.github/workflows` folder that help with some internal EAS preview/deployment. You can have a look at them and adjust them to replicate them to work with your own EAS account.

## Built with

![React Native](https://img.shields.io/badge/react_native-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![React Query](https://img.shields.io/badge/-React%20Query-FF4154?style=for-the-badge&logo=react%20query&logoColor=white)
![React Hook Form](https://img.shields.io/badge/React%20Hook%20Form-%23EC5990.svg?style=for-the-badge&logo=reacthookform&logoColor=white)
![Better Auth](https://img.shields.io/badge/Better%20Auth-FFF?logo=betterauth&logoColor=000&style=for-the-badge)
