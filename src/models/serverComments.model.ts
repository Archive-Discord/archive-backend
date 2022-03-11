import { model, Schema, Document } from 'mongoose';
import { ServerComments } from '@/interfaces/servers.interface';

const serverCommentSchema: Schema = new Schema({
  server_id: String,
  user_id: String,
  comment: String,
  published_date: Date
});

const ServerCommentModel = model<ServerComments & Document>('servercomments', serverCommentSchema);

export default ServerCommentModel;
