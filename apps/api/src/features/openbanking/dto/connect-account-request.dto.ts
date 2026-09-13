import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsUrl } from 'class-validator';

export class ConnectBankInstitutionRequestDto {
  /**
   * The Institution ID to the bank to connect
   */
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  institution_id: string;

  /**
   * The URL where the login will redirect after a bank connection.
   * Must be a valid URL to prevent open redirect attacks.
   */
  @ApiProperty()
  @IsUrl({ require_tld: false })
  @IsNotEmpty()
  redirect_to: string;
}
