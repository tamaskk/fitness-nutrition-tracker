import mongoose from 'mongoose';

export interface IChat extends mongoose.Document {
  participants: mongoose.Types.ObjectId[];
  messages: {
    senderId: mongoose.Types.ObjectId;
    content: string;
    timestamp: Date;
    readBy: mongoose.Types.ObjectId[];
  }[];
  lastMessage?: {
    content: string;
    timestamp: Date;
    senderId: mongoose.Types.ObjectId;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ChatSchema = new mongoose.Schema<IChat>({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  messages: [{
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      maxlength: 1000
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    readBy: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  }],
  lastMessage: {
    content: String,
    timestamp: Date,
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }
}, {
  timestamps: true
});

// Index for efficient querying
ChatSchema.index({ participants: 1 });
ChatSchema.index({ 'lastMessage.timestamp': -1 });

export default mongoose.models.Chat || mongoose.model<IChat>('Chat', ChatSchema);
