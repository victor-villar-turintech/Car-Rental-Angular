import { buildCsv, escapeCsvCell, timestampedFilename, CsvColumn } from './csv-export';

describe('escapeCsvCell', () => {
  it('returns empty string for null and undefined', () => {
    expect(escapeCsvCell(null)).toBe('');
    expect(escapeCsvCell(undefined)).toBe('');
  });

  it('passes plain text through unchanged', () => {
    expect(escapeCsvCell('London')).toBe('London');
    expect(escapeCsvCell(42)).toBe('42');
  });

  it('wraps values with commas, quotes, or newlines in double quotes', () => {
    expect(escapeCsvCell('A, B')).toBe('"A, B"');
    expect(escapeCsvCell('she said "hi"')).toBe('"she said ""hi"""');
    expect(escapeCsvCell('line 1\nline 2')).toBe('"line 1\nline 2"');
  });

  it('wraps strings with leading or trailing whitespace', () => {
    expect(escapeCsvCell(' London')).toBe('" London"');
    expect(escapeCsvCell('London ')).toBe('"London "');
  });
});

describe('buildCsv', () => {
  interface SampleRow {
    name: string;
    age: number;
    notes?: string;
  }

  const columns: CsvColumn<SampleRow>[] = [
    { header: 'Name', value: (row) => row.name },
    { header: 'Age', value: (row) => row.age },
    { header: 'Notes', value: (row) => row.notes }
  ];

  it('emits a header row followed by data rows separated by CRLF', () => {
    const csv = buildCsv([
      { name: 'Alice', age: 30, notes: 'demo' },
      { name: 'Bob', age: 40 }
    ], columns);
    expect(csv).toBe('Name,Age,Notes\r\nAlice,30,demo\r\nBob,40,');
  });

  it('escapes data cells that need quoting', () => {
    const csv = buildCsv([
      { name: 'Eve, the bandit', age: 99, notes: 'has a "quote"' }
    ], columns);
    expect(csv).toContain('"Eve, the bandit"');
    expect(csv).toContain('"has a ""quote"""');
  });
});

describe('timestampedFilename', () => {
  it('produces a CSV filename with prefix and YYYYMMDD-HHMM stamp', () => {
    const name = timestampedFilename('bookings');
    expect(name).toMatch(/^bookings-\d{8}-\d{4}\.csv$/);
  });
});
