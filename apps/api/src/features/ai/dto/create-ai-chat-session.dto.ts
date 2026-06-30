import { IsUUID } from 'class-validator';

export class CreateAiChatSessionDto {
  @IsUUID()
  agentId: string;
}
