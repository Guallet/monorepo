export class UserPrincipal {
  id: string;
  email: string;
  roles: string[];

  constructor(id: string, email: string, roles: string[] = []) {
    this.id = id;
    this.email = email;
    this.roles = roles;
  }

  isAdmin(): boolean {
    return this.roles.includes('admin');
  }
}
