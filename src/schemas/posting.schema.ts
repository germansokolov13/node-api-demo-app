import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { UserDto } from '../modules/auth/user.dto';

export type PostingDocument = Posting & Document;

@Schema({ timestamps: true })
export class Posting {
  @Prop()
  user: UserDto;

  @Prop()
  title: string;

  @Prop()
  content: string;

  @Prop({ index: true })
  createdAt: Date;

  @Prop()
  s3Key: string;

  @Prop()
  deletedAt: Date;
}

export const PostingSchema = SchemaFactory.createForClass(Posting);
