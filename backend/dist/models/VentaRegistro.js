"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const VentaRegistroSchema = new mongoose_1.Schema({
    empresaId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Empresa', index: true },
    loteId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Lote', required: [true, 'El lote es requerido'] },
    cantidadCerdos: { type: Number, required: [true, 'La cantidad de cerdos es requerida'], min: [1, 'Debe venderse al menos 1'] },
    pesoTotalKg: { type: Number, required: [true, 'El peso total es requerido'], min: [0.1, 'El peso debe ser mayor a 0'] },
    pesoTotalLb: { type: Number },
    unidadPeso: { type: String, enum: ['kg', 'lb'], default: 'kg' },
    precioPorKg: { type: Number, required: [true, 'El precio por kg es requerido'], min: [0, 'El precio no puede ser negativo'] },
    ingresoTotal: { type: Number, required: [true, 'El ingreso total es requerido'], min: [0] },
    fechaVenta: { type: Date, required: true, default: Date.now },
    comprador: { type: String, trim: true },
}, { timestamps: true });
VentaRegistroSchema.index({ empresaId: 1, loteId: 1, fechaVenta: -1 });
exports.default = mongoose_1.default.model('VentaRegistro', VentaRegistroSchema);
//# sourceMappingURL=VentaRegistro.js.map