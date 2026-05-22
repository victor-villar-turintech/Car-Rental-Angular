export interface CsvColumn<T> {
  header: string;
  value: (row: T) => string | number | boolean | null | undefined;
}

export function buildCsv<T>(rows: T[], columns: CsvColumn<T>[]): string {
  const headerRow = columns.map((column) => escapeCsvCell(column.header)).join(',');
  const dataRows = rows.map((row) =>
    columns.map((column) => escapeCsvCell(column.value(row))).join(',')
  );
  return [headerRow, ...dataRows].join('\r\n');
}

export function downloadCsv<T>(filename: string, rows: T[], columns: CsvColumn<T>[]): void {
  if (typeof document === 'undefined') {
    return;
  }
  const csv = buildCsv(rows, columns);
  const blob = new Blob(['\ufeff', csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function escapeCsvCell(value: string | number | boolean | null | undefined): string {
  if (value === null || value === undefined) {
    return '';
  }
  const text = typeof value === 'string' ? value : String(value);
  const needsEscaping = /[",\r\n]/.test(text) || text.startsWith(' ') || text.endsWith(' ');
  if (!needsEscaping) {
    return text;
  }
  return '"' + text.replace(/"/g, '""') + '"';
}

export function timestampedFilename(prefix: string): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const mi = String(now.getMinutes()).padStart(2, '0');
  return `${prefix}-${yyyy}${mm}${dd}-${hh}${mi}.csv`;
}
