import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString, IsNotEmpty, ArrayNotEmpty } from 'class-validator';

export class ConnectAccountsRequestDto {
  /**
   * The IDs of the open banking accounts to be connected to
   */
  @ApiProperty({
    description: 'Open Banking account IDs to connect',
    type: [String],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  account_ids: string[];
}
