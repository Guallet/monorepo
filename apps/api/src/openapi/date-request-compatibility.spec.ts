import { validateSync } from 'class-validator';
import { CreateRegularPaymentDto } from '../features/regular-payments/dto/create-regular-payment.dto';
import { UpdateRegularPaymentDto } from '../features/regular-payments/dto/update-regular-payment.dto';
import { CreateSavingGoalDto } from '../features/saving-goals/dto/create-saving-goal.dto';
import { UpdateSavingGoalDto } from '../features/saving-goals/dto/update-saving-goal.dto';
import { CreateTransactionDto } from '../features/transactions/dto/create-transaction.dto';
import { UpdateTransactionDto } from '../features/transactions/dto/update-transaction.dto';

const cases = [
  { dto: CreateRegularPaymentDto, field: 'startDate' },
  { dto: UpdateRegularPaymentDto, field: 'startDate' },
  { dto: CreateSavingGoalDto, field: 'targetDate' },
  { dto: UpdateSavingGoalDto, field: 'targetDate' },
  { dto: CreateTransactionDto, field: 'date' },
  { dto: UpdateTransactionDto, field: 'date' },
];

for (const { dto: Dto, field } of cases) {
  describe(`${Dto.name}.${field} input compatibility`, () => {
    function errorsFor(value: string) {
      const input = Object.assign(new Dto(), { [field]: value });
      // Isolate the provided date field; other required request fields are absent.
      return validateSync(input, { skipMissingProperties: true });
    }

    it.each(['2024-01-15', '2024-01-15T12:30:00Z'])(
      'continues accepting %s',
      (value) => {
        expect(errorsFor(value)).toEqual([]);
      },
    );

    it('continues rejecting non-ISO date strings', () => {
      expect(errorsFor('not-a-date')).toEqual([
        expect.objectContaining({ property: field }),
      ]);
    });
  });
}
