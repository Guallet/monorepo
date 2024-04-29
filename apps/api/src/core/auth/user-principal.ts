export class UserPrincipal {
  id: string;
  email: string;
  roles: UserRole[];

  constructor(id: string, email: string, roles: UserRole[] = []) {
    this.id = id;
    this.email = email;
    this.roles = roles;
  }

  isAdmin(): boolean {
    return this.roles.includes('admin');
  }
}

export type UserRole = 'admin' | 'beta';
