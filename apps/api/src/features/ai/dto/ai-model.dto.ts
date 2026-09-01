import { ApiProperty } from '@nestjs/swagger';

export class AiModelDto {
  @ApiProperty()
  id: string;
  @ApiProperty()
  name: string;
  @ApiProperty({ required: false })
  provider?: string;
  @ApiProperty({ required: false })
  description?: string;
  @ApiProperty({ required: false })
  contextLength?: number;
  @ApiProperty({ required: false, type: [String] })
  inputModalities?: string[];
  @ApiProperty({ required: false, type: [String] })
  outputModalities?: string[];
}
