function escapeCell(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string')
    return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
  if (typeof value === 'number' || typeof value === 'boolean')
    return String(value);
  // Objects/arrays — best-effort serialization
  // eslint-disable-next-line @typescript-eslint/no-base-to-string
  return String(value);
}

export function toCsv(rows: Array<Record<string, unknown>>): string {
  if (rows.length === 0) return '';
  const headers = Object.keys(rows[0]);
  const lines = rows.map((row) =>
    headers.map((h) => escapeCell(row[h])).join(','),
  );
  return [headers.join(','), ...lines].join('\r\n');
}
