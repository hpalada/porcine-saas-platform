import mongoose, { Document, Types } from 'mongoose';
export interface IGastoAdicional extends Document {
    loteId?: Types.ObjectId;
    empresaId?: Types.ObjectId;
    categoria: 'medicina' | 'transporte' | 'mano_obra' | 'servicios' | 'lechon' | 'trabajador' | 'otro';
    descripcion: string;
    monto: number;
    fecha: Date;
    createdAt: Date;
}
declare const _default: mongoose.Model<IGastoAdicional, {}, {}, {}, mongoose.Document<unknown, {}, IGastoAdicional, {}, {}> & IGastoAdicional & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=GastoAdicional.d.ts.map