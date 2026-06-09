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
exports.Lote = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const loteSchema = new mongoose_1.Schema({
    empresaId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Empresa',
        required: true,
        index: true,
    },
    nombre: {
        type: String,
        required: true,
        trim: true,
    },
    fechaIngreso: {
        type: Date,
        required: true,
    },
    horaIngreso: {
        type: String,
        match: /^([01]\d|2[0-3]):([0-5]\d)$/,
        default: '00:00',
    },
    cantidadInicial: {
        type: Number,
        required: true,
        min: 1,
    },
    cantidadActual: {
        type: Number,
        required: true,
        min: 0,
    },
    cantidadSalida: {
        type: Number,
        default: 0,
        min: 0,
    },
    cantidadMuertas: {
        type: Number,
        default: 0,
        min: 0,
    },
    estado: {
        type: String,
        enum: ['activo', 'finalizado'],
        default: 'activo',
        index: true,
    },
    descripcion: {
        type: String,
        default: '',
    },
}, { timestamps: true });
// Índices para consultas eficientes
loteSchema.index({ empresaId: 1, estado: 1, fechaIngreso: -1 });
loteSchema.index({ empresaId: 1, fechaIngreso: -1 });
exports.Lote = mongoose_1.default.model('Lote', loteSchema);
//# sourceMappingURL=Lote.js.map