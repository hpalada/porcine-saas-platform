import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IVacunacionLote extends Document {
  empresaId: Types.ObjectId;
  loteId: Types.ObjectId;
  vacuna: string;
  fecha: Date;
  dosis?: string; // made optional
  aplicadoPor?: string;
  observaciones?: string;
  proximaFecha?: Date;
  // New fields for vaccine price and quantity applied
  precioUnitario: number; // unit price of the vaccine
  cantidadAplicada: number; // number of animals vaccinated in this event
  createdAt: Date;
  updatedAt: Date;
}

const VacunacionLoteSchema: Schema = new Schema({
  empresaId: { type: Schema.Types.ObjectId, ref: 'Empresa', required: true, index: true },
  loteId: { type: Schema.Types.ObjectId, ref: 'Lote', required: [true, 'El lote es requerido'], index: true },
  vacuna: { type: String, required: [true, 'El nombre de la vacuna es requerido'], trim: true },
  fecha: { type: Date, required: true, default: Date.now },
  dosis: { type: String, trim: true }, // optional
  aplicadoPor: { type: String, trim: true },
  observaciones: { type: String, trim: true },
  proximaFecha: { type: Date },
  precioUnitario: { type: Number, required: [true, 'El precio unitario es requerido'], min: [0, 'El precio no puede ser negativo'] },
  cantidadAplicada: { type: Number, required: [true, 'La cantidad aplicada es requerida'], min: [1, 'La cantidad debe ser al menos 1'] },
}, { timestamps: true });

VacunacionLoteSchema.index({ empresaId: 1, loteId: 1, fecha: -1 });

export default mongoose.model<IVacunacionLote>('VacunacionLote', VacunacionLoteSchema);
