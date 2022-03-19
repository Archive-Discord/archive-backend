import { model, Schema, Document } from 'mongoose';
import { Bot } from '@/interfaces/bots.interface';

const botSchema: Schema = new Schema({
  id: String,
  description: String,
  sortDescription: String,
  like: Number,
  owners: [String],
  categories: [String],
  support: String,
  website: String,
  published_date: Date,
  servers: Number,
  token: String,
  flags: Number,
  name: String,
  icon: String,
  discriminator: String,
  invite: String,
  prefix: String
});

const botSubmitModel = model<Bot & Document>('botsubmit', botSchema);

export default botSubmitModel;
