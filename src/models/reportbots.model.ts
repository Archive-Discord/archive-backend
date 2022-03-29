import { model, Schema, Document } from 'mongoose';
import { BotReport } from '@/interfaces/bots.interface';

const reportBotSchema: Schema = new Schema({
  resson: String,
  user_id: String,
  bot_id: String,
  report_type: String,
  published_date: { type: Date, default: Date.now } 
});

const botReportModel = model<BotReport & Document>('botreport', reportBotSchema);

export default botReportModel;
