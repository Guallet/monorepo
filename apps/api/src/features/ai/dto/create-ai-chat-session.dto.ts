import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class CreateAiChatSessionDto {
  @ApiProperty()
  @IsUUID()
  agentId: string;
}
