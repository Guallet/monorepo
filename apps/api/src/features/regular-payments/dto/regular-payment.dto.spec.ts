import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateRegularPaymentDto } from './create-regular-payment.dto';
import { UpdateRegularPaymentDto } from './update-regular-payment.dto';
import { RegularPaymentDto } from './regular-payment.dto';
import {
  RecurrenceCadence,
  RecurringPaymentType,
  RegularPayment,
} from '../entities/regular-payment.entity';

describe('regular payment contracts', () => {
  it('accepts explicit clearing and rejects malformed dates and categories', async () => {
    expect(
      await validate(
        plainToInstance(UpdateRegularPaymentDto, {
          startDate: null,
          categoryId: null,
        }),
      ),
    ).toEqual([]);
    const errors = await validate(
      plainToInstance(UpdateRegularPaymentDto, {
        startDate: 'not a date',
        categoryId: 'not a uuid',
      }),
    );
    expect(errors.map((error) => error.property).sort()).toEqual([
      'categoryId',
      'startDate',
    ]);
    expect(
      await validate(
        plainToInstance(CreateRegularPaymentDto, {
          name: 'Spotify',
          amount: 10,
          currency: 'GBP',
          cadence: RecurrenceCadence.MONTHLY,
          type: RecurringPaymentType.SUBSCRIPTION,
          startDate: null,
        }),
      ),
    ).toEqual([]);
  });
  it('serialises decimal amounts and category IDs without a loaded relation', () => {
    const entity = Object.assign(new RegularPayment(), {
      id: 'payment',
      name: 'Spotify',
      amount: '10.99',
      categoryId: 'category',
      startDate: null,
    });
    const dto = RegularPaymentDto.fromDomain(entity);
    expect(dto.amount).toBe(10.99);
    expect(dto.categoryId).toBe('category');
    expect(dto.startDate).toBeUndefined();
  });
});
