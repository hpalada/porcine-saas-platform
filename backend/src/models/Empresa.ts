import mongoose, { Schema, Document } from 'mongoose';

export interface IEmpresa extends Document {
  nombre: string;
  descripcion: string;
  ubicacion: string;
  contacto: string;
  email: string;
  plan: 'gratuito' | 'profesional' | 'empresa';
  usuarioAdminId: mongoose.Types.ObjectId;
  activa: boolean;
  suscripcionActiva: boolean;
  accesoBloqueado: boolean;
  // Preferencias de notificaciones (por empresa)
  notificacionesActivas: boolean;
  alertaStockBajo: boolean;
  nivelStockCritico: number;
  createdAt: Date;
  updatedAt: Date;
}

const empresaSchema = new Schema<IEmpresa>(
  {
    nombre: {
      type: String,
      required: true,
      trim: true,
    },
    descripcion: {
      type: String,
      default: '',
    },
    ubicacion: {
      type: String,
      default: '',
    },
    contacto: {
      type: String,
      default: '',
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
    },
    plan: {
      type: String,
      enum: ['gratuito', 'profesional', 'empresa'],
      default: 'gratuito',
    },
    usuarioAdminId: {
      type: Schema.Types.ObjectId,
      ref: 'Usuario',
      required: true,
    },
    activa: {
      type: Boolean,
      default: true,
    },
    suscripcionActiva: {
      type: Boolean,
      default: true,
    },
    accesoBloqueado: {
      type: Boolean,
      default: false,
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
    },
  },
  { timestamps: true }
);

export const Empresa = mongoose.model<IEmpresa>('Empresa', empresaSchema);
