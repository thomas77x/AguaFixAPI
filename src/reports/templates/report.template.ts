import { CreateReportDto } from '../dto/create-report.dto';

function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

export function generateReportTemplate(dto: CreateReportDto): string {
  const rows = [
    ['Dirección', dto.address],
    ['Descripción', dto.description],
    ['Severidad', dto.severity],
    ['Teléfono de contacto', dto.reporterPhone],
  ].map(([label, value]) => `
    <tr>
      <th scope="row" style="padding:12px;border:1px solid #d1d5db;text-align:left;vertical-align:top;background:#f3f4f6;">${label}</th>
      <td style="padding:12px;border:1px solid #d1d5db;white-space:pre-wrap;overflow-wrap:anywhere;">${escapeHtml(value)}</td>
    </tr>`).join('');

  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><title>Reporte de fuga de agua</title></head>
<body style="margin:0;padding:24px;background:#f8fafc;color:#1f2937;font-family:Arial,sans-serif;line-height:1.5;">
  <h1 style="font-size:24px;color:#075985;">Nuevo reporte de fuga de agua</h1>
  <p>Cuadrilla de mantenimiento: se registró una fuga con los siguientes datos.</p>
  <table style="border-collapse:collapse;width:100%;max-width:640px;background:#ffffff;">
    <tbody>${rows}</tbody>
  </table>
  <p>AguaFix · Aviso de reporte ciudadano</p>
</body>
</html>`;
}
