import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import connectToDatabase from '@/lib/mongodb';
import Chat from '@/models/Chat';
import { getUserFromToken } from '@/utils/auth';
import User from '@/models/User';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Connect to database first
    await connectToDatabase();
    
    const tokenUser = getUserFromToken(req);
    const session = await getServerSession(req, res, authOptions);
    
    const userEmail = tokenUser?.email || session?.user?.email;
    
    if (!userEmail) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const { chatId } = req.query;
    if (!chatId || typeof chatId !== 'string') {
      return res.status(400).json({ message: 'Chat ID is required' });
    }

  if (req.method === 'GET') {
    try {
      // Get chat and verify user is a participant
      const chat = await Chat.findById(chatId)
        .populate('participants', 'firstName lastName email')
        .populate('messages.senderId', 'firstName lastName email');

      if (!chat) {
        return res.status(404).json({ message: 'Chat not found' });
      }

      if (!chat.participants.some((p: any) => p._id.toString() === (user?._id as string))) {
        return res.status(403).json({ message: 'Access denied' });
      }

      res.status(200).json({
        success: true,
        chat: {
          _id: chat._id,
          participants: chat.participants,
          messages: chat.messages.map((message: any) => ({
            _id: message._id,
            senderId: message.senderId,
            content: message.content,
            timestamp: message.timestamp,
            readBy: message.readBy
          }))
        }
      });
    } catch (error) {
      console.error('Error fetching messages:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  } else if (req.method === 'POST') {
    try {
      const { content } = req.body;
      if (!content || typeof content !== 'string' || content.trim().length === 0) {
        return res.status(400).json({ message: 'Message content is required' });
      }

      // Get chat and verify user is a participant
      const chat = await Chat.findById(chatId);
      if (!chat) {
        return res.status(404).json({ message: 'Chat not found' });
      }

      if (!chat.participants.includes(user?._id as string)) {
        return res.status(403).json({ message: 'Access denied' });
      }

      // Add new message
      const newMessage = {
        senderId: user?._id as string,
        content: content.trim(),
        timestamp: new Date(),
        readBy: [user?._id as string] // Sender has read their own message
      };

      chat.messages.push(newMessage);
      chat.lastMessage = {
        content: content.trim(),
        timestamp: new Date(),
        senderId: user?._id as string
      };

      await chat.save();

      res.status(201).json({
        success: true,
        message: newMessage
      });
    } catch (error) {
      console.error('Error sending message:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
  } catch (error) {
    console.error('Chat messages API error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
