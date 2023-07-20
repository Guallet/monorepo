export const ACCOUNT_ADDED = 'account.added';

export class AccountCreatedEvent {
  id: string;

  constructor({ id }) {
    this.id = id;
  }
}
