import ThirdPartyPasswordless from 'supertokens-node/recipe/thirdpartypasswordless';
import Session from 'supertokens-node/recipe/session';
import Dashboard from 'supertokens-node/recipe/dashboard';
import UserRoles from 'supertokens-node/recipe/userroles';

import { AppInfo } from 'supertokens-node/types';

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

export const recipeList = [
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
              // TODO: Replace these values with the ones in the .env file
              clientId:
                '1060725074195-kmeum4crr01uirfl2op9kd5acmi9jutn.apps.googleusercontent.com',
              clientSecret: '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',
            },
          ],
        },
      },
      {
        config: {
          thirdPartyId: 'apple',
          clients: [
            {
              clientId: '4398792-io.supertokens.example.service',
              additionalConfig: {
                keyId: '7M48Y4RYDL',
                privateKey:
                  '-----BEGIN PRIVATE KEY-----\nMIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQgu8gXs+XYkqXD6Ala9Sf/iJXzhbwcoG5dMh1OonpdJUmgCgYIKoZIzj0DAQehRANCAASfrvlFbFCYqn3I2zeknYXLwtH30JuOKestDbSfZYxZNMqhF/OzdZFTV0zc5u5s3eN+oCWbnvl0hM+9IW0UlkdA\n-----END PRIVATE KEY-----',
                teamId: 'YWQCXGJRJL',
              },
            },
          ],
        },
      },
    ],
    contactMethod: 'EMAIL_OR_PHONE',
    flowType: 'USER_INPUT_CODE_AND_MAGIC_LINK',
  }),
];
