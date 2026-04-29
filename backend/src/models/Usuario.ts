import mongoose, { Schema, Document } from 'mongoose';

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

const usuarioSchema = new Schema<IUsuario>(
  {
    nombre: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match: /.+\@.+\..+/,
    },
    contraseña: {
      type: String,
      required: false,
      minlength: 6,
      select: false,
    },
    rol: {
      type: String,
      enum: ['administrador', 'empleado'],
      default: 'empleado',
    },
    empresaId: {
      type: Schema.Types.ObjectId,
      ref: 'Empresa',
      required: true,
    },
    activo: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export const Usuario = mongoose.model<IUsuario>('Usuario', usuarioSchema);
