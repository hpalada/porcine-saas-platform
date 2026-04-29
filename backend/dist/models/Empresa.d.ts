import mongoose, { Document } from 'mongoose';
export interface IEmpresa extends Document {
    nombre: string;
    descripcion: string;
    ubicacion: string;
    contacto: string;
    email: string;
    plan: 'gratuito' | 'profesional' | 'empresa';
    usuarioAdminId: mongoose.Types.ObjectId;
    activa: boolean;
    suscripcionActiva: boolean;
    accesoBloqueado: boolean;
    notificacionesActivas: boolean;
    alertaStockBajo: boolean;
    nivelStockCritico: number;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Empresa: mongoose.Model<IEmpresa, {}, {}, {}, mongoose.Document<unknown, {}, IEmpresa, {}, {}> & IEmpresa & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Empresa.d.ts.map