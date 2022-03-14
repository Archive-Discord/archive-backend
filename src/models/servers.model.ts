import { model, Schema, Document } from 'mongoose';
import { Server } from '@/interfaces/servers.interface';

const serverSchema: Schema = new Schema({
  id: String,
  description: String,
  sortDescription: String,
  like: Number,
  owners: [String],
  categories: [String],
  published_date: Date,
  created_at: Date,
  token: String,
  flags: Number,
  members: Number,
  name: String,
  icon: String,
  support: String,
  website: String,
});

const ServerModel = model<Server & Document>('Server', serverSchema);

export default ServerModel;
