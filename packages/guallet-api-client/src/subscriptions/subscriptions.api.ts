import { GualletClientImpl } from './../GualletClient';
import {
  CreateSubscriptionRequest,
  SubscriptionDto,
  UpdateSubscriptionRequest,
} from './subscriptions.models';

const SUBSCRIPTIONS_PATH = 'regular-payments';

export class SubscriptionsApi {
  constructor(private readonly client: GualletClientImpl) {}

  async getAll(): Promise<SubscriptionDto[]> {
    return await this.client.get<SubscriptionDto[]>({
      path: SUBSCRIPTIONS_PATH,
    });
  }

  async get(subscriptionId: string): Promise<SubscriptionDto> {
    return await this.client.get<SubscriptionDto>({
      path: `${SUBSCRIPTIONS_PATH}/${subscriptionId}`,
    });
  }

  async create(
    subscription: CreateSubscriptionRequest,
  ): Promise<SubscriptionDto> {
    return await this.client.post<SubscriptionDto, CreateSubscriptionRequest>({
      path: SUBSCRIPTIONS_PATH,
      payload: subscription,
    });
  }

  async update({
    subscriptionId,
    dto,
  }: {
    subscriptionId: string;
    dto: UpdateSubscriptionRequest;
  }): Promise<SubscriptionDto> {
    return await this.client.patch<SubscriptionDto, UpdateSubscriptionRequest>({
      path: `${SUBSCRIPTIONS_PATH}/${subscriptionId}`,
      payload: dto,
    });
  }

  async delete(subscriptionId: string): Promise<SubscriptionDto> {
    return await this.client.fetch_delete<SubscriptionDto>({
      path: `${SUBSCRIPTIONS_PATH}/${subscriptionId}`,
    });
  }
}
