import { ApiProperty } from '@nestjs/swagger';

export class OfeImportRequestDto {
  @ApiProperty({
    description: 'Raw OFE/OFX file content',
    example:
      'OFXHEADER:100\nDATA:OFXSGML\nVERSION:102\n\n<OFX><BANKMSGSRSV1><STMTTRNRS><STMTRS><BANKTRANLIST><STMTTRN><DTPOSTED>20240101120000[-3:GMT]</DTPOSTED><TRNAMT>-10.50</TRNAMT><NAME>Coffee</NAME></STMTTRN></BANKTRANLIST></STMTRS></STMTTRNRS></BANKMSGSRSV1></OFX>',
  })
  ofeContent: string;
}
