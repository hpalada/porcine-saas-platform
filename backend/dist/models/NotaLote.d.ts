import mongoose, { Document } from 'mongoose';
export interface INotaLote extends Document {
    loteId: mongoose.Types.ObjectId;
    empresaId: mongoose.Types.ObjectId;
    tipo: 'vacunacion' | 'desparasitacion' | 'vitaminas' | 'medicina' | 'observacion' | 'otro';
    descripcion: string;
    fecha: Date;
    createdAt: Date;
    updatedAt: Date;
}
export declare const NotaLote: mongoose.Model<INotaLote, {}, {}, {}, mongoose.Document<unknown, {}, INotaLote, {}, {}> & INotaLote & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=NotaLote.d.ts.map