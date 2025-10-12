import mongoose from 'mongoose';

export interface IUpdate extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  content: string;
  type: 'feature' | 'bugfix' | 'maintenance' | 'announcement';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  isRead: boolean;
  actionUrl?: string;
  actionText?: string;
  sentBy: mongoose.Types.ObjectId; // Admin who sent it
  createdAt: Date;
  readAt?: Date;
}

const UpdateSchema = new mongoose.Schema<IUpdate>({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    maxlength: 100
  },
  content: {
    type: String,
    required: true,
    maxlength: 2000
  },
  type: {
    type: String,
    enum: ['feature', 'bugfix', 'maintenance', 'announcement'],
    default: 'feature'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  actionUrl: {
    type: String,
    maxlength: 200
  },
  actionText: {
    type: String,
    maxlength: 50
  },
  sentBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  readAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
UpdateSchema.index({ userId: 1, createdAt: -1 });
UpdateSchema.index({ userId: 1, isRead: 1 });
UpdateSchema.index({ priority: 1, createdAt: -1 });

export default mongoose.models.Update || mongoose.model<IUpdate>('Update', UpdateSchema);
