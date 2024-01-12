import { SessionContainer } from 'supertokens-node/recipe/session';

export class UserPrincipal {
  id: string;
  session?: SessionContainer;
  roles: string[];

  constructor(
    id: string,
    session: SessionContainer | null = null,
    roles: string[] = [],
  ) {
    this.id = id;
    this.session = session;
    this.roles = roles;
  }

  isAdmin(): boolean {
    return this.roles.includes('admin');
  }
}
