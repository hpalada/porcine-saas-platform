import mongoose, { Document, Types } from 'mongoose';
export interface IInventarioMovimiento extends Document {
    empresaId: Types.ObjectId;
    concentradoTipoId: Types.ObjectId;
    tipo: 'entrada' | 'salida' | 'ajuste';
    cantidad: number;
    stockAnterior: number;
    stockNuevo: number;
    motivo: string;
    referenciaId?: Types.ObjectId;
    fecha: Date;
    createdAt: Date;
}
declare const _default: mongoose.Model<IInventarioMovimiento, {}, {}, {}, mongoose.Document<unknown, {}, IInventarioMovimiento, {}, {}> & IInventarioMovimiento & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=InventarioMovimiento.d.ts.map