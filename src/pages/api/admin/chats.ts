import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import connectToDatabase from '@/lib/mongodb';
import Chat from '@/models/Chat';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    await connectToDatabase();

    // Get all chats with participants and messages
    const chats = await Chat.find({})
      .populate('participants', 'firstName lastName email')
      .populate('messages.senderId', 'firstName lastName email')
      .sort({ 'lastMessage.timestamp': -1, updatedAt: -1 })
      .limit(100);

    // Format chats for admin view
    const formattedChats = chats.map(chat => ({
      _id: chat._id,
      participants: chat.participants.map(p => ({
        _id: p._id,
        firstName: p.firstName,
        lastName: p.lastName,
        email: p.email
      })),
      messages: chat.messages.map(message => ({
        _id: message._id,
        senderId: message.senderId,
        content: message.content,
        timestamp: message.timestamp,
        readBy: message.readBy
      })),
      lastMessage: chat.lastMessage,
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt
    }));

    res.status(200).json({
      success: true,
      chats: formattedChats
    });
  } catch (error) {
    console.error('Error fetching chats:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
