"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Genera un Excel y PDF de prueba para el primer lote con datos.
 * Llama al controller directamente sin pasar por HTTP.
 */
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const Lote_1 = require("../models/Lote");
const reportes_controller_1 = require("../controllers/reportes.controller");
dotenv_1.default.config();
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/porcine-saas';
class MockResponse {
    headers = {};
    chunks = [];
    statusCode = 200;
    setHeader(k, v) { this.headers[k] = v; }
    status(c) { this.statusCode = c; return this; }
    send(b) { this.chunks.push(Buffer.isBuffer(b) ? b : Buffer.from(b)); return this; }
    write(b) { this.chunks.push(Buffer.isBuffer(b) ? b : Buffer.from(b)); return true; }
    end() { return this; }
    on() { return this; }
    once() { return this; }
    emit() { return this; }
    json(o) { this.chunks.push(Buffer.from(JSON.stringify(o))); return this; }
    pipe(_) { return this; }
    get buffer() { return Buffer.concat(this.chunks); }
}
async function exportFile(loteId, empresaId, formato) {
    const req = { params: { loteId }, query: { formato }, empresaId };
    const res = new MockResponse();
    if (formato === 'pdf') {
        // PDFKit usa pipe — necesitamos capturar via .write/.end
        const PDFDocument = (await import('pdfkit')).default;
        const origPipe = PDFDocument.prototype.pipe;
        PDFDocument.prototype.pipe = function (dest) {
            this.on('data', (chunk) => dest.write(chunk));
            this.on('end', () => dest.end?.());
            return dest;
        };
        await reportes_controller_1.reportesController.exportar(req, res);
        PDFDocument.prototype.pipe = origPipe;
        // Espera a que termine de escribir
        await new Promise(r => setTimeout(r, 500));
    }
    else {
        await reportes_controller_1.reportesController.exportar(req, res);
    }
    return res;
}
async function run() {
    await mongoose_1.default.connect(MONGO_URI);
    const lote = await Lote_1.Lote.findOne({ cantidadInicial: { $gt: 0 } });
    if (!lote) {
        console.log('No hay lote con datos');
        process.exit(0);
    }
    console.log(`Generando reportes para lote: ${lote.nombre} (empresa: ${lote.empresaId})`);
    const outDir = path_1.default.join(__dirname, '../../tmp');
    if (!fs_1.default.existsSync(outDir))
        fs_1.default.mkdirSync(outDir, { recursive: true });
    // Excel
    const xlsxRes = await exportFile(String(lote._id), String(lote.empresaId), 'excel');
    const xlsxPath = path_1.default.join(outDir, 'reporte-test.xlsx');
    fs_1.default.writeFileSync(xlsxPath, xlsxRes.buffer);
    console.log(`✅ Excel: ${xlsxPath} (${xlsxRes.buffer.length} bytes, status ${xlsxRes.statusCode})`);
    console.log(`   Content-Type: ${xlsxRes.headers['Content-Type']}`);
    // PDF
    const pdfRes = await exportFile(String(lote._id), String(lote.empresaId), 'pdf');
    const pdfPath = path_1.default.join(outDir, 'reporte-test.pdf');
    fs_1.default.writeFileSync(pdfPath, pdfRes.buffer);
    console.log(`✅ PDF:   ${pdfPath} (${pdfRes.buffer.length} bytes, status ${pdfRes.statusCode})`);
    console.log(`   Content-Type: ${pdfRes.headers['Content-Type']}`);
    await mongoose_1.default.disconnect();
}
run().catch((e) => { console.error('❌ Error:', e); process.exit(1); });
//# sourceMappingURL=test-export.js.map