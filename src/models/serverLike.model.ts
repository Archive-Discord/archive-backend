import { model, Schema, Document } from 'mongoose';
import { ServerLike } from '@/interfaces/servers.interface';

const serverLikeSchema: Schema = new Schema({
  server_id: String,
  user_id: String,
  last_like: Date
});

const ServerLikeModel = model<ServerLike & Document>('serverlikes', serverLikeSchema);

export default ServerLikeModel;
