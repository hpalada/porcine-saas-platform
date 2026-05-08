import mongoose, { Document, Types } from 'mongoose';
export interface IMortalidadLote extends Document {
    empresaId: Types.ObjectId;
    loteId: Types.ObjectId;
    cantidadMuertas: number;
    fecha: Date;
    motivo: string;
    observaciones?: string;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IMortalidadLote, {}, {}, {}, mongoose.Document<unknown, {}, IMortalidadLote, {}, {}> & IMortalidadLote & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=MortalidadLote.d.ts.map