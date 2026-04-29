/**
 * Genera un Excel y PDF de prueba para el primer lote con datos.
 * Llama al controller directamente sin pasar por HTTP.
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { Lote } from '../models/Lote';
import { reportesController } from '../controllers/reportes.controller';
dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/porcine-saas';

class MockResponse {
  headers: Record<string, string> = {};
  chunks: Buffer[] = [];
  statusCode = 200;
  setHeader(k: string, v: string) { this.headers[k] = v; }
  status(c: number) { this.statusCode = c; return this; }
  send(b: any) { this.chunks.push(Buffer.isBuffer(b) ? b : Buffer.from(b)); return this; }
  write(b: any) { this.chunks.push(Buffer.isBuffer(b) ? b : Buffer.from(b)); return true; }
  end() { return this; }
  on() { return this; }
  once() { return this; }
  emit() { return this; }
  json(o: any) { this.chunks.push(Buffer.from(JSON.stringify(o))); return this; }
  pipe(_: any) { return this; }
  get buffer() { return Buffer.concat(this.chunks); }
}

async function exportFile(loteId: string, empresaId: string, formato: 'excel' | 'pdf') {
  const req: any = { params: { loteId }, query: { formato }, empresaId };
  const res: any = new MockResponse();

  if (formato === 'pdf') {
    // PDFKit usa pipe — necesitamos capturar via .write/.end
    const PDFDocument = (await import('pdfkit')).default;
    const origPipe = PDFDocument.prototype.pipe;
    PDFDocument.prototype.pipe = function (this: any, dest: any) {
      this.on('data', (chunk: Buffer) => dest.write(chunk));
      this.on('end', () => dest.end?.());
      return dest;
    };
    await reportesController.exportar(req, res);
    PDFDocument.prototype.pipe = origPipe;
    // Espera a que termine de escribir
    await new Promise(r => setTimeout(r, 500));
  } else {
    await reportesController.exportar(req, res);
  }
  return res;
}

async function run() {
  await mongoose.connect(MONGO_URI);
  const lote = await Lote.findOne({ cantidadInicial: { $gt: 0 } });
  if (!lote) { console.log('No hay lote con datos'); process.exit(0); }

  console.log(`Generando reportes para lote: ${lote.nombre} (empresa: ${lote.empresaId})`);

  const outDir = path.join(__dirname, '../../tmp');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  // Excel
  const xlsxRes = await exportFile(String(lote._id), String(lote.empresaId), 'excel');
  const xlsxPath = path.join(outDir, 'reporte-test.xlsx');
  fs.writeFileSync(xlsxPath, xlsxRes.buffer);
  console.log(`✅ Excel: ${xlsxPath} (${xlsxRes.buffer.length} bytes, status ${xlsxRes.statusCode})`);
  console.log(`   Content-Type: ${xlsxRes.headers['Content-Type']}`);

  // PDF
  const pdfRes = await exportFile(String(lote._id), String(lote.empresaId), 'pdf');
  const pdfPath = path.join(outDir, 'reporte-test.pdf');
  fs.writeFileSync(pdfPath, pdfRes.buffer);
  console.log(`✅ PDF:   ${pdfPath} (${pdfRes.buffer.length} bytes, status ${pdfRes.statusCode})`);
  console.log(`   Content-Type: ${pdfRes.headers['Content-Type']}`);

  await mongoose.disconnect();
}

run().catch((e) => { console.error('❌ Error:', e); process.exit(1); });
