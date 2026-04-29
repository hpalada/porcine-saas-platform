import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IConsumoRegistro extends Document {
  empresaId: Types.ObjectId;
  loteId: Types.ObjectId;
  concentradoTipoId: Types.ObjectId;
  cantidad: number;
  precioUnitario: number;
  costoTotal: number;
  fecha: Date;
  observaciones?: string;
  createdAt: Date;
}

const ConsumoRegistroSchema: Schema = new Schema({
  empresaId: { type: Schema.Types.ObjectId, ref: 'Empresa', index: true },
  loteId: {
    type: Schema.Types.ObjectId,
    ref: 'Lote',
    required: [true, 'El lote es requerido']
  },
  concentradoTipoId: {
    type: Schema.Types.ObjectId,
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
ConsumoRegistroSchema.pre('save', function(next) {
  const doc = this as any;
  if (doc.isModified('cantidad') || doc.isModified('precioUnitario')) {
    doc.costoTotal = doc.cantidad * doc.precioUnitario;
  }
  next();
});

export default mongoose.model<IConsumoRegistro>('ConsumoRegistro', ConsumoRegistroSchema);
