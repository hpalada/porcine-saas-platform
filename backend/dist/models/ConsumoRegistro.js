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
const ConsumoRegistroSchema = new mongoose_1.Schema({
    empresaId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Empresa', index: true },
    loteId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Lote',
        required: [true, 'El lote es requerido']
    },
    concentradoTipoId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'ConcentradoTipo',
        required: [true, 'El tipo de concentrado es requerido']
    },
    cantidad: {
        type: Number,
        required: [true, 'La cantidad es requerida'],
        min: [0.01, 'La cantidad debe ser mayor a 0']
    },
    precioUnitario: {
        type: Number,
        required: [true, 'El precio unitario es requerido'],
        min: [0, 'El precio no puede ser negativo']
    },
    costoTotal: {
        type: Number,
        required: [true, 'El costo total es requerido'],
        min: [0, 'El costo no puede ser negativo']
    },
    fecha: {
        type: Date,
        required: true,
        default: Date.now
    },
    observaciones: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});
// Índices compuestos para consultas eficientes
ConsumoRegistroSchema.index({ loteId: 1, fecha: -1 });
ConsumoRegistroSchema.index({ concentradoTipoId: 1, fecha: -1 });
ConsumoRegistroSchema.index({ fecha: -1 });
// Pre-save hook para calcular costoTotal si no se proporciona
ConsumoRegistroSchema.pre('save', function (next) {
    const doc = this;
    if (doc.isModified('cantidad') || doc.isModified('precioUnitario')) {
        doc.costoTotal = doc.cantidad * doc.precioUnitario;
    }
    next();
});
exports.default = mongoose_1.default.model('ConsumoRegistro', ConsumoRegistroSchema);
//# sourceMappingURL=ConsumoRegistro.js.map