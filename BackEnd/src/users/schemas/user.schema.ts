import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true, unique: true })
  email: string;

  // Optionnel car l'utilisateur peut s'inscrire via Google OAuth sans mot de passe
  @Prop({ required: false })
  passwordHash?: string;

  @Prop({ required: true, enum: ['user', 'admin'], default: 'user' })
  role: string;

  @Prop({ required: true, default: false })
  isHost: boolean;

  // Pour l'authentification Google
  @Prop({ required: false })
  googleId?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
