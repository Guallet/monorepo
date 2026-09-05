import { OfeExportEngine } from './ofe-export.engine.js';
import { ExportEngineParams } from './export-engine.interface.js';

describe('OfeExportEngine', () => {
  let engine: OfeExportEngine;

  beforeEach(() => {
    engine = new OfeExportEngine();
  });

  const baseParams = (): ExportEngineParams => ({
    transactions: [
      {
        id: 'tx-1',
        accountId: 'acc-1',
        description: 'Coffee',
        notes: 'morning',
        amount: -3.5,
        currency: 'GBP',
        date: new Date('2024-03-01T10:00:00Z'),
        categoryId: null,
      },
      {
        id: 'tx-2',
        accountId: 'acc-1',
        description: 'Salary',
        notes: '',
        amount: '2500.00',
        currency: 'GBP',
        date: new Date('2024-03-02T08:00:00Z'),
        categoryId: null,
      },
    ],
    accountsMap: new Map([['acc-1', 'Current Account']]),
    categoriesMap: new Map(),
  });

  it('should produce valid OFX headers', () => {
    const output = engine.generateContent(baseParams());

    expect(output).toContain('OFXHEADER:100');
    expect(output).toContain('DATA:OFXSGML');
    expect(output).toContain('<OFX>');
    expect(output).toContain('</OFX>');
  });

  it('should emit a single <STMTTRNRS> for a single-currency export', () => {
    const output = engine.generateContent(baseParams());

    const stmtCount = (output.match(/<STMTTRNRS>/g) ?? []).length;
    expect(stmtCount).toBe(1);
    expect(output).toContain('<CURDEF>GBP</CURDEF>');
  });

  it('should emit one <STMTTRNRS> per currency for multi-currency exports', () => {
    const params: ExportEngineParams = {
      ...baseParams(),
      transactions: [
        {
          id: 'tx-1',
          accountId: 'acc-1',
          description: 'Coffee',
          notes: '',
          amount: -3.5,
          currency: 'GBP',
          date: new Date('2024-03-01T10:00:00Z'),
          categoryId: null,
        },
        {
          id: 'tx-2',
          accountId: 'acc-2',
          description: 'Hotel',
          notes: '',
          amount: -120,
          currency: 'EUR',
          date: new Date('2024-03-05T12:00:00Z'),
          categoryId: null,
        },
        {
          id: 'tx-3',
          accountId: 'acc-2',
          description: 'Dinner',
          notes: '',
          amount: -45.5,
          currency: 'EUR',
          date: new Date('2024-03-06T19:00:00Z'),
          categoryId: null,
        },
      ],
      accountsMap: new Map([
        ['acc-1', 'GBP Account'],
        ['acc-2', 'EUR Account'],
      ]),
    };

    const output = engine.generateContent(params);

    const stmtCount = (output.match(/<STMTTRNRS>/g) ?? []).length;
    expect(stmtCount).toBe(2);
    expect(output).toContain('<CURDEF>GBP</CURDEF>');
    expect(output).toContain('<CURDEF>EUR</CURDEF>');

    // TRNUID must be unique across blocks
    expect(output).toContain('<TRNUID>1</TRNUID>');
    expect(output).toContain('<TRNUID>2</TRNUID>');

    // Each currency's transactions must appear in the right block
    const gbpIndex = output.indexOf('<CURDEF>GBP</CURDEF>');
    const eurIndex = output.indexOf('<CURDEF>EUR</CURDEF>');
    const coffeeIndex = output.indexOf('Coffee');
    const hotelIndex = output.indexOf('Hotel');
    expect(coffeeIndex).toBeGreaterThan(gbpIndex);
    expect(hotelIndex).toBeGreaterThan(eurIndex);
  });

  it('should assign TRNTYPE DEBIT for negative amounts and CREDIT for positive', () => {
    const output = engine.generateContent(baseParams());

    expect(output).toContain('<TRNTYPE>DEBIT</TRNTYPE>');
    expect(output).toContain('<TRNTYPE>CREDIT</TRNTYPE>');
  });

  it('should normalise string amounts from TypeORM decimal columns', () => {
    const params: ExportEngineParams = {
      ...baseParams(),
      transactions: [
        {
          id: 'tx-1',
          accountId: 'acc-1',
          description: 'Test',
          notes: '',
          amount: '99.99' as unknown as number,
          currency: 'GBP',
          date: new Date('2024-03-01T00:00:00Z'),
          categoryId: null,
        },
      ],
    };

    const output = engine.generateContent(params);
    expect(output).toContain('<TRNAMT>99.99</TRNAMT>');
  });

  it('should default missing currency to GBP', () => {
    const params: ExportEngineParams = {
      ...baseParams(),
      transactions: [
        {
          id: 'tx-1',
          accountId: 'acc-1',
          description: 'Test',
          notes: '',
          amount: 10,
          currency: '',
          date: new Date('2024-03-01T00:00:00Z'),
          categoryId: null,
        },
      ],
    };

    const output = engine.generateContent(params);
    expect(output).toContain('<CURDEF>GBP</CURDEF>');
  });

  it('should escape XML-special characters in description and memo', () => {
    const params: ExportEngineParams = {
      ...baseParams(),
      transactions: [
        {
          id: 'tx-1',
          accountId: 'acc-1',
          description: 'Tom & Jerry <Inc>',
          notes: '<script>alert(1)</script>',
          amount: 10,
          currency: 'GBP',
          date: new Date('2024-03-01T00:00:00Z'),
          categoryId: null,
        },
      ],
    };

    const output = engine.generateContent(params);
    expect(output).toContain('Tom &amp; Jerry &lt;Inc>');
    expect(output).toContain('&lt;script>alert(1)&lt;/script>');
  });

  it('should produce an empty <BANKMSGSRSV1> when there are no transactions', () => {
    const params: ExportEngineParams = {
      transactions: [],
      accountsMap: new Map(),
      categoriesMap: new Map(),
    };

    const output = engine.generateContent(params);
    expect(output).toContain('<BANKMSGSRSV1></BANKMSGSRSV1>');
  });
});
