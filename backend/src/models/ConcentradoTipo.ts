import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IConcentradoTipo extends Document {
  empresaId: Types.ObjectId;
  nombre: string;
  descripcion?: string;
  precioActual: number;
  unidad: 'saco' | 'kg';
  pesoPorSaco: number; // peso de cada saco expresado en kg (solo aplica si unidad === 'saco')
  createdAt: Date;
  updatedAt: Date;
}

const ConcentradoTipoSchema: Schema = new Schema({
  empresaId: { type: Schema.Types.ObjectId, ref: 'Empresa', index: true },
  nombre: { type: String, required: [true, 'El nombre del concentrado es requerido'], trim: true },
  descripcion: { type: String, trim: true },
  precioActual: { type: Number, required: [true, 'El precio es requerido'], min: [0, 'El precio no puede ser negativo'] },
  unidad: { type: String, enum: ['saco', 'kg'], default: 'saco' },
  pesoPorSaco: { type: Number, default: 50, min: [0.01, 'El peso por saco debe ser mayor que 0'] },
}, { timestamps: true });

ConcentradoTipoSchema.index({ empresaId: 1, nombre: 1 }, { unique: true });

export default mongoose.model<IConcentradoTipo>('ConcentradoTipo', ConcentradoTipoSchema);
