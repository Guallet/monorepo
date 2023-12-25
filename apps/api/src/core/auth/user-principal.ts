import { SessionContainer } from 'supertokens-node/recipe/session';

export class UserPrincipal {
  id: string;
  email: string;
  session?: SessionContainer;

  constructor(
    id: string,
    email: string,
    session: SessionContainer | null = null,
  ) {
    this.id = id;
    this.email = email;
    this.session = session;
  }
}
