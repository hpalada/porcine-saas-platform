import mongoose, { Document, Types } from 'mongoose';
export interface IVentaRegistro extends Document {
    empresaId: Types.ObjectId;
    loteId: Types.ObjectId;
    cantidadCerdos: number;
    pesoTotalKg: number;
    pesoTotalLb?: number;
    unidadPeso: 'kg' | 'lb';
    precioPorKg: number;
    ingresoTotal: number;
    fechaVenta: Date;
    comprador?: string;
    createdAt: Date;
}
declare const _default: mongoose.Model<IVentaRegistro, {}, {}, {}, mongoose.Document<unknown, {}, IVentaRegistro, {}, {}> & IVentaRegistro & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=VentaRegistro.d.ts.map