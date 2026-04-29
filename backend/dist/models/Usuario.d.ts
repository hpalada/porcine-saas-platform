import mongoose, { Document } from 'mongoose';
export interface IUsuario extends Document {
    nombre: string;
    email: string;
    contraseña: string;
    rol: 'administrador' | 'empleado';
    empresaId: mongoose.Types.ObjectId;
    activo: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Usuario: mongoose.Model<IUsuario, {}, {}, {}, mongoose.Document<unknown, {}, IUsuario, {}, {}> & IUsuario & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Usuario.d.ts.map