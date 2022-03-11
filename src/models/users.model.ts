import { model, Schema, Document } from 'mongoose';
import { User } from '@interfaces/users.interface';

const userSchema: Schema = new Schema({
  id: String,
  email: String,
  username: String,
  discriminator: String,
  avatar: String,
  archive_flags: Number,
  discordAccessToken: String,
  discordRefreshToken: String,
  token: String,
  refreshToken: String,
  published_date: Date
});

const userModel = model<User & Document>('User', userSchema);

export default userModel;
