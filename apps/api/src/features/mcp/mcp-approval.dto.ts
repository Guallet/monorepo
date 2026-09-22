import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsUUID } from 'class-validator';

export class McpApprovalDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  requestId: string;

  @ApiProperty()
  @IsBoolean()
  approved: boolean;
}
