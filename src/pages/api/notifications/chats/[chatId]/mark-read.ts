import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import connectToDatabase from '@/lib/mongodb';
import Chat from '@/models/Chat';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { chatId } = req.query;
    if (!chatId || typeof chatId !== 'string') {
      return res.status(400).json({ message: 'Chat ID is required' });
    }

    await connectToDatabase();

    // Get chat and verify user is a participant
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    if (!chat.participants.includes(session.user.id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Mark all messages in this chat as read by the current user
    const updatedMessages = chat.messages.map((message: any) => {
      if (!message.readBy.includes(session.user.id)) {
        return {
          ...message.toObject(),
          readBy: [...message.readBy, session.user.id]
        };
      }
      return message;
    });

    // Update the chat with read messages
    await Chat.findByIdAndUpdate(chatId, {
      messages: updatedMessages
    });

    res.status(200).json({
      success: true,
      message: 'Messages marked as read'
    });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
