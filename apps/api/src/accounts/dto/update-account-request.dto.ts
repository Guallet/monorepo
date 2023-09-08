import { CreateAccountRequest } from './create-account-request.dto';
import { InputType, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateAccountRequest extends PartialType(CreateAccountRequest) {}
