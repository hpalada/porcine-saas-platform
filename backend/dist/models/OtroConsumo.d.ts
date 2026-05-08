import mongoose, { Document, Types } from 'mongoose';
export interface IOtroConsumo extends Document {
    empresaId: Types.ObjectId;
    loteId: Types.ObjectId;
    tipo: string;
    cantidad: number;
    precioUnitario?: number;
    costoTotal?: number;
    fecha: Date;
    observaciones?: string;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IOtroConsumo, {}, {}, {}, mongoose.Document<unknown, {}, IOtroConsumo, {}, {}> & IOtroConsumo & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=OtroConsumo.d.ts.map