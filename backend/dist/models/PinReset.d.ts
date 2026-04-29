import mongoose, { Document } from 'mongoose';
export interface IPinReset extends Document {
    email: string;
    pin: string;
    expira: Date;
    usado: boolean;
}
export declare const PinReset: mongoose.Model<IPinReset, {}, {}, {}, mongoose.Document<unknown, {}, IPinReset, {}, {}> & IPinReset & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=PinReset.d.ts.map