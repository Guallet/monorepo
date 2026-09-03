import { PartialType, PickType } from '@nestjs/swagger';
import { CreateAiProviderConnectionDto } from './create-ai-provider-connection.dto.js';

export class UpdateAiProviderConnectionDto extends PartialType(
  PickType(CreateAiProviderConnectionDto, ['displayName', 'apiToken'] as const),
) {}
