import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAiChatSessionDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  agentId: string;
}
