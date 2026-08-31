import { PartialType } from '@nestjs/swagger';
import { CreateAiAgentDto } from './create-ai-agent.dto.js';

export class UpdateAiAgentDto extends PartialType(CreateAiAgentDto) {}
