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
const InventarioMovimientoSchema = new mongoose_1.Schema({
    empresaId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Empresa', index: true },
    concentradoTipoId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'ConcentradoTipo',
        required: true
    },
    tipo: {
        type: String,
        enum: ['entrada', 'salida', 'ajuste'],
        required: true
    },
    cantidad: {
        type: Number,
        required: [true, 'La cantidad es requerida'],
        min: [0.01, 'La cantidad debe ser mayor a 0']
    },
    stockAnterior: {
        type: Number,
        required: true
    },
    stockNuevo: {
        type: Number,
        required: true
    },
    motivo: {
        type: String,
        required: [true, 'El motivo es requerido'],
        trim: true
    },
    referenciaId: {
        type: mongoose_1.Schema.Types.ObjectId
    },
    fecha: {
        type: Date,
        required: true,
        default: Date.now
    }
}, {
    timestamps: true
});
// Índices para consultas eficientes
InventarioMovimientoSchema.index({ concentradoTipoId: 1, fecha: -1 });
InventarioMovimientoSchema.index({ tipo: 1, fecha: -1 });
exports.default = mongoose_1.default.model('InventarioMovimiento', InventarioMovimientoSchema);
//# sourceMappingURL=InventarioMovimiento.js.map