import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type UserLikeDocument = UserLike & Document;

@Schema({ timestamps: true, collection: 'user_likes' })
export class UserLike {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  userId: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true })
  propertyId: string;
}

export const UserLikeSchema = SchemaFactory.createForClass(UserLike);
UserLikeSchema.index({ userId: 1, propertyId: 1 }, { unique: true });
UserLikeSchema.index({ userId: 1 });
UserLikeSchema.index({ propertyId: 1 });
