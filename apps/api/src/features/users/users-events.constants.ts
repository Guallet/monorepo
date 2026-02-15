export const USER_EVENTS_QUEUE = 'user-events';
export const USER_CREATED_EVENT = 'user.created';

export interface UserCreatedEventPayload {
  userId: string;
}
