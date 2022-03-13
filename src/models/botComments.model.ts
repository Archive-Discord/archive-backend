import { model, Schema, Document } from 'mongoose';
import { Bot, botComments } from '@/interfaces/bots.interface';

const botCommentSchema: Schema = new Schema({
  bot_id: String,
  user_id: String,
  comment: String,
  published_date: Date
});

const botCommentModel = model<botComments & Document>('botcomments', botCommentSchema);

export default botCommentModel;
