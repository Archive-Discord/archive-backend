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
  discriminator: String
});

const botModel = model<Bot & Document>('botsubmit', botSchema);

export default botModel;
