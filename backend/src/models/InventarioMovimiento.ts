import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IInventarioMovimiento extends Document {
  empresaId: Types.ObjectId;
  concentradoTipoId: Types.ObjectId;
  tipo: 'entrada' | 'salida' | 'ajuste';
  cantidad: number;
  stockAnterior: number;
  stockNuevo: number;
  motivo: string;
  referenciaId?: Types.ObjectId;
  fecha: Date;
  createdAt: Date;
}

const InventarioMovimientoSchema: Schema = new Schema({
  empresaId: { type: Schema.Types.ObjectId, ref: 'Empresa', index: true },
  concentradoTipoId: {
    type: Schema.Types.ObjectId,
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
    type: Schema.Types.ObjectId
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

export default mongoose.model<IInventarioMovimiento>('InventarioMovimiento', InventarioMovimientoSchema);
