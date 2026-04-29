import mongoose, { Document, Types } from 'mongoose';
export interface IConsumoRegistro extends Document {
    empresaId: Types.ObjectId;
    loteId: Types.ObjectId;
    concentradoTipoId: Types.ObjectId;
    cantidad: number;
    precioUnitario: number;
    costoTotal: number;
    fecha: Date;
    observaciones?: string;
    createdAt: Date;
}
declare const _default: mongoose.Model<IConsumoRegistro, {}, {}, {}, mongoose.Document<unknown, {}, IConsumoRegistro, {}, {}> & IConsumoRegistro & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=ConsumoRegistro.d.ts.map