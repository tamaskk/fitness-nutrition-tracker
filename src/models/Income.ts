import mongoose, { Schema, Document } from 'mongoose';

export interface IncomeDocument extends Document {
  userId: string;
  amount: number;
  category: string;
  description: string;
  date: Date;
  location?: string;
  paymentMethod: 'cash' | 'card' | 'transfer';
  source?: string;
  createdAt: Date;
  updatedAt: Date;
}

const IncomeSchema = new Schema<IncomeDocument>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  category: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  date: {
    type: Date,
    required: true,
    default: Date.now,
  },
  location: {
    type: String,
    trim: true,
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'transfer'],
    default: 'cash',
  },
  source: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});

// Index for efficient queries
IncomeSchema.index({ userId: 1, date: -1 });
IncomeSchema.index({ userId: 1, category: 1 });

export default mongoose.models.Income || mongoose.model<IncomeDocument>('Income', IncomeSchema);
