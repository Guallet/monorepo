import { IsArray, IsString, IsNotEmpty, ArrayNotEmpty } from 'class-validator';

export class ConnectAccountsRequestDto {
  /**
   * The IDs of the open banking accounts to be connected to
   */
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  account_ids: string[];
}
