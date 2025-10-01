import mongoose, { Schema, Document } from 'mongoose';

export interface ExpenseDocument extends Document {
  userId: string;
  amount: number;
  category: string;
  description: string;
  date: Date;
  billImageUrl?: string;
  extractedItems?: {
    name: string;
    price: number;
    quantity?: number;
  }[];
  location?: string;
  paymentMethod?: 'cash' | 'card' | 'transfer';
  createdAt: Date;
  updatedAt: Date;
}

const ExpenseSchema = new Schema<ExpenseDocument>({
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
  billImageUrl: {
    type: String,
    trim: true,
  },
  extractedItems: [{
    name: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      min: 1,
      default: 1,
    },
  }],
  location: {
    type: String,
    trim: true,
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'transfer'],
    default: 'cash',
  },
}, {
  timestamps: true,
});

// Index for efficient queries
ExpenseSchema.index({ userId: 1, date: -1 });
ExpenseSchema.index({ userId: 1, category: 1 });

export default mongoose.models.Expense || mongoose.model<ExpenseDocument>('Expense', ExpenseSchema);
