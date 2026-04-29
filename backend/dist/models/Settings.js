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
exports.Settings = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const settingsSchema = new mongoose_1.Schema({
    idioma: {
        type: String,
        enum: ['es', 'en', 'fr'],
        default: 'es',
    },
    tema: {
        type: String,
        enum: ['light', 'dark', 'auto'],
        default: 'dark',
    },
    nombreGranja: {
        type: String,
        default: 'Mi Granja Porcina',
        trim: true,
    },
    ubicacion: {
        type: String,
        default: '',
        trim: true,
    },
    contacto: {
        type: String,
        default: '',
        trim: true,
    },
    email: {
        type: String,
        default: '',
        lowercase: true,
        trim: true,
    },
    moneda: {
        type: String,
        enum: ['HNL', 'USD'],
        default: 'HNL',
    },
    tasaCambio: {
        type: Number,
        default: 24.5,
        min: 0,
    },
    notificacionesActivas: {
        type: Boolean,
        default: true,
    },
    alertaStockBajo: {
        type: Boolean,
        default: true,
    },
    nivelStockCritico: {
        type: Number,
        default: 50,
        min: 0,
        max: 100,
    },
    horaBackup: {
        type: String,
        default: '02:00',
        match: /^([01]\d|2[0-3]):([0-5]\d)$/,
    },
    backupAutomatico: {
        type: Boolean,
        default: true,
    },
    registroAuditoria: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
});
// Asegurar que solo hay un documento de configuración
settingsSchema.pre('save', async function (next) {
    if (this.isNew) {
        const count = await mongoose_1.default.model('Settings').countDocuments();
        if (count > 0) {
            throw new Error('Solo puede existir un documento de configuración');
        }
    }
    next();
});
exports.Settings = mongoose_1.default.model('Settings', settingsSchema);
//# sourceMappingURL=Settings.js.map