import mongoose, { Document } from 'mongoose';
export interface ILote extends Document {
    empresaId: mongoose.Types.ObjectId;
    nombre: string;
    fechaIngreso: Date;
    horaIngreso: string;
    cantidadInicial: number;
    cantidadActual: number;
    cantidadSalida: number;
    cantidadMuertas: number;
    estado: 'activo' | 'finalizado';
    descripcion?: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Lote: mongoose.Model<ILote, {}, {}, {}, mongoose.Document<unknown, {}, ILote, {}, {}> & ILote & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Lote.d.ts.map