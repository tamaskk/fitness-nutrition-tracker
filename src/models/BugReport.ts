import mongoose, { Schema, Document } from 'mongoose';

export interface BugReportDocument extends Document {
  userId: string;
  email?: string;
  title: string;
  description: string;
  pageUrl?: string;
  createdAt: Date;
}

const BugReportSchema = new Schema<BugReportDocument>({
  userId: { type: String, required: true, index: true },
  email: { type: String },
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  pageUrl: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.BugReport || mongoose.model<BugReportDocument>('BugReport', BugReportSchema);



