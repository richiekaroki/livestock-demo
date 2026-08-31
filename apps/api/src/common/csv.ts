import type { Response } from 'express';

/** Sanitize a CSV cell value to prevent formula injection */
function sanitizeCell(value: string): string {
  // Prefix with single quote if value starts with formula-triggering characters
  if (/^[=+\-@\t\r]/.test(value)) {
    return `'${value}`;
  }
  return value;
}

export function toCsv(rows: Record<string, unknown>[]): string {
  if (!rows.length) return '';
  const headers = Object.keys(rows[0]);
  const lines = [headers.join(',')];
  for (const row of rows) {
    lines.push(
      headers.map((h) => sanitizeCell(String(row[h] ?? ''))).join(','),
    );
  }
  return lines.join('\n');
}

export function sendCsv(res: Response, rows: string, filename: string) {
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="${filename}-${new Date().toISOString().slice(0, 10)}.csv"`,
  );
  res.send(rows);
}
