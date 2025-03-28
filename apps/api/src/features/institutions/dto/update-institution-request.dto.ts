import { PartialType } from '@nestjs/swagger';
import { CreateInstitutionRequest } from './create-institution-request.dto';

export class UpdateInstitutionRequest extends PartialType(
  CreateInstitutionRequest,
) {}
