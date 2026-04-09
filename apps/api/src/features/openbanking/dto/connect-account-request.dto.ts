import { IsString, IsNotEmpty, IsUrl } from 'class-validator';

export class ConnectBankInstitutionRequestDto {
  /**
   * The Institution ID to the bank to connect
   */
  @IsString()
  @IsNotEmpty()
  institution_id: string;

  /**
   * The URL where the login will redirect after a bank connection.
   * Must be a valid URL to prevent open redirect attacks.
   */
  @IsUrl({ require_tld: false })
  @IsNotEmpty()
  redirect_to: string;
}
