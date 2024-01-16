import ThirdPartyPasswordless from 'supertokens-node/recipe/thirdpartypasswordless';
import Session from 'supertokens-node/recipe/session';
import Dashboard from 'supertokens-node/recipe/dashboard';
import UserRoles from 'supertokens-node/recipe/userroles';

import { AppInfo } from 'supertokens-node/types';
import { ConfigService } from '@nestjs/config';

export const ConfigInjectionToken = 'ConfigInjectionToken';

export type AuthModuleConfig = {
  appInfo: AppInfo;
  connectionURI: string;
  apiKey?: string;
};

export const appInfo = {
  appName: process.env.SUPERTOKENS_APP_NAME || 'Guallet',
  apiDomain: process.env.SUPERTOKENS_API_DOMAIN || 'http://localhost:5000',
  websiteDomain:
    process.env.SUPERTOKENS_WEBSITE_DOMAIN || 'http://localhost:3000',
  apiBasePath: process.env.SUPERTOKENS_API_PATH || '/auth',
  websiteBasePath: process.env.SUPERTOKENS_WEBSITE_PATH || '/login',
};

export const recipeList = (configService: ConfigService) => [
  Session.init({
    exposeAccessTokenToFrontendInCookieBasedAuth: true,
  }),
  Dashboard.init(),
  UserRoles.init({
    skipAddingRolesToAccessToken: true,
    skipAddingPermissionsToAccessToken: true,
  }),
  ThirdPartyPasswordless.init({
    providers: [
      // We have provided you with development keys which you can use for testing.
      // IMPORTANT: Please replace them with your own OAuth keys for production use.
      {
        config: {
          thirdPartyId: 'google',
          clients: [
            {
              clientId: configService.get<string>('auth.google.clientId'),
              clientSecret: configService.get<string>(
                'auth.google.clientSecret',
              ),
            },
          ],
        },
      },
      // {
      //   config: {
      //     thirdPartyId: 'apple',
      //     clients: [
      //       {
      //         clientId: '4398792-io.supertokens.example.service',
      //         additionalConfig: {
      //           keyId: '7M48Y4RYDL',
      //           privateKey:
      //             '-----BEGIN PRIVATE KEY-----\nMIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQgu8gXs+XYkqXD6Ala9Sf/iJXzhbwcoG5dMh1OonpdJUmgCgYIKoZIzj0DAQehRANCAASfrvlFbFCYqn3I2zeknYXLwtH30JuOKestDbSfZYxZNMqhF/OzdZFTV0zc5u5s3eN+oCWbnvl0hM+9IW0UlkdA\n-----END PRIVATE KEY-----',
      //           teamId: 'YWQCXGJRJL',
      //         },
      //       },
      //     ],
      //   },
      // },
    ],
    contactMethod: 'EMAIL',
    flowType: 'USER_INPUT_CODE_AND_MAGIC_LINK',
    // override: {
    //   functions: (originalImplementation) => {
    //     return {
    //       ...originalImplementation,
    //       // override the thirdparty sign in / up API
    //       thirdPartySignInUp: async function (input) {
    //         // TODO: Some pre sign in / up logic

    //         const response = await originalImplementation.thirdPartySignInUp(
    //           input,
    //         );

    //         if (response.status === 'OK') {
    //           const { id, emails } = response.user;

    //           // This is the response from the OAuth 2 provider that contains their tokens or user info.
    //           const providerAccessToken = response.oAuthTokens['access_token'];
    //           const firstName =
    //             response.rawUserInfoFromProvider.fromUserInfoAPI!['first_name'];

    //           if (
    //             response.createdNewRecipeUser &&
    //             response.user.loginMethods.length === 1
    //           ) {
    //             // TODO: Post sign up logic
    //             // TODO: Emit message for "new user created"
    //           } else {
    //             // TODO: Post sign in logic
    //             // nothing really to do here...maybe update the profile image?
    //           }
    //         }

    //         return response;
    //       },

    //       consumeCode: async (input) => {
    //         // First we call the original implementation of consumeCodePOST.
    //         const response = await originalImplementation.consumeCode(input);

    //         // Post sign up response, we check if it was successful
    //         if (response.status === 'OK') {
    //           if ('phoneNumber' in response.user) {
    //             const { id, phoneNumbers } = response.user;
    //           } else {
    //             const { id, emails } = response.user;
    //           }

    //           if (
    //             response.createdNewRecipeUser &&
    //             response.user.loginMethods.length === 1
    //           ) {
    //             // TODO: post sign up logic
    //             // TODO: Emit message for "new user created"
    //           } else {
    //             // TODO: post sign in logic
    //           }
    //         }
    //         return response;
    //       },
    //     };
    //   },
    // },
  }),
];
