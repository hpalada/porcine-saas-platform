import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IGastoAdicional extends Document {
  loteId?: Types.ObjectId;
  empresaId?: Types.ObjectId;
  categoria: 'medicina' | 'transporte' | 'mano_obra' | 'servicios' | 'lechon' | 'trabajador' | 'otro';
  descripcion: string;
  monto: number;
  fecha: Date;
  createdAt: Date;
}

const GastoAdicionalSchema: Schema = new Schema({
  loteId: { type: Schema.Types.ObjectId, ref: 'Lote' },
  empresaId: { type: Schema.Types.ObjectId, ref: 'Empresa', index: true },
  categoria: {
    type: String,
    enum: ['medicina', 'transporte', 'mano_obra', 'servicios', 'lechon', 'trabajador', 'otro'],
    required: [true, 'La categoría es requerida'],
  },
  descripcion: { type: String, required: [true, 'La descripción es requerida'], trim: true },
  monto: { type: Number, required: [true, 'El monto es requerido'], min: [0.01, 'El monto debe ser mayor a 0'] },
  fecha: { type: Date, required: true, default: Date.now },
}, { timestamps: true });

GastoAdicionalSchema.index({ loteId: 1, fecha: -1 });
GastoAdicionalSchema.index({ categoria: 1, fecha: -1 });

export default mongoose.model<IGastoAdicional>('GastoAdicional', GastoAdicionalSchema);
