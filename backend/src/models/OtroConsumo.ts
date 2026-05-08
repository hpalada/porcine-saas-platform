import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IOtroConsumo extends Document {
  empresaId: Types.ObjectId;
  loteId: Types.ObjectId;
  tipo: string;
  cantidad: number;
  precioUnitario?: number;
  costoTotal?: number;
  fecha: Date;
  observaciones?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OtroConsumoSchema: Schema = new Schema({
  empresaId: { type: Schema.Types.ObjectId, ref: 'Empresa', required: true, index: true },
  loteId: { type: Schema.Types.ObjectId, ref: 'Lote', required: [true, 'El lote es requerido'], index: true },
  tipo: { type: String, required: [true, 'El tipo de consumo es requerido'], trim: true, lowercase: true },
  cantidad: { type: Number, required: [true, 'La cantidad es requerida'], min: [0.01, 'La cantidad debe ser mayor a 0'] },
  precioUnitario: { type: Number, default: 0, min: [0, 'El precio no puede ser negativo'] },
  costoTotal: { type: Number, default: 0, min: [0, 'El costo no puede ser negativo'] },
  fecha: { type: Date, required: true, default: Date.now },
  observaciones: { type: String, trim: true },
}, { timestamps: true });

OtroConsumoSchema.pre('save', function(next) {
  const doc = this as any;
  if (doc.isModified('cantidad') || doc.isModified('precioUnitario')) {
    doc.costoTotal = (doc.cantidad || 0) * (doc.precioUnitario || 0);
  }
  next();
});

// Índices para consultas eficientes
OtroConsumoSchema.index({ loteId: 1, fecha: -1 });
OtroConsumoSchema.index({ tipo: 1, fecha: -1 });
OtroConsumoSchema.index({ fecha: -1 });

export default mongoose.model<IOtroConsumo>('OtroConsumo', OtroConsumoSchema);
