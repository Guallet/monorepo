import { Inject, Injectable } from '@nestjs/common';
import supertokens from 'supertokens-node';
import { ConfigInjectionToken, AuthModuleConfig } from './supertokens.config';
import * as SuperTokensConfig from './supertokens.config';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SupertokensService {
  constructor(
    private configService: ConfigService,
    @Inject(ConfigInjectionToken) private config: AuthModuleConfig,
  ) {
    supertokens.init({
      appInfo: config.appInfo,
      supertokens: {
        connectionURI: config.connectionURI,
        apiKey: config.apiKey,
      },
      recipeList: this.getRecipeList(),
    });
  }

  getRecipeList() {
    return SuperTokensConfig.recipeList(this.configService);
  }

  async deleteUser(userId: string): Promise<void> {
    await supertokens.deleteUser(userId, true);
  }
}
