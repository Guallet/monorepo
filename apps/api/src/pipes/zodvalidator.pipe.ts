import {
  PipeTransform,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { ZodError, ZodSchema } from 'zod';

export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: ZodSchema) {}

  // oxlint-disable-next-line typescript/no-unused-vars
  transform(value: unknown, metadata: ArgumentMetadata) {
    try {
      console.log('value', value);
      const parsedValue = this.schema.parse(value);
      return parsedValue;
    } catch (error: unknown) {
      const description =
        error instanceof ZodError ? error.message : 'Invalid request';

      throw new BadRequestException(`Validation failed`, {
        cause: error,
        description,
      });
    }
  }
}
