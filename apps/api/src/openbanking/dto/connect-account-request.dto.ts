export class ConnectBankInstitutionRequestDto {
  /**
   * The Institution ID to the bank to connect
   */
  institution_id: string;

  /**
   * The URL where the login will redirect after a bank connection
   */
  redirect_to: string;
}
