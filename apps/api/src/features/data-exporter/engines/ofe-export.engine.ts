import { Injectable } from '@nestjs/common';
import { ExportEngine, ExportEngineParams } from './export-engine.interface';
import { normalizeAmount } from './normalize-amount.util';

@Injectable()
export class OfeExportEngine implements ExportEngine {
  readonly fileExtension = '.ofx';
  readonly formatLabel = 'OFE';

  generateContent(params: ExportEngineParams): string {
    const { transactions, accountsMap } = params;

    const dtServer = this.formatOfeDate(new Date());
    const currency = transactions[0]?.currency || 'GBP';
    const stmtTrns = transactions
      .map((tx) => {
        const normalizedAmount = normalizeAmount(tx.amount);
        const amount = normalizedAmount.toFixed(2);
        const trnType = normalizedAmount < 0 ? 'DEBIT' : 'CREDIT';
        const description = this.escapeOfe(tx.description || '');
        const memo = this.escapeOfe(tx.notes || '');
        const accountName = this.escapeOfe(accountsMap.get(tx.accountId) || '');
        return `<STMTTRN><TRNTYPE>${trnType}</TRNTYPE><DTPOSTED>${this.formatOfeDate(tx.date)}</DTPOSTED><TRNAMT>${amount}</TRNAMT><FITID>${tx.id}</FITID><NAME>${description}</NAME><MEMO>${memo}</MEMO><ACCTNAME>${accountName}</ACCTNAME></STMTTRN>`;
      })
      .join('');

    return [
      'OFXHEADER:100',
      'DATA:OFXSGML',
      'VERSION:102',
      'SECURITY:NONE',
      'ENCODING:USASCII',
      'CHARSET:1252',
      'COMPRESSION:NONE',
      'OLDFILEUID:NONE',
      'NEWFILEUID:NONE',
      '',
      `<OFX>
<SIGNONMSGSRSV1><SONRS><STATUS><CODE>0</CODE><SEVERITY>INFO</SEVERITY></STATUS><DTSERVER>${dtServer}</DTSERVER><LANGUAGE>ENG</LANGUAGE></SONRS></SIGNONMSGSRSV1>
<BANKMSGSRSV1><STMTTRNRS><TRNUID>1</TRNUID><STATUS><CODE>0</CODE><SEVERITY>INFO</SEVERITY></STATUS><STMTRS><CURDEF>${currency}</CURDEF><BANKACCTFROM><BANKID>GUALLET</BANKID><ACCTID>EXPORT</ACCTID><ACCTTYPE>CHECKING</ACCTTYPE></BANKACCTFROM><BANKTRANLIST>${stmtTrns}</BANKTRANLIST></STMTRS></STMTTRNRS></BANKMSGSRSV1>
</OFX>`,
    ].join('\n');
  }

  private formatOfeDate(date: Date): string {
    const year = date.getUTCFullYear();
    const month = `${date.getUTCMonth() + 1}`.padStart(2, '0');
    const day = `${date.getUTCDate()}`.padStart(2, '0');
    const hours = `${date.getUTCHours()}`.padStart(2, '0');
    const minutes = `${date.getUTCMinutes()}`.padStart(2, '0');
    const seconds = `${date.getUTCSeconds()}`.padStart(2, '0');
    return `${year}${month}${day}${hours}${minutes}${seconds}`;
  }

  private escapeOfe(value: string): string {
    return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;');
  }
}
