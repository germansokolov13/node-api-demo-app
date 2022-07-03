import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PostingDocument = Posting & Document;

@Schema({ timestamps: true })
export class Posting {
  @Prop()
  title: string;

  @Prop()
  content: string;

  @Prop()
  createdAt: string;
}

export const PostingSchema = SchemaFactory.createForClass(Posting);
