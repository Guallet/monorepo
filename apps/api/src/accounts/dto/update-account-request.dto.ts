import { PartialType } from '@nestjs/swagger';
import { CreateAccountRequest } from './create-account-request.dto';

export class UpdateAccountRequest extends PartialType(CreateAccountRequest) {}
