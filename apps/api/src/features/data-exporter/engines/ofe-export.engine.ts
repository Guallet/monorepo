import { Injectable } from '@nestjs/common';
import {
  ExportEngine,
  ExportEngineParams,
  ExportTransaction,
} from './export-engine.interface';
import { normalizeAmount } from './normalize-amount.util';

@Injectable()
export class OfeExportEngine implements ExportEngine {
  readonly fileExtension = '.ofx';
  readonly formatLabel = 'OFX';

  generateContent(params: ExportEngineParams): string {
    const { transactions, accountsMap } = params;

    const dtServer = this.formatOfeDate(new Date());

    // Group transactions by currency so each <STMTTRNRS> block carries a
    // single <CURDEF>, which is what the OFX 1.x SGML spec requires.
    const byCurrency = this.groupByCurrency(transactions);

    let trnUid = 1;
    const stmtBlocks = [...byCurrency.entries()]
      .map(([currency, txs]) => {
        const stmtTrns = txs
          .map((tx) => {
            const normalizedAmount = normalizeAmount(tx.amount);
            const amount = normalizedAmount.toFixed(2);
            const trnType = normalizedAmount < 0 ? 'DEBIT' : 'CREDIT';
            const description = this.escapeOfe(tx.description || '');
            const memo = this.escapeOfe(tx.notes || '');
            const accountName = this.escapeOfe(
              accountsMap.get(tx.accountId) || '',
            );
            return `<STMTTRN><TRNTYPE>${trnType}</TRNTYPE><DTPOSTED>${this.formatOfeDate(tx.date)}</DTPOSTED><TRNAMT>${amount}</TRNAMT><FITID>${tx.id}</FITID><NAME>${description}</NAME><MEMO>${memo}</MEMO><ACCTNAME>${accountName}</ACCTNAME></STMTTRN>`;
          })
          .join('');

        return `<STMTTRNRS><TRNUID>${trnUid++}</TRNUID><STATUS><CODE>0</CODE><SEVERITY>INFO</SEVERITY></STATUS><STMTRS><CURDEF>${currency}</CURDEF><BANKACCTFROM><BANKID>GUALLET</BANKID><ACCTID>EXPORT</ACCTID><ACCTTYPE>CHECKING</ACCTTYPE></BANKACCTFROM><BANKTRANLIST>${stmtTrns}</BANKTRANLIST></STMTRS></STMTTRNRS>`;
      })
      .join('\n');

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
<BANKMSGSRSV1>${stmtBlocks}</BANKMSGSRSV1>
</OFX>`,
    ].join('\n');
  }

  private groupByCurrency(
    transactions: ExportTransaction[],
  ): Map<string, ExportTransaction[]> {
    const map = new Map<string, ExportTransaction[]>();
    for (const tx of transactions) {
      const currency = tx.currency || 'GBP';
      const group = map.get(currency);
      if (group) {
        group.push(tx);
      } else {
        map.set(currency, [tx]);
      }
    }
    return map;
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
