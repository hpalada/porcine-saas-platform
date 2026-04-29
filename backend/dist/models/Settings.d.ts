import mongoose, { Document } from 'mongoose';
export interface ISettings extends Document {
    idioma: 'es' | 'en' | 'fr';
    tema: 'light' | 'dark' | 'auto';
    nombreGranja: string;
    ubicacion: string;
    contacto: string;
    email: string;
    moneda: 'HNL' | 'USD';
    tasaCambio: number;
    notificacionesActivas: boolean;
    alertaStockBajo: boolean;
    nivelStockCritico: number;
    horaBackup: string;
    backupAutomatico: boolean;
    registroAuditoria: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Settings: mongoose.Model<ISettings, {}, {}, {}, mongoose.Document<unknown, {}, ISettings, {}, {}> & ISettings & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Settings.d.ts.map