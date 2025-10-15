import React from 'react';
import { X, Clock, CheckCircle, XCircle, Info, AlertTriangle } from 'lucide-react';
import { Notification } from '@/types';

interface NotificationModalProps {
  notification: Notification;
  isOpen: boolean;
  onClose: () => void;
  onMarkAsRead: (id: string) => void;
}

const NotificationModal: React.FC<NotificationModalProps> = ({
  notification,
  isOpen,
  onClose,
  onMarkAsRead
}) => {
  if (!isOpen) return null;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'info': return <Info className="h-6 w-6 text-blue-500" />;
      case 'warning': return <AlertTriangle className="h-6 w-6 text-yellow-500" />;
      case 'success': return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'error': return <XCircle className="h-6 w-6 text-red-500" />;
      default: return <Info className="h-6 w-6 text-gray-500" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'info': return 'border-l-blue-500';
      case 'warning': return 'border-l-yellow-500';
      case 'success': return 'border-l-green-500';
      case 'error': return 'border-l-red-500';
      default: return 'border-l-gray-500';
    }
  };

  const handleMarkAsRead = () => {
    if (!notification.isRead) {
      onMarkAsRead(notification._id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Blurred background */}
      <div className="fixed inset-0 bg-white dark:bg-black bg-opacity-80 backdrop-blur-md transition-all duration-200 ease-out" onClick={onClose} />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className={`relative w-full max-w-2xl bg-white dark:bg-zinc-950 rounded-lg shadow-2xl dark:shadow-none border border-gray-200 dark:border-zinc-800 border-l-4 transform transition-all duration-200 ease-out ${getTypeColor(notification.type)}`}>
          {/* Header */}
          <div className="flex items-start justify-between p-6 border-b border-gray-200">
            <div className="flex items-start space-x-3">
              {getTypeIcon(notification.type)}
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900">{notification.title}</h3>
                <div className="mt-1 flex items-center text-sm text-gray-500">
                  <Clock className="h-4 w-4 mr-1" />
                  {notification.createdAt ? (
                    new Date(notification.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })
                  ) : (
                    'No date'
                  )}
                </div>
                {notification.sentBy && (
                  <div className="mt-1 text-sm text-gray-600">
                    From: {notification.sentBy.firstName} {notification.sentBy.lastName}
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {notification.message}
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center space-x-2">
              {notification.isRead && (
                <span className="text-sm text-green-600 font-medium">✓ Read</span>
              )}
            </div>
            <div className="flex items-center space-x-3">
              {notification.actionUrl && notification.actionText && (
                <a
                  href={notification.actionUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                >
                  {notification.actionText}
                </a>
              )}
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-zinc-950 border border-gray-300 dark:border-zinc-800 rounded-md hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationModal;
