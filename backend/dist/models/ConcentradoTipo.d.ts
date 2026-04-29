import mongoose, { Document, Types } from 'mongoose';
export interface IConcentradoTipo extends Document {
    empresaId: Types.ObjectId;
    nombre: string;
    descripcion?: string;
    precioActual: number;
    unidad: 'saco' | 'kg';
    pesoPorSaco: number;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IConcentradoTipo, {}, {}, {}, mongoose.Document<unknown, {}, IConcentradoTipo, {}, {}> & IConcentradoTipo & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=ConcentradoTipo.d.ts.map