import React from 'react';
import { X, Clock, Zap, Wrench, AlertCircle, Megaphone } from 'lucide-react';
import { Update } from '@/types';

interface UpdateModalProps {
  update: Update;
  isOpen: boolean;
  onClose: () => void;
  onMarkAsRead: (id: string) => void;
}

const UpdateModal: React.FC<UpdateModalProps> = ({
  update,
  isOpen,
  onClose,
  onMarkAsRead
}) => {
  if (!isOpen) return null;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'feature': return <Zap className="h-6 w-6 text-purple-500" />;
      case 'bugfix': return <Wrench className="h-6 w-6 text-orange-500" />;
      case 'maintenance': return <AlertCircle className="h-6 w-6 text-gray-500" />;
      case 'announcement': return <Megaphone className="h-6 w-6 text-indigo-500" />;
      default: return <Zap className="h-6 w-6 text-gray-500" />;
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

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'Urgent';
      case 'high': return 'High';
      case 'medium': return 'Medium';
      case 'low': return 'Low';
      default: return 'Medium';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'feature': return 'New Feature';
      case 'bugfix': return 'Bug Fix';
      case 'maintenance': return 'Maintenance';
      case 'announcement': return 'Announcement';
      default: return 'Update';
    }
  };

  const handleMarkAsRead = () => {
    if (!update.isRead) {
      onMarkAsRead(update._id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Blurred background */}
      <div className="fixed inset-0 bg-white bg-opacity-80 backdrop-blur-md transition-all duration-200 ease-out" onClick={onClose} />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className={`relative w-full max-w-3xl bg-white rounded-lg shadow-2xl border border-gray-200 border-l-4 transform transition-all duration-200 ease-out ${getPriorityColor(update.priority)}`}>
          {/* Header */}
          <div className="flex items-start justify-between p-6 border-b border-gray-200">
            <div className="flex items-start space-x-3">
              {getTypeIcon(update.type)}
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="text-xl font-semibold text-gray-900">{update.title}</h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    update.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                    update.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                    update.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {getPriorityText(update.priority)}
                  </span>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {update.createdAt ? (
                      new Date(update.createdAt).toLocaleDateString('en-US', {
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
                  <div className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                    {getTypeText(update.type)}
                  </div>
                </div>
                {update.sentBy && (
                  <div className="mt-1 text-sm text-gray-600">
                    From: {update.sentBy.firstName} {update.sentBy.lastName}
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
              <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {update.content}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center space-x-2">
              {update.isRead && (
                <span className="text-sm text-green-600 font-medium">✓ Read</span>
              )}
            </div>
            <div className="flex items-center space-x-3">
              {update.actionUrl && update.actionText && (
                <a
                  href={update.actionUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                >
                  {update.actionText}
                </a>
              )}
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
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

export default UpdateModal;
