import { model, Schema, Document } from 'mongoose';
import { botLike } from '@/interfaces/bots.interface';

const botLikeSchema: Schema = new Schema({
  bot_id: String,
  user_id: String,
  last_like: Date
});

const botLikeModel = model<botLike & Document>('botlikes', botLikeSchema);

export default botLikeModel;
