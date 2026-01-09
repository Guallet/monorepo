import { GualletClientImpl } from "../GualletClient";
import {
  CreateRecurringPaymentRequest,
  DetectedRecurringPaymentDto,
  RecurringPaymentDto,
  UpdateRecurringPaymentRequest,
} from "./recurring-payments.models";

const RECURRING_PAYMENTS_PATH = "recurring-payments";

export class RecurringPaymentsApi {
  constructor(private readonly client: GualletClientImpl) {}

  async getAll(): Promise<RecurringPaymentDto[]> {
    return await this.client.get<RecurringPaymentDto[]>({
      path: RECURRING_PAYMENTS_PATH,
    });
  }

  async get(id: string): Promise<RecurringPaymentDto> {
    return await this.client.get<RecurringPaymentDto>({
      path: `${RECURRING_PAYMENTS_PATH}/${id}`,
    });
  }

  async create(
    request: CreateRecurringPaymentRequest
  ): Promise<RecurringPaymentDto> {
    return await this.client.post<
      RecurringPaymentDto,
      CreateRecurringPaymentRequest
    >({
      path: RECURRING_PAYMENTS_PATH,
      payload: request,
    });
  }

  async update(
    id: string,
    request: UpdateRecurringPaymentRequest
  ): Promise<RecurringPaymentDto> {
    return await this.client.patch<
      RecurringPaymentDto,
      UpdateRecurringPaymentRequest
    >({
      path: `${RECURRING_PAYMENTS_PATH}/${id}`,
      payload: request,
    });
  }

  async delete(id: string): Promise<RecurringPaymentDto> {
    return await this.client.fetch_delete<RecurringPaymentDto>({
      path: `${RECURRING_PAYMENTS_PATH}/${id}`,
    });
  }

  async detectRecurringPayments(): Promise<DetectedRecurringPaymentDto[]> {
    return await this.client.get<DetectedRecurringPaymentDto[]>({
      path: `${RECURRING_PAYMENTS_PATH}/detect`,
    });
  }

  async getSuggestedTransactions(): Promise<DetectedRecurringPaymentDto[]> {
    return await this.client.get<DetectedRecurringPaymentDto[]>({
      path: `${RECURRING_PAYMENTS_PATH}/suggested`,
    });
  }
}
