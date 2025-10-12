import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { ShoppingListItem } from '@/types';
import { Plus, ShoppingCart, Trash2, Check, X, Store } from 'lucide-react';
import toast from 'react-hot-toast';

// Expand the shopping list item type with a suggestion field
export interface ShoppingListItemWithSuggestion extends ShoppingListItem {
  suggestion?: {
    name: string;
    shop: string;
    price: number;
    unit: string;
    imageUrl: string;
  }[] | null;
  suggestionState: 'pending' | 'success' | 'error' | 'empty';
}

const ShoppingPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [items, setItems] = useState<ShoppingListItemWithSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [newItemName, setNewItemName] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'purchased'>('all');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [editingExtraInfo, setEditingExtraInfo] = useState<{ [key: string]: string }>({});
  const [editingPreferredStore, setEditingPreferredStore] = useState<{ [key: string]: string }>({});

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
      toast.error('Nem sikerült a bevásárlólista betöltése');
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newItemName.trim()) {
      toast.error('A tétel neve kötelező');
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

      toast.success('Tétel hozzáadva a bevásárlólistához!');
      setNewItemName('');
      setNewItemQuantity('');
      setShowAddForm(false);
      fetchItems(); // Refresh the list
    } catch (error) {
      console.error('Error adding item:', error);
      toast.error('Nem sikerült a tétel hozzáadása');
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
      toast.error('Nem sikerült a tétel frissítése');
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Biztosan törölni szeretnéd ezt a tételt?')) {
      return;
    }

    try {
      const response = await fetch(`/api/shopping/items/${itemId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete item');
      }

      toast.success('Tétel törölve!');
      fetchItems(); // Refresh the list
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Nem sikerült a tétel törlése');
    }
  };

  const handleClearPurchased = async () => {
    const purchasedItems = items.filter(item => item.purchased);
    
    if (purchasedItems.length === 0) {
      toast.error('Nincsenek megvásárolt tételek a törléshez');
      return;
    }

    if (!confirm(`Biztosan eltávolítod a ${purchasedItems.length} megvásárolt tételt?`)) {
      return;
    }

    try {
      await Promise.all(
        purchasedItems.map(item => 
          fetch(`/api/shopping/items/${item._id}`, { method: 'DELETE' })
        )
      );
      
      toast.success('Megvásárolt tételek törölve!');
      fetchItems();
    } catch (error) {
      console.error('Error clearing purchased items:', error);
      toast.error('Nem sikerült a megvásárolt tételek törlése');
    }
  };

  const getSuggestionShoppingList = async (item: ShoppingListItem) => {
    try {
      // mark as pending
      setItems(prevItems => 
        prevItems.map(prev => 
          prev._id === item._id ? { ...prev, suggestion: null, suggestionState: 'pending' } : prev
        )
      );

      const response = await fetch(`/api/price-monitor/search?q=${item.name}&limit=3&offset=0&order=relevance`);
      if (response.ok) {
        const data = await response.json();
        const products = Array.isArray(data?.products) ? data.products : [];

        // transform API products -> lightweight suggestion entries
        const suggestions = products.slice(0, 6).map((p: any) => {
          // choose best (lowest) price across chain stores, fallback to minUnitPrice
          let bestPrice = typeof p.minUnitPrice === 'number' ? p.minUnitPrice : undefined;
          let bestShop = '';
          if (Array.isArray(p.pricesOfChainStores) && p.pricesOfChainStores.length > 0) {
            p.pricesOfChainStores.forEach((store: any) => {
              const firstPrice = Array.isArray(store?.prices) && store.prices.length > 0 ? store.prices[0] : null;
              const amount = firstPrice?.amount;
              if (typeof amount === 'number') {
                if (bestPrice === undefined || amount < bestPrice) {
                  bestPrice = amount;
                  bestShop = store?.name || '';
                }
              }
            });
          }
          return {
            name: p.name,
            shop: bestShop || (Array.isArray(p.pricesOfChainStores) && p.pricesOfChainStores[0]?.name) || '',
            price: bestPrice ?? 0,
            unit: p.unitTitle || p.unit || '',
            imageUrl: p.imageUrl || '',
          };
        }).filter((s: any) => s.name && s.price);

        setItems(prevItems => 
          prevItems.map(prev => 
            prev._id === item._id 
              ? { 
                  ...prev, 
                  suggestion: suggestions.length > 0 ? suggestions : null, 
                  suggestionState: suggestions.length > 0 ? 'success' : 'empty' 
                }
              : prev
          )
        );
      }
    }
    catch (error) {
      console.error('Error getting suggestion shopping list:', error);
      setItems(prevItems => 
        prevItems.map(prev => 
          prev._id === item._id ? { ...prev, suggestionState: 'error' } : prev
        )
      );
      toast.error('Nem sikerült a tétel ajánlása');
    }
  };

  const handleSelectAll = async () => {
    const pendingItems = filteredItems.filter(item => !item.purchased);
    
    if (pendingItems.length === 0) {
      toast.error('Nincsenek függőben lévő tételek a kijelöléshez');
      return;
    }

    try {
      await Promise.all(
        pendingItems.map(item => 
          fetch(`/api/shopping/items/${item._id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ purchased: true }),
          })
        )
      );
      
      toast.success(`${pendingItems.length} tétel megvásároltként jelölve!`);
      fetchItems();
    } catch (error) {
      console.error('Error selecting all items:', error);
      toast.error('Nem sikerült az összes tétel kijelölése');
    }
  };

  const handleToggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const handleUpdateExtraInfo = async (itemId: string, extraInfo: string) => {
    try {
      const response = await fetch(`/api/shopping/items/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ extraInfo }),
      });

      if (!response.ok) {
        throw new Error('Nem sikerült az extra információ frissítése');
      }

      // Update local state
      setItems(prevItems => 
        prevItems.map(item => 
          item._id === itemId ? { ...item, extraInfo } : item
        )
      );
      
      // Clear editing state
      setEditingExtraInfo(prev => {
        const newState = { ...prev };
        delete newState[itemId];
        return newState;
      });
      
      toast.success('Extra információ frissítve!');
    } catch (error) {
      console.error('Error updating extra info:', error);
      toast.error('Nem sikerült az extra információ frissítése');
    }
  };

  const handleStartEditingExtraInfo = (itemId: string, currentExtraInfo: string = '') => {
    setEditingExtraInfo(prev => ({
      ...prev,
      [itemId]: currentExtraInfo
    }));
  };

  const handleCancelEditingExtraInfo = (itemId: string) => {
    setEditingExtraInfo(prev => {
      const newState = { ...prev };
      delete newState[itemId];
      return newState;
    });
  };

  const handleUpdatePreferredStore = async (itemId: string, preferredStore: string) => {
    try {
      const response = await fetch(`/api/shopping/items/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferredStore }),
      });

      if (!response.ok) {
        throw new Error('Nem sikerült a preferált bolt frissítése');
      }

      // Update local state
      setItems(prevItems => 
        prevItems.map(item => 
          item._id === itemId ? { ...item, preferredStore } : item
        )
      );
      
      // Clear editing state
      setEditingPreferredStore(prev => {
        const newState = { ...prev };
        delete newState[itemId];
        return newState;
      });
      
      toast.success('Preferált bolt frissítve!');
    } catch (error) {
      console.error('Error updating preferred store:', error);
      toast.error('Nem sikerült a preferált bolt frissítése');
    }
  };

  const handleStartEditingPreferredStore = (itemId: string, currentPreferredStore: string = '') => {
    setEditingPreferredStore(prev => ({
      ...prev,
      [itemId]: currentPreferredStore
    }));
  };

  const handleCancelEditingPreferredStore = (itemId: string) => {
    setEditingPreferredStore(prev => {
      const newState = { ...prev };
      delete newState[itemId];
      return newState;
    });
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

  const filteredItems = items.filter((item: ShoppingListItemWithSuggestion) => {
    if (filter === 'pending') return !item.purchased;
    if (filter === 'purchased') return item.purchased;
    return true;
  });

  const pendingCount = items.filter((item: ShoppingListItemWithSuggestion) => !item.purchased).length;
  const purchasedCount = items.filter((item: ShoppingListItemWithSuggestion) => item.purchased).length;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Bevásárlólista</h1>
            <p className="text-gray-600">Kezeld a bevásárlási és élelmiszer tételeidet</p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            {purchasedCount > 0 && (
              <button 
                onClick={handleClearPurchased}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Megvásároltak törlése ({purchasedCount})
              </button>
            )}
            <button 
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Tétel hozzáadása
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
                <p className="text-sm font-medium text-gray-600">Összes tétel</p>
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
                <p className="text-sm font-medium text-gray-600">Függőben</p>
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
                <p className="text-sm font-medium text-gray-600">Megvásárolva</p>
                <p className="text-2xl font-bold text-gray-900">{purchasedCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            {[
              { key: 'all', label: 'Összes tétel', count: items.length },
              { key: 'pending', label: 'Függőben', count: pendingCount },
              { key: 'purchased', label: 'Megvásárolva', count: purchasedCount },
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
            <h3 className="text-lg font-medium text-gray-900 mb-4">Új tétel hozzáadása</h3>
            <form onSubmit={handleAddItem} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tétel neve *
                  </label>
                  <input
                    type="text"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    placeholder="Tétel neve"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mennyiség
                  </label>
                  <input
                    type="text"
                    value={newItemQuantity}
                    onChange={(e) => setNewItemQuantity(e.target.value)}
                    placeholder="pl. 2 kg, 1 üveg"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Tétel hozzáadása
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
                  Mégse
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Shopping Items */}
        {filteredItems.length > 0 ? (
          <div className="bg-white rounded-lg shadow">
            {/* Select All Header */}
            {(((filter === 'pending') || (filter === 'all' && expandedItems.size > 0)) && filteredItems.length > 0) && (
              <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={handleSelectAll}
                      className="flex-shrink-0 w-5 h-5 rounded border-2 border-gray-300 hover:border-green-500 flex items-center justify-center"
                    >
                      <Check className="w-3 h-3 text-gray-400" />
                    </button>
                    <span className="text-sm font-medium text-gray-700">
                      Összes kijelölése ({filteredItems.filter(i => !i.purchased).length} tétel)
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            <div className="divide-y divide-gray-200">
              {filteredItems.map((item: ShoppingListItemWithSuggestion) => {
                const isExpanded = expandedItems.has(item._id!);
                const isEditingExtraInfo = editingExtraInfo[item._id!] !== undefined;
                const isEditingPreferredStore = editingPreferredStore[item._id!] !== undefined;
                
                return (
                  <div key={item._id} className={`transition-all duration-200 ${isExpanded ? 'bg-blue-50' : 'hover:bg-gray-50'} w-full text-left`}>
                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 flex-1">
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
                            <div className="flex items-center space-x-2">
                              <h4 className={`font-medium ${
                                item.purchased ? 'text-gray-500 line-through' : 'text-gray-900'
                              }`}>
                                {item.name}
                              </h4>
                              {item.extraInfo && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  Info
                                </span>
                              )}
                              {item.preferredStore && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  <Store className="w-3 h-3 mr-1" />
                                  {item.preferredStore}
                                </span>
                              )}
                            </div>
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
                          <button
                            onClick={() => {
                              handleToggleExpanded(item._id!);
                              getSuggestionShoppingList(item);
                            }}
                            className="text-gray-400 hover:text-gray-600 p-1"
                            title="Extra információ"
                          >
                            <svg 
                              className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            item.purchased 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-orange-100 text-orange-800'
                          }`}>
                            {item.purchased ? 'Megvásárolva' : 'Függőben'}
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
                    
                    {/* Expanded Content */}
                    {isExpanded && (
                      <div className="px-4 pb-4 border-t border-gray-100 bg-white">
                        <div className="pt-4 space-y-6">
                          {/* Preferred Store Section */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Preferált bolt
                            </label>
                            {isEditingPreferredStore ? (
                              <div className="space-y-2">
                                <input
                                  type="text"
                                  value={editingPreferredStore[item._id!]}
                                  onChange={(e) => setEditingPreferredStore(prev => ({
                                    ...prev,
                                    [item._id!]: e.target.value
                                  }))}
                                  placeholder="pl. Tesco, Spar, Auchan..."
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleUpdatePreferredStore(item._id!, editingPreferredStore[item._id!])}
                                    className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
                                  >
                                    Mentés
                                  </button>
                                  <button
                                    onClick={() => handleCancelEditingPreferredStore(item._id!)}
                                    className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-md hover:bg-gray-200"
                                  >
                                    Mégse
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                {item.preferredStore ? (
                                  <div className="flex items-center gap-2 p-3 bg-green-50 rounded-md">
                                    <Store className="w-4 h-4 text-green-600" />
                                    <span className="text-sm text-green-700 font-medium">{item.preferredStore}</span>
                                  </div>
                                ) : (
                                  <p className="text-sm text-gray-500 italic">Nincs preferált bolt megadva</p>
                                )}
                                <button
                                  onClick={() => handleStartEditingPreferredStore(item._id!, item.preferredStore)}
                                  className="text-green-600 hover:text-green-700 text-sm font-medium"
                                >
                                  {item.preferredStore ? 'Szerkesztés' : 'Hozzáadás'}
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Extra Info Section */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Extra információ
                            </label>
                            {isEditingExtraInfo ? (
                              <div className="space-y-2">
                                <textarea
                                  value={editingExtraInfo[item._id!]}
                                  onChange={(e) => setEditingExtraInfo(prev => ({
                                    ...prev,
                                    [item._id!]: e.target.value
                                  }))}
                                  placeholder="Pl. konkrét márka, méret, megjegyzés..."
                                  rows={3}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleUpdateExtraInfo(item._id!, editingExtraInfo[item._id!])}
                                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                                  >
                                    Mentés
                                  </button>
                                  <button
                                    onClick={() => handleCancelEditingExtraInfo(item._id!)}
                                    className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-md hover:bg-gray-200"
                                  >
                                    Mégse
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                {item.extraInfo ? (
                                  <div className="p-3 bg-gray-50 rounded-md">
                                    {(() => {
                                      try {
                                        const productInfo = JSON.parse(item.extraInfo);
                                        if (productInfo.productId) {
                                          // This is a price monitor product with full data
                                          return (
                                            <div className="space-y-2">
                                              <div className="flex items-center gap-2">
                                                <img 
                                                  src={productInfo.imageUrl} 
                                                  alt={item.name}
                                                  className="w-12 h-12 object-cover rounded"
                                                  onError={(e) => {
                                                    e.currentTarget.style.display = 'none';
                                                  }}
                                                />
                                                <div className="flex-1">
                                                  <p className="text-sm font-medium text-gray-900">
                                                    {item.name}
                                                  </p>
                                                  <p className="text-xs text-gray-600">
                                                    ID: {productInfo.productId}
                                                  </p>
                                                  <p className="text-xs text-gray-600">
                                                    Kategória: {productInfo.categoryPath}
                                                  </p>
                                                </div>
                                              </div>
                                              <div className="grid grid-cols-2 gap-2 text-xs">
                                                <div>
                                                  <span className="font-medium">Egység:</span> <span className='text-gray-500'>{productInfo.unitTitle}</span>
                                                </div>
                                                <div>
                                                  <span className="font-medium">Csomagolás:</span> <span className='text-gray-500'>{productInfo.packaging}</span>
                                                </div>
                                                <div>
                                                  <span className="font-medium">Min. ár:</span> <span className='text-gray-500'>{new Intl.NumberFormat('hu-HU').format(productInfo.minUnitPrice)} Ft</span>
                                                </div>
                                                <div>
                                                  <span className="font-medium">Hozzáadva:</span> <span className='text-gray-500'>{new Date(productInfo.addedAt).toLocaleDateString('hu-HU')}</span>
                                                </div>
                                              </div>
                                              {productInfo.selectedStore && (
                                                <div className="text-xs">
                                                  <span className="font-medium">Kiválasztott bolt:</span> <span className='text-gray-500'>{productInfo.selectedStore}</span>
                                                </div>
                                              )}
                                            </div>
                                          );
                                        } else {
                                          // This is regular extra info
                                          return (
                                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{item.extraInfo}</p>
                                          );
                                        }
                                      } catch (e) {
                                        // Not JSON, display as regular text
                                        return (
                                          <p className="text-sm text-gray-700 whitespace-pre-wrap">{item.extraInfo}</p>
                                        );
                                      }
                                    })()}
                                  </div>
                                ) : (
                                  <p className="text-sm text-gray-500 italic">Nincs extra információ</p>
                                )}
                                <button
                                  onClick={() => handleStartEditingExtraInfo(item._id!, item.extraInfo)}
                                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                                >
                                  {item.extraInfo ? 'Szerkesztés' : 'Hozzáadás'}
                                </button>
                                <div className='mt-5'>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">Boltok ahol ajánlatos vásárolni</label>
                                  {item.suggestionState === 'success' && item.suggestion && item.suggestion.length > 0 && (
                                    <div className="grid grid-cols-3 gap-2">
                                      {item.suggestion.map((suggestion) => (
                                        <div key={suggestion.shop}>
                                          <img src={suggestion.imageUrl} alt={suggestion.name} className="w-full h-24 object-cover rounded" />
                                          <p className="text-sm font-medium text-gray-900">{suggestion.name}</p>
                                          <p className="text-sm text-gray-600">{suggestion.shop}</p>
                                          <p className="text-sm text-gray-600">{suggestion.price} Ft</p>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                  {item.suggestionState === 'pending' && (
                                    <div className="text-sm text-gray-500 italic">Ajánlatot kérünk a tételhez</div>
                                  )}
                                  {item.suggestionState === 'error' && (
                                    <div className="text-sm text-gray-500 italic">Hiba történt az ajánlat kérésekor</div>
                                  )}
                                  {item.suggestionState === 'empty' && (
                                    <div className="text-sm text-gray-500 italic">Nincs ajánlat a tételhez</div>
                                  )}

                                  <button
                                    onClick={() => {
                                      router.push(`/price-monitor?q=${item.name}`);
                                    }}
                                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                                  >
                                    Több ajánlat kérése
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              {filter === 'all' ? 'Nincsenek tételek a bevásárlólistában' : 
               filter === 'pending' ? 'Nincsenek függőben lévő tételek' : 'Nincsenek megvásárolt tételek'}
            </h3>
            <p className="mt-2 text-gray-600">
              {filter === 'all' && 'Kezdd el az első tétel hozzáadásával!'}
            </p>
            {filter === 'all' && (
              <div className="mt-6">
                <button 
                  onClick={() => setShowAddForm(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Első tétel hozzáadása
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
