import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IVacunacionLote extends Document {
  empresaId: Types.ObjectId;
  loteId: Types.ObjectId;
  vacuna: string;
  fecha: Date;
  dosis: string;
  aplicadoPor?: string;
  observaciones?: string;
  proximaFecha?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const VacunacionLoteSchema: Schema = new Schema({
  empresaId: { type: Schema.Types.ObjectId, ref: 'Empresa', required: true, index: true },
  loteId: { type: Schema.Types.ObjectId, ref: 'Lote', required: [true, 'El lote es requerido'], index: true },
  vacuna: { type: String, required: [true, 'El nombre de la vacuna es requerido'], trim: true },
  fecha: { type: Date, required: true, default: Date.now },
  dosis: { type: String, required: [true, 'La dosis es requerida'], trim: true },
  aplicadoPor: { type: String, trim: true },
  observaciones: { type: String, trim: true },
  proximaFecha: { type: Date },
}, { timestamps: true });

VacunacionLoteSchema.index({ empresaId: 1, loteId: 1, fecha: -1 });

export default mongoose.model<IVacunacionLote>('VacunacionLote', VacunacionLoteSchema);
