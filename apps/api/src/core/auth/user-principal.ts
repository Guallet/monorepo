import { SessionContainer } from 'supertokens-node/recipe/session';

export class UserPrincipal {
  id: string;
  session?: SessionContainer;

  constructor(id: string, session: SessionContainer | null = null) {
    this.id = id;
    this.session = session;
  }
}
