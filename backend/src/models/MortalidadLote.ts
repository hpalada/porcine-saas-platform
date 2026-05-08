import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IMortalidadLote extends Document {
  empresaId: Types.ObjectId;
  loteId: Types.ObjectId;
  cantidadMuertas: number; // number of animals that died
  fecha: Date;
  motivo: string; // reason/cause of death
  observaciones?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MortalidadLoteSchema: Schema = new Schema({
  empresaId: { type: Schema.Types.ObjectId, ref: 'Empresa', required: true, index: true },
  loteId: { type: Schema.Types.ObjectId, ref: 'Lote', required: [true, 'El lote es requerido'], index: true },
  cantidadMuertas: { type: Number, required: [true, 'La cantidad de muertes es requerida'], min: [1, 'La cantidad debe ser al menos 1'] },
  fecha: { type: Date, required: true, default: Date.now },
  motivo: { type: String, required: [true, 'El motivo es requerido'], trim: true },
  observaciones: { type: String, trim: true },
}, { timestamps: true });

// Índices para consultas eficientes
MortalidadLoteSchema.index({ loteId: 1, fecha: -1 });
MortalidadLoteSchema.index({ fecha: -1 });

export default mongoose.model<IMortalidadLote>('MortalidadLote', MortalidadLoteSchema);
