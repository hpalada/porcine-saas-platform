import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IVentaRegistro extends Document {
  empresaId: Types.ObjectId;
  loteId: Types.ObjectId;
  cantidadCerdos: number;
  pesoTotalKg: number;
  pesoTotalLb?: number;
  unidadPeso: 'kg' | 'lb';
  precioPorKg: number;
  ingresoTotal: number;
  fechaVenta: Date;
  comprador?: string;
  createdAt: Date;
}

const VentaRegistroSchema: Schema = new Schema({
  empresaId: { type: Schema.Types.ObjectId, ref: 'Empresa', index: true },
  loteId: { type: Schema.Types.ObjectId, ref: 'Lote', required: [true, 'El lote es requerido'] },
  cantidadCerdos: { type: Number, required: [true, 'La cantidad de cerdos es requerida'], min: [1, 'Debe venderse al menos 1'] },
  pesoTotalKg: { type: Number, required: [true, 'El peso total es requerido'], min: [0.1, 'El peso debe ser mayor a 0'] },
  pesoTotalLb: { type: Number },
  unidadPeso: { type: String, enum: ['kg', 'lb'], default: 'kg' },
  precioPorKg: { type: Number, required: [true, 'El precio por kg es requerido'], min: [0, 'El precio no puede ser negativo'] },
  ingresoTotal: { type: Number, required: [true, 'El ingreso total es requerido'], min: [0] },
  fechaVenta: { type: Date, required: true, default: Date.now },
  comprador: { type: String, trim: true },
}, { timestamps: true });

VentaRegistroSchema.index({ empresaId: 1, loteId: 1, fechaVenta: -1 });

export default mongoose.model<IVentaRegistro>('VentaRegistro', VentaRegistroSchema);
