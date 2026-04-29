import mongoose, { Document, Types } from 'mongoose';
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
declare const _default: mongoose.Model<IVacunacionLote, {}, {}, {}, mongoose.Document<unknown, {}, IVacunacionLote, {}, {}> & IVacunacionLote & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=VacunacionLote.d.ts.map