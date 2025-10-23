import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import connectToDatabase from '@/lib/mongodb';
import Chat from '@/models/Chat';
import User from '@/models/User';
import { getUserFromToken } from '@/utils/auth';

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

  // Handle admin user - get or create admin user for proper ObjectId
  let userId = user?._id as string;
  if (userId === 'admin') {
    const adminUser = await User.findOne({ email: process.env.ADMIN_EMAIL });
    if (adminUser) {
      userId = adminUser._id as string;
    } else {
      // If no admin user exists, return empty chats
      return res.status(200).json({
        success: true,
        chats: []
      });
    }
  }

  if (req.method === 'GET') {
    try {
      // Get all chats where the user is a participant
      const chats = await Chat.find({
        participants: userId
      })
      .populate('participants', 'firstName lastName email')
      .sort({ 'lastMessage.timestamp': -1, updatedAt: -1 });

      // Calculate unread counts for each chat
      const chatsWithUnreadCount = chats.map(chat => {
        const unreadCount = chat.messages.filter((message: any) => 
          !message.readBy.includes(userId) && 
          message.senderId.toString() !== userId
        ).length;

        return {
          _id: chat._id,
          participants: chat.participants,
          lastMessage: chat.lastMessage,
          unreadCount,
          createdAt: chat.createdAt,
          updatedAt: chat.updatedAt
        };
      });

      res.status(200).json({
        success: true,
        chats: chatsWithUnreadCount
      });
    } catch (error) {
      console.error('Error fetching chats:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  } else if (req.method === 'POST') {
    try {
      const { participantId } = req.body;
      if (!participantId) {
        return res.status(400).json({ message: 'Participant ID is required' });
      }

      // Check if participant exists
      const participant = await User.findById(participantId);
      if (!participant) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Check if chat already exists between these users
      const existingChat = await Chat.findOne({
        participants: { $all: [userId, participantId] }
      });

      if (existingChat) {
        return res.status(200).json({
          success: true,
          chat: existingChat
        });
      }

      // Create new chat
      const newChat = new Chat({
        participants: [userId, participantId]
      });

      await newChat.save();
      await newChat.populate('participants', 'firstName lastName email');

      res.status(201).json({
        success: true,
        chat: newChat
      });
    } catch (error) {
      console.error('Error creating chat:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
  } catch (error) {
    console.error('Chat API error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
