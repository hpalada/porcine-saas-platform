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
const VacunacionLoteSchema = new mongoose_1.Schema({
    empresaId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Empresa', required: true, index: true },
    loteId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Lote', required: [true, 'El lote es requerido'], index: true },
    vacuna: { type: String, required: [true, 'El nombre de la vacuna es requerido'], trim: true },
    fecha: { type: Date, required: true, default: Date.now },
    dosis: { type: String, required: [true, 'La dosis es requerida'], trim: true },
    aplicadoPor: { type: String, trim: true },
    observaciones: { type: String, trim: true },
    proximaFecha: { type: Date },
}, { timestamps: true });
VacunacionLoteSchema.index({ empresaId: 1, loteId: 1, fecha: -1 });
exports.default = mongoose_1.default.model('VacunacionLote', VacunacionLoteSchema);
//# sourceMappingURL=VacunacionLote.js.map