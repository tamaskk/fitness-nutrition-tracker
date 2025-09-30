import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { ShoppingListItem } from '@/types';
import { Plus, ShoppingCart, Trash2, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';

const ShoppingPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [items, setItems] = useState<ShoppingListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newItemName, setNewItemName] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'purchased'>('all');

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/login');
      return;
    }

    fetchItems();
  }, [session, status, router]);

  const fetchItems = async () => {
    try {
      const response = await fetch('/api/shopping');
      if (response.ok) {
        const data = await response.json();
        setItems(data);
      }
    } catch (error) {
      console.error('Error fetching shopping items:', error);
      toast.error('Failed to load shopping list');
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newItemName.trim()) {
      toast.error('Item name is required');
      return;
    }

    try {
      const response = await fetch('/api/shopping', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: [{
            name: newItemName.trim(),
            quantity: newItemQuantity.trim(),
            category: 'general',
          }]
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add item');
      }

      toast.success('Item added to shopping list!');
      setNewItemName('');
      setNewItemQuantity('');
      setShowAddForm(false);
      fetchItems(); // Refresh the list
    } catch (error) {
      console.error('Error adding item:', error);
      toast.error('Failed to add item');
    }
  };

  const handleTogglePurchased = async (itemId: string, purchased: boolean) => {
    try {
      const response = await fetch(`/api/shopping/items/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ purchased }),
      });

      if (!response.ok) {
        throw new Error('Failed to update item');
      }

      fetchItems(); // Refresh the list
    } catch (error) {
      console.error('Error updating item:', error);
      toast.error('Failed to update item');
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this item?')) {
      return;
    }

    try {
      const response = await fetch(`/api/shopping/items/${itemId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete item');
      }

      toast.success('Item deleted!');
      fetchItems(); // Refresh the list
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Failed to delete item');
    }
  };

  const handleClearPurchased = async () => {
    const purchasedItems = items.filter(item => item.purchased);
    
    if (purchasedItems.length === 0) {
      toast.error('No purchased items to clear');
      return;
    }

    if (!confirm(`Are you sure you want to remove ${purchasedItems.length} purchased items?`)) {
      return;
    }

    try {
      await Promise.all(
        purchasedItems.map(item => 
          fetch(`/api/shopping/items/${item._id}`, { method: 'DELETE' })
        )
      );
      
      toast.success('Purchased items cleared!');
      fetchItems();
    } catch (error) {
      console.error('Error clearing purchased items:', error);
      toast.error('Failed to clear purchased items');
    }
  };

  if (status === 'loading' || loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  if (!session) return null;

  const filteredItems = items.filter(item => {
    if (filter === 'pending') return !item.purchased;
    if (filter === 'purchased') return item.purchased;
    return true;
  });

  const pendingCount = items.filter(item => !item.purchased).length;
  const purchasedCount = items.filter(item => item.purchased).length;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Shopping List</h1>
            <p className="text-gray-600">Manage your grocery and shopping items</p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            {purchasedCount > 0 && (
              <button 
                onClick={handleClearPurchased}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Clear Purchased ({purchasedCount})
              </button>
            )}
            <button 
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </button>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Items</p>
                <p className="text-2xl font-bold text-gray-900">{items.length}</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 text-orange-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Check className="w-5 h-5 text-green-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Purchased</p>
                <p className="text-2xl font-bold text-gray-900">{purchasedCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            {[
              { key: 'all', label: 'All Items', count: items.length },
              { key: 'pending', label: 'Pending', count: pendingCount },
              { key: 'purchased', label: 'Purchased', count: purchasedCount },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  filter === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </nav>
        </div>

        {/* Add Item Form */}
        {showAddForm && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Item</h3>
            <form onSubmit={handleAddItem} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Item Name *
                  </label>
                  <input
                    type="text"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    placeholder="Enter item name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity
                  </label>
                  <input
                    type="text"
                    value={newItemQuantity}
                    onChange={(e) => setNewItemQuantity(e.target.value)}
                    placeholder="e.g., 2 lbs, 1 bottle"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Add Item
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setNewItemName('');
                    setNewItemQuantity('');
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Shopping Items */}
        {filteredItems.length > 0 ? (
          <div className="bg-white rounded-lg shadow">
            <div className="divide-y divide-gray-200">
              {filteredItems.map((item) => (
                <div key={item._id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleTogglePurchased(item._id!, !item.purchased)}
                        className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center ${
                          item.purchased
                            ? 'bg-green-500 border-green-500 text-white'
                            : 'border-gray-300 hover:border-green-500'
                        }`}
                      >
                        {item.purchased && <Check className="w-3 h-3" />}
                      </button>
                      <div className="flex-1">
                        <h4 className={`font-medium ${
                          item.purchased ? 'text-gray-500 line-through' : 'text-gray-900'
                        }`}>
                          {item.name}
                        </h4>
                        {item.quantity && (
                          <p className={`text-sm ${
                            item.purchased ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            {item.quantity}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        item.purchased 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-orange-100 text-orange-800'
                      }`}>
                        {item.purchased ? 'Purchased' : 'Pending'}
                      </span>
                      <button
                        onClick={() => handleDeleteItem(item._id!)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              {filter === 'all' ? 'No items in your shopping list' : 
               filter === 'pending' ? 'No pending items' : 'No purchased items'}
            </h3>
            <p className="mt-2 text-gray-600">
              {filter === 'all' && 'Get started by adding your first item!'}
            </p>
            {filter === 'all' && (
              <div className="mt-6">
                <button 
                  onClick={() => setShowAddForm(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Item
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ShoppingPage;
