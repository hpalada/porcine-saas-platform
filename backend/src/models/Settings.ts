import mongoose, { Schema, Document } from 'mongoose';

export interface ISettings extends Document {
  // Configuración de idioma
  idioma: 'es' | 'en' | 'fr';
  
  // Configuración de tema
  tema: 'light' | 'dark' | 'auto';
  
  // Información de la granja
  nombreGranja: string;
  ubicacion: string;
  contacto: string;
  email: string;
  
  // Configuración de moneda
  moneda: 'HNL' | 'USD';
  tasaCambio: number; // USD a HNL
  
  // Configuración de notificaciones
  notificacionesActivas: boolean;
  alertaStockBajo: boolean;
  nivelStockCritico: number; // % de stock mínimo
  
  // Configuración de sistema
  horaBackup: string; // HH:mm
  backupAutomatico: boolean;
  registroAuditoria: boolean;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

const settingsSchema = new Schema<ISettings>(
  {
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
  },
  {
    timestamps: true,
  }
);

// Asegurar que solo hay un documento de configuración
settingsSchema.pre('save', async function (next) {
  if (this.isNew) {
    const count = await mongoose.model('Settings').countDocuments();
    if (count > 0) {
      throw new Error('Solo puede existir un documento de configuración');
    }
  }
  next();
});

export const Settings = mongoose.model<ISettings>('Settings', settingsSchema);
