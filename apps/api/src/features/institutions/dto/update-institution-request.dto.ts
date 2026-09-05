import { PartialType } from '@nestjs/swagger';
import { CreateInstitutionRequest } from './create-institution-request.dto.js';

export class UpdateInstitutionRequest extends PartialType(
  CreateInstitutionRequest,
) {}
