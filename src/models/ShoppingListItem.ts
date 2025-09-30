import mongoose, { Schema, Document } from 'mongoose';
import { ShoppingListItem } from '@/types';

export interface ShoppingListItemDocument extends Omit<ShoppingListItem, '_id'>, Document {}

const ShoppingListItemSchema = new Schema<ShoppingListItemDocument>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  quantity: {
    type: String,
    trim: true,
  },
  category: {
    type: String,
    trim: true,
    lowercase: true,
  },
  purchased: {
    type: Boolean,
    default: false,
  },
  addedAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for efficient queries
ShoppingListItemSchema.index({ userId: 1, purchased: 1 });

export default mongoose.models.ShoppingListItem || mongoose.model<ShoppingListItemDocument>('ShoppingListItem', ShoppingListItemSchema);

