import mongoose, { Schema, Document } from 'mongoose';

export interface IPinReset extends Document {
  email: string;
  pin: string;
  expira: Date;
  usado: boolean;
}

const pinResetSchema = new Schema<IPinReset>({
  email: { type: String, required: true, lowercase: true },
  pin: { type: String, required: true },
  expira: { type: Date, required: true },
  usado: { type: Boolean, default: false },
}, { timestamps: true });

pinResetSchema.index({ expira: 1 }, { expireAfterSeconds: 0 });

export const PinReset = mongoose.model<IPinReset>('PinReset', pinResetSchema);
