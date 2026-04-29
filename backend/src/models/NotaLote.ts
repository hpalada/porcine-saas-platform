import mongoose, { Schema, Document } from 'mongoose';

export interface INotaLote extends Document {
  loteId: mongoose.Types.ObjectId;
  empresaId: mongoose.Types.ObjectId;
  tipo: 'vacunacion' | 'desparasitacion' | 'vitaminas' | 'medicina' | 'observacion' | 'otro';
  descripcion: string;
  fecha: Date;
  createdAt: Date;
  updatedAt: Date;
}

const notaLoteSchema = new Schema<INotaLote>(
  {
    loteId: { type: Schema.Types.ObjectId, ref: 'Lote', required: true, index: true },
    empresaId: { type: Schema.Types.ObjectId, ref: 'Empresa', required: true, index: true },
    tipo: {
      type: String,
      enum: ['vacunacion', 'desparasitacion', 'vitaminas', 'medicina', 'observacion', 'otro'],
      required: true,
    },
    descripcion: { type: String, required: true, trim: true },
    fecha: { type: Date, required: true, default: Date.now },
  },
  { timestamps: true }
);

notaLoteSchema.index({ loteId: 1, fecha: -1 });

export const NotaLote = mongoose.model<INotaLote>('NotaLote', notaLoteSchema);
