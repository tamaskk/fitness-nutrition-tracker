import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { 
  MessageCircle, 
  Bell, 
  AlertCircle, 
  Send, 
  Search, 
  User, 
  Clock,
  CheckCircle,
  XCircle,
  Info,
  AlertTriangle,
  Zap,
  Wrench,
  Megaphone
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Chat, Notification, Update } from '@/types';
import Layout from '@/components/Layout';
import NotificationModal from '@/components/NotificationModal';
import UpdateModal from '@/components/UpdateModal';
import { useNotificationContext } from '@/contexts/NotificationContext';

const NotificationsPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { refreshUnreadCount } = useNotificationContext();
  const [activeTab, setActiveTab] = useState<'chat' | 'notifications' | 'updates'>('notifications');
  const [chats, setChats] = useState<Chat[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [updates, setUpdates] = useState<Update[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchEmail, setSearchEmail] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [startingChat, setStartingChat] = useState<string | null>(null);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [selectedUpdate, setSelectedUpdate] = useState<Update | null>(null);
  const [markingAsRead, setMarkingAsRead] = useState<string | null>(null);
  const [lastChatUpdate, setLastChatUpdate] = useState<number>(Date.now());
  const [isAtBottom, setIsAtBottom] = useState<boolean>(true);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const messagesContainerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/login');
      return;
    }
    fetchData();
  }, [session, status, router]);

  // Poll for new messages every 5 seconds when on chat tab
  useEffect(() => {
    if (activeTab !== 'chat' || !session) return;

    const interval = setInterval(() => {
      // Only refresh chats list, not notifications/updates
      fetch('/api/notifications/chats')
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            const newChats = data.chats || [];
            
            // Check if there are new unread messages
            const hasNewMessages = newChats.some((chat: Chat) => chat.unreadCount > 0);
            if (hasNewMessages) {
              setLastChatUpdate(Date.now());
            }
            
            setChats(newChats);
            
            // If we have a selected chat, check for new messages only if there are unread messages
            if (selectedChat && isAtBottom) {
              const currentChat = newChats.find((chat: Chat) => chat._id === selectedChat._id);
              if (currentChat && currentChat.unreadCount > 0) {
                // Only fetch messages if there are actually new unread messages
                fetchChatMessages(selectedChat._id, false);
              }
            }
          }
        })
        .catch(error => {
          console.error('Error polling for new messages:', error);
        });
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, [activeTab, session, selectedChat, isAtBottom]);

  // Auto-scroll to bottom when new messages are added and user is at bottom
  useEffect(() => {
    if (isAtBottom && chatMessages.length > 0) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [chatMessages.length, isAtBottom]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [chatsRes, notificationsRes, updatesRes] = await Promise.all([
        fetch('/api/notifications/chats'),
        fetch('/api/notifications/list'),
        fetch('/api/notifications/updates')
      ]);

      if (chatsRes.ok) {
        const chatsData = await chatsRes.json();
        setChats(chatsData.chats || []);
      } else if (chatsRes.status === 401) {
        // Session expired, redirect to login
        router.push('/login');
        return;
      }

      if (notificationsRes.ok) {
        const notificationsData = await notificationsRes.json();
        setNotifications(notificationsData.notifications || []);
      }

      if (updatesRes.ok) {
        const updatesData = await updatesRes.json();
        setUpdates(updatesData.updates || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const fetchChatMessages = async (chatId: string, shouldScroll = true) => {
    try {
      setLoadingMessages(true);
      console.log('Fetching messages for chat:', chatId);
      const response = await fetch(`/api/notifications/chats/${chatId}/messages`);
      if (response.ok) {
        const data = await response.json();
        console.log('Messages data:', data);
        const newMessages = data.chat.messages || [];
        
        // Only update state if messages have actually changed
        setChatMessages(prevMessages => {
          // Check if messages are different by comparing length and last message
          if (prevMessages.length !== newMessages.length) {
            return newMessages;
          }
          
          // Check if the last message is different
          if (prevMessages.length > 0 && newMessages.length > 0) {
            const lastPrevMessage = prevMessages[prevMessages.length - 1];
            const lastNewMessage = newMessages[newMessages.length - 1];
            if (lastPrevMessage._id !== lastNewMessage._id || 
                lastPrevMessage.content !== lastNewMessage.content ||
                lastPrevMessage.timestamp !== lastNewMessage.timestamp) {
              return newMessages;
            }
          }
          
          // No changes detected, return previous state
          return prevMessages;
        });
        
        // Only scroll if explicitly requested
        if (shouldScroll) {
          setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
          }, 50);
        }
      } else {
        console.error('Failed to fetch messages:', response.status, response.statusText);
        setChatMessages([]);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      setChatMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  };

  const searchUsers = async (email: string) => {
    if (!email || email.length < 3) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await fetch(`/api/notifications/search-users?email=${encodeURIComponent(email)}`);
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.users || []);
      }
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };

  const startChat = async (userId: string) => {
    try {
      setStartingChat(userId);
      console.log('Starting chat with user:', userId);
      const response = await fetch('/api/notifications/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participantId: userId })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Chat created/retrieved:', data);
        
        // Clear search
        setSearchEmail('');
        setSearchResults([]);
        
        // Refresh chats list first
        await fetchData();
        
        // Find the chat in the updated list and select it
        const updatedChats = await fetch('/api/notifications/chats').then(res => res.json());
        const chatToSelect = updatedChats.chats?.find((chat: Chat) => 
          chat.participants.some(p => p._id === userId)
        );
        
        if (chatToSelect) {
          setSelectedChat(chatToSelect);
          fetchChatMessages(chatToSelect._id);
          toast.success('Chat started!');
        } else {
          toast.error('Chat created but could not be selected');
        }
      } else {
        const errorData = await response.json();
        console.error('Failed to start chat:', errorData);
        toast.error('Failed to start chat');
      }
    } catch (error) {
      console.error('Error starting chat:', error);
      toast.error('Failed to start chat');
    } finally {
      setStartingChat(null);
    }
  };

  const handleSelectChat = async (chat: Chat) => {
    setSelectedChat(chat);
    setIsAtBottom(true); // Reset to bottom when selecting a chat
    fetchChatMessages(chat._id);
    
    // Mark messages as read when opening the chat
    if (chat.unreadCount > 0) {
      try {
        setMarkingAsRead(chat._id);
        await fetch(`/api/notifications/chats/${chat._id}/mark-read`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
        // Update the chat's unread count locally without full refresh
        setChats(prevChats => 
          prevChats.map(c => 
            c._id === chat._id 
              ? { ...c, unreadCount: 0 }
              : c
          )
        );
      } catch (error) {
        console.error('Error marking messages as read:', error);
      } finally {
        setMarkingAsRead(null);
      }
    }
  };

  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      const isAtBottomNow = scrollTop + clientHeight >= scrollHeight - 10; // 10px threshold
      setIsAtBottom(isAtBottomNow);
    }
  };

  const sendMessage = async () => {
    if (!selectedChat || !newMessage.trim()) return;

    try {
      setSendingMessage(true);
      console.log('Sending message to chat:', selectedChat._id, 'Content:', newMessage.trim());
      const response = await fetch(`/api/notifications/chats/${selectedChat._id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newMessage.trim() })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Message sent successfully:', result);
        setNewMessage('');
        
        // Update the selected chat's last message locally
        setChats(prevChats => 
          prevChats.map(chat => 
            chat._id === selectedChat._id 
              ? {
                  ...chat,
                  lastMessage: {
                    content: newMessage.trim(),
                    timestamp: new Date().toISOString(),
                    senderId: session?.user?.id || ''
                  }
                }
              : chat
          )
        );
        
        // Add the new message to the current messages immediately
        const newMessageObj = {
          _id: Date.now().toString(), // Temporary ID
          senderId: { _id: session?.user?.id, firstName: session?.user?.firstName, lastName: session?.user?.lastName, email: session?.user?.email },
          content: newMessage.trim(),
          timestamp: new Date().toISOString(),
          readBy: [session?.user?.id]
        };
        
        setChatMessages(prev => [...prev, newMessageObj]);
        
        // Scroll to bottom immediately
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 50);
      } else {
        const errorData = await response.json();
        console.error('Failed to send message:', response.status, errorData);
        toast.error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  const markAsRead = async (type: 'notification' | 'update', id: string) => {
    try {
      // Update local state immediately for better UX
      if (type === 'notification') {
        setNotifications(prev => prev.map(n => 
          n._id === id ? { ...n, isRead: true } : n
        ));
      } else {
        setUpdates(prev => prev.map(u => 
          u._id === id ? { ...u, isRead: true } : u
        ));
      }

      const endpoint = type === 'notification' ? '/api/notifications/mark-read' : '/api/notifications/updates/mark-read';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });

      if (response.ok) {
        refreshUnreadCount(); // Refresh the unread count in navigation
      } else {
        // Revert local state if API call failed
        if (type === 'notification') {
          setNotifications(prev => prev.map(n => 
            n._id === id ? { ...n, isRead: false } : n
          ));
        } else {
          setUpdates(prev => prev.map(u => 
            u._id === id ? { ...u, isRead: false } : u
          ));
        }
      }
    } catch (error) {
      console.error('Error marking as read:', error);
      // Revert local state if API call failed
      if (type === 'notification') {
        setNotifications(prev => prev.map(n => 
          n._id === id ? { ...n, isRead: false } : n
        ));
      } else {
        setUpdates(prev => prev.map(u => 
          u._id === id ? { ...u, isRead: false } : u
        ));
      }
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'info': return <Info className="h-4 w-4 text-blue-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'feature': return <Zap className="h-4 w-4 text-purple-500" />;
      case 'bugfix': return <Wrench className="h-4 w-4 text-orange-500" />;
      case 'maintenance': return <AlertCircle className="h-4 w-4 text-gray-500 dark:text-gray-500" />;
      case 'announcement': return <Megaphone className="h-4 w-4 text-indigo-500" />;
      default: return <Info className="h-4 w-4 text-gray-500 dark:text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'border-l-red-500 bg-red-50';
      case 'high': return 'border-l-orange-500 bg-orange-50';
      case 'medium': return 'border-l-yellow-500 bg-yellow-50';
      case 'low': return 'border-l-green-500 bg-green-50';
      default: return 'border-l-gray-500 bg-gray-50';
    }
  };

  if (status === 'loading' || loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Notifications</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Stay updated with your messages, notifications, and app updates</p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-zinc-800 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('chat')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'chat'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 dark:text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <MessageCircle className="h-5 w-5 inline mr-2" />
              Chat
              {chats.some(chat => chat.unreadCount > 0) && (
                <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-1">
                  {chats.reduce((total, chat) => total + chat.unreadCount, 0)}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'notifications'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 dark:text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Bell className="h-5 w-5 inline mr-2" />
              Notifications
              {notifications.filter(n => !n.isRead).length > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-1">
                  {notifications.filter(n => !n.isRead).length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('updates')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'updates'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 dark:text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <AlertCircle className="h-5 w-5 inline mr-2" />
              Updates
              {updates.filter(u => !u.isRead).length > 0 && (
                <span className="ml-2 bg-blue-500 text-white text-xs rounded-full px-2 py-1">
                  {updates.filter(u => !u.isRead).length}
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* Chat Tab */}
        {activeTab === 'chat' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chat List */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-zinc-950 rounded-lg shadow dark:shadow-none dark:border dark:border-zinc-900">
                <div className="p-4 border-b border-gray-200 dark:border-zinc-800">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Start New Chat</h3>
                  </div>
                  <div className="mt-3 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="email"
                      placeholder="Search by email..."
                      value={searchEmail}
                      onChange={(e) => {
                        setSearchEmail(e.target.value);
                        searchUsers(e.target.value);
                      }}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-zinc-700 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  {searchResults.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {searchResults.map((user) => (
                        <div
                          key={user._id}
                          className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-zinc-900 dark:bg-black rounded border border-gray-200 dark:border-zinc-800"
                        >
                          <div className="flex items-center">
                            <User className="h-4 w-4 text-gray-400 mr-2" />
                            <div>
                              <span className="text-sm font-medium">{user.firstName} {user.lastName}</span>
                              <div className="text-xs text-gray-500 dark:text-gray-500">{user.email}</div>
                            </div>
                          </div>
                          <button
                            onClick={() => startChat(user._id)}
                            disabled={startingChat === user._id}
                            className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {startingChat === user._id ? 'Starting...' : 'Start Chat'}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {chats.map((chat) => {
                    const otherParticipant = chat.participants.find(p => p._id !== session?.user?.id);
                    return (
                      <div
                        key={chat._id}
                        onClick={() => handleSelectChat(chat)}
                        className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-900 dark:bg-black transition-colors ${
                          selectedChat?._id === chat._id ? 'bg-blue-50' : ''
                        } ${chat.unreadCount > 0 ? 'bg-blue-25 border-l-4 border-l-blue-500' : ''}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <User className={`h-4 w-4 mr-2 ${chat.unreadCount > 0 ? 'text-blue-500' : 'text-gray-400'}`} />
                            <span className={`font-medium text-sm ${chat.unreadCount > 0 ? 'text-gray-900 dark:text-white font-semibold' : 'text-gray-700'}`}>
                              {otherParticipant?.firstName} {otherParticipant?.lastName}
                            </span>
                          </div>
                          {chat.unreadCount > 0 && (
                            <div className="flex items-center space-x-2">
                              <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 font-semibold">
                                {chat.unreadCount}
                              </span>
                              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                            </div>
                          )}
                          {markingAsRead === chat._id && (
                            <div className="flex items-center space-x-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                              <span className="text-xs text-blue-600">Marking as read...</span>
                            </div>
                          )}
                        </div>
                        {chat.lastMessage && (
                          <div className="mt-1">
                            <p className={`text-xs truncate ${chat.unreadCount > 0 ? 'text-gray-700 font-medium' : 'text-gray-500'}`}>
                              {chat.lastMessage.content}
                            </p>
                            <p className="text-xs text-gray-400">
                              {chat.lastMessage.timestamp ? new Date(chat.lastMessage.timestamp).toLocaleDateString() : 'No date'}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-zinc-950 rounded-lg shadow dark:shadow-none dark:border dark:border-zinc-900 h-96 flex flex-col">
                {selectedChat ? (
                  <>
                    <div className="p-4 border-b border-gray-200 dark:border-zinc-800">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                          Chat with {selectedChat.participants.find(p => p._id !== session?.user?.id)?.firstName}
                        </h3>
                        {markingAsRead === selectedChat._id && (
                          <div className="flex items-center space-x-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                            <span className="text-sm text-blue-600">Marking as read...</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div 
                      ref={messagesContainerRef}
                      className="flex-1 p-4 overflow-y-auto"
                      onScroll={handleScroll}
                    >
                      {loadingMessages ? (
                        <div className="flex items-center justify-center h-full">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                      ) : chatMessages.length === 0 ? (
                        <p className="text-gray-500 dark:text-gray-500 text-center">No messages yet. Start the conversation!</p>
                      ) : (
                        <div className="space-y-4">
                          {chatMessages.map((message) => (
                            <div
                              key={message._id}
                              className={`flex ${
                                message.senderId._id === session?.user?.id ? 'justify-end' : 'justify-start'
                              }`}
                            >
                              <div
                                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                  message.senderId._id === session?.user?.id
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-200 text-gray-900'
                                }`}
                              >
                                <p className={`text-sm ${message.senderId._id === session?.user?.id ? 'text-white!' : 'text-gray-900!'}`}>{message.content}</p>
                                <p className={`text-xs mt-1 ${
                                  message.senderId._id === session?.user?.id
                                    ? 'text-blue-100!'
                                    : 'text-gray-500!'
                                }`}>
                                  {new Date(message.timestamp).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                              </div>
                            </div>
                          ))}
                          <div ref={messagesEndRef} />
                        </div>
                      )}
                    </div>
                    <div className="p-4 border-t border-gray-200 dark:border-zinc-800">
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                          placeholder="Type a message..."
                          className="flex-1 px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                        <button
                          onClick={sendMessage}
                          disabled={!newMessage.trim() || sendingMessage}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Send className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 dark:text-gray-500">Select a chat to start messaging</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="space-y-4">
            {notifications.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-500">No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`bg-white dark:bg-zinc-950 rounded-lg shadow dark:shadow-none dark:border dark:border-zinc-900 p-6 border-l-4 cursor-pointer hover:shadow-md transition-shadow ${
                    notification.isRead ? 'border-l-gray-300' : 'border-l-blue-500'
                  }`}
                  onClick={() => {
                    setSelectedNotification(notification);
                    // Auto-mark as read if not already read
                    if (!notification.isRead) {
                      markAsRead('notification', notification._id);
                    }
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      {getTypeIcon(notification.type)}
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">{notification.title}</h3>
                        <p className="mt-1 text-gray-600 dark:text-gray-400 line-clamp-2">{notification.message}</p>
                        <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-500">
                          <Clock className="h-4 w-4 mr-1" />
                          {notification.createdAt ? new Date(notification.createdAt).toLocaleDateString() : 'No date'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {notification.actionUrl && notification.actionText && (
                        <span className="text-blue-600 text-sm font-medium">
                          {notification.actionText}
                        </span>
                      )}
                      {!notification.isRead && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          New
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Updates Tab */}
        {activeTab === 'updates' && (
          <div className="space-y-4">
            {updates.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-500">No updates yet</p>
              </div>
            ) : (
              updates.map((update) => (
                <div
                  key={update._id}
                  className={`bg-white dark:bg-zinc-950 rounded-lg shadow dark:shadow-none dark:border dark:border-zinc-900 p-6 border-l-4 cursor-pointer hover:shadow-md transition-shadow ${getPriorityColor(update.priority)} ${
                    update.isRead ? 'opacity-75' : ''
                  }`}
                  onClick={() => {
                    setSelectedUpdate(update);
                    // Auto-mark as read if not already read
                    if (!update.isRead) {
                      markAsRead('update', update._id);
                    }
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      {getTypeIcon(update.type)}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white">{update.title}</h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            update.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                            update.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                            update.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {update.priority}
                          </span>
                        </div>
                        <p className="mt-2 text-gray-600 dark:text-gray-400 line-clamp-3">{update.content}</p>
                        <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-500">
                          <Clock className="h-4 w-4 mr-1" />
                          {update.createdAt ? new Date(update.createdAt).toLocaleDateString() : 'No date'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {update.actionUrl && update.actionText && (
                        <span className="text-blue-600 text-sm font-medium">
                          {update.actionText}
                        </span>
                      )}
                      {!update.isRead && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          New
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Notification Modal */}
      <NotificationModal
        notification={selectedNotification!}
        isOpen={!!selectedNotification}
        onClose={() => setSelectedNotification(null)}
        onMarkAsRead={(id) => {
          markAsRead('notification', id);
          setSelectedNotification(null);
        }}
      />

      {/* Update Modal */}
      <UpdateModal
        update={selectedUpdate!}
        isOpen={!!selectedUpdate}
        onClose={() => setSelectedUpdate(null)}
        onMarkAsRead={(id) => {
          markAsRead('update', id);
          setSelectedUpdate(null);
        }}
      />
    </Layout>
  );
};

export default NotificationsPage;
