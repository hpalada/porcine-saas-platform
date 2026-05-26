import mongoose, { Schema, Document } from 'mongoose';

export interface ILote extends Document {
  empresaId: mongoose.Types.ObjectId;
  nombre: string;
  fechaIngreso: Date;
  horaIngreso: string;
  cantidadInicial: number;
  cantidadActual: number;
  cantidadSalida: number;
  cantidadMuertas: number;
  estado: 'activo' | 'finalizado';
  descripcion?: string;
  createdAt: Date;
  updatedAt: Date;
}

const loteSchema = new Schema<ILote>(
  {
    empresaId: {
      type: Schema.Types.ObjectId,
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
  },
  { timestamps: true }
);

// Índices para consultas eficientes
loteSchema.index({ empresaId: 1, estado: 1, fechaIngreso: -1 });
loteSchema.index({ empresaId: 1, fechaIngreso: -1 });

export const Lote = mongoose.model<ILote>('Lote', loteSchema);
