import { Platform } from 'react-native';
import type { Livestock } from '@wam-mfugo/shared';

function buildCSV(animals: Livestock[]): string {
  const headers = ['ID', 'Name', 'Type', 'Health', 'County', 'Owner', 'Breed', 'Lat', 'Lng'];
  const rows = animals.map((a) => [
    a.id, a.name, a.type, a.health, a.county, a.owner,
    a.breed || '', a.lat || 0, a.lng || 0,
  ]);
  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

function buildJSON(animals: Livestock[]): string {
  return JSON.stringify({
    exportDate: new Date().toISOString(),
    source: 'Wam Mfugo',
    format: 'KALRO',
    version: '1.0',
    count: animals.length,
    animals: animals.map((a) => ({
      id: a.id, name: a.name, species: a.type,
      healthStatus: a.health, county: a.county, owner: a.owner,
      breed: a.breed || null,
      location: { lat: a.lat || 0, lng: a.lng || 0 },
    })),
  }, null, 2);
}

function buildPDF(animals: Livestock[]): string {
  const sick = animals.filter((a) => a.health === 'Sick').length;
  const healthy = animals.filter((a) => a.health === 'Healthy').length;
  const treatment = animals.filter((a) => a.health === 'Under Treatment').length;
  const counties = new Set(animals.map((a) => a.county)).size;
  const date = new Date().toLocaleDateString('en-KE', { day: 'numeric', month: 'long', year: 'numeric' });

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Wam Mfugo Report</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,system-ui,sans-serif;color:#1B2E1B;background:#FAFDF7;padding:32px}h1{font-size:24px;font-weight:700;color:#15803D;margin-bottom:4px}.sub{font-size:13px;color:#6B8A6B;margin-bottom:24px}.stats{display:flex;gap:16px;margin-bottom:24px}.stat{flex:1;padding:16px;border:1px solid #C8E6C9;border-radius:12px;text-align:center}.stat b{font-size:28px;font-family:'SF Mono',monospace;display:block}.stat span{font-size:12px;color:#6B8A6B;display:block;margin-top:4px}.g b{color:#15803D}.r b{color:#DC2626}.a b{color:#D97706}table{width:100%;border-collapse:collapse;font-size:13px}th{background:#F0FDF4;text-align:left;padding:10px 12px;border-bottom:2px solid #C8E6C9;font-weight:600}td{padding:8px 12px;border-bottom:1px solid #E8F5E9}tr:nth-child(even){background:#FAFDF7}.b{display:inline-block;padding:2px 8px;border-radius:999px;font-size:11px;font-weight:500}.bh{background:#DCFCE7;color:#15803D}.bs{background:#FEF2F2;color:#DC2626}.bt{background:#FEF3C7;color:#D97706}.br{background:#F0F9FF;color:#0284C7}.ft{margin-top:24px;font-size:11px;color:#6B8A6B;border-top:1px solid #C8E6C9;padding-top:12px}</style></head><body>
<h1>Wam Mfugo Livestock Report</h1><div class="sub">Generated ${date}</div>
<div class="stats"><div class="stat"><b>${animals.length}</b><span>Total Animals</span></div><div class="stat g"><b>${healthy}</b><span>Healthy</span></div><div class="stat r"><b>${sick}</b><span>Sick</span></div><div class="stat a"><b>${treatment}</b><span>Under Treatment</span></div><div class="stat"><b>${counties}</b><span>Counties</span></div></div>
<table><thead><tr><th>Name</th><th>Type</th><th>Health</th><th>County</th><th>Owner</th></tr></thead><tbody>
${animals.map((a) => {
  const cls = a.health === 'Healthy' ? 'bh' : a.health === 'Sick' ? 'bs' : a.health === 'Under Treatment' ? 'bt' : 'br';
  return `<tr><td>${a.name}</td><td>${a.type}</td><td><span class="b ${cls}">${a.health}</span></td><td>${a.county}</td><td>${a.owner}</td></tr>`;
}).join('')}
</tbody></table>
<div class="ft">Wam Mfugo - Kenya Livestock Management System</div></body></html>`;
}

async function shareFile(content: string, filename: string, mimeType: string) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const FileSystem = require('expo-file-system');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Sharing = require('expo-sharing');
  const fileUri = FileSystem.documentDirectory + filename;
  await FileSystem.writeAsStringAsync(fileUri, content, { encoding: FileSystem.EncodingType.UTF8 });
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(fileUri, { mimeType, dialogTitle: 'Export Data' });
  }
}

export async function exportCSV(animals: Livestock[]) {
  const csv = buildCSV(animals);
  if (Platform.OS === 'web') {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `wam-mfugo-animals-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
    return;
  }
  await shareFile(csv, `wam-mfugo-animals-${Date.now()}.csv`, 'text/csv');
}

export async function exportJSON(animals: Livestock[]) {
  const json = buildJSON(animals);
  if (Platform.OS === 'web') {
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `wam-mfugo-kalro-${Date.now()}.json`; a.click();
    URL.revokeObjectURL(url);
    return;
  }
  await shareFile(json, `wam-mfugo-kalro-${Date.now()}.json`, 'application/json');
}

export async function exportPDF(animals: Livestock[]) {
  const html = buildPDF(animals);
  if (Platform.OS === 'web') {
    const win = window.open('', '_blank');
    if (win) { win.document.write(html); win.document.close(); win.print(); }
    return;
  }
  await shareFile(html, `wam-mfugo-report-${Date.now()}.html`, 'text/html');
}
