import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { Search, ShoppingCart, Filter, ChevronLeft, ChevronRight, Store, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

interface PriceData {
  products: Product[];
  count: number;
}

interface Product {
  id: string;
  name: string;
  imageUrl: string;
  unit: string;
  unitTitle: string;
  bulk: boolean;
  returnType: string | null;
  returnFee: number;
  packaging: string;
  categoryPath: string;
  minUnitPrice: number;
  pricesOfChainStores: ChainStore[];
  rankTextSearch: number;
  rankCommonString: number;
}

interface ChainStore {
  id: string;
  name: string;
  priceSameEverywhere: boolean;
  productMinAmount: number;
  prices: Price[];
}

interface Price {
  type: 'NORMAL' | 'DISCOUNTED';
  amount: number;
  unitAmount: number;
  sameAmountEverywhere: boolean;
}

const PriceMonitorPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedStore, setSelectedStore] = useState<string>('');
  const [availableStores, setAvailableStores] = useState<string[]>([]);
  const [showStoreFilter, setShowStoreFilter] = useState(false);

  const itemsPerPage = 24;

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/login');
      return;
    }
  }, [session, status, router]);

  const searchProducts = async (query: string, page: number = 0, storeFilter?: string) => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      const encodedQuery = encodeURIComponent(query.trim());
      let url = `/api/price-monitor/search?q=${encodedQuery}&limit=${itemsPerPage}&offset=${page * itemsPerPage}&order=relevance`;

      console.log('URL:', url);
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('API hívás sikertelen');
      }

      const data: PriceData = await response.json();
      
      // Extract unique store names
      const stores = new Set<string>();
      data.products.forEach(product => {
        product.pricesOfChainStores.forEach(store => {
          stores.add(store.name);
        });
      });
      setAvailableStores(Array.from(stores));

      // Filter by store if selected
      let filteredProducts = data.products;
      if (storeFilter && storeFilter !== '') {
        filteredProducts = data.products.filter(product =>
          product.pricesOfChainStores.some(store => store.name === storeFilter)
        );
      }

      setProducts(filteredProducts);
      setTotalCount(data.count);
      setCurrentPage(page);
    } catch (error) {
      console.error('Error searching products:', error);
      toast.error('Nem sikerült a termékek keresése');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      searchProducts(searchQuery, 0, selectedStore);
    }
  };

  const handleStoreFilterChange = (store: string) => {
    setSelectedStore(store);
    if (searchQuery.trim()) {
      searchProducts(searchQuery, 0, store);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (searchQuery.trim()) {
      searchProducts(searchQuery, newPage, selectedStore);
    }
  };

  const addToShoppingList = async (product: Product, selectedStore?: string) => {
    try {
      const requestBody = {
        items: [{
          name: product.name,
          quantity: `1 ${product.unitTitle}`,
          category: 'price-monitor',
          extraInfo: JSON.stringify({
            productId: product.id,
            imageUrl: product.imageUrl,
            unit: product.unit,
            unitTitle: product.unitTitle,
            bulk: product.bulk,
            returnType: product.returnType,
            returnFee: product.returnFee,
            packaging: product.packaging,
            categoryPath: product.categoryPath,
            minUnitPrice: product.minUnitPrice,
            pricesOfChainStores: product.pricesOfChainStores,
            rankTextSearch: product.rankTextSearch,
            rankCommonString: product.rankCommonString,
            selectedStore: selectedStore || '',
            addedAt: new Date().toISOString()
          }),
          preferredStore: selectedStore || ''
        }]
      };

      const response = await fetch('/api/shopping', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error('Failed to add item');
      }

      toast.success('Termék hozzáadva a bevásárlólistához!');
    } catch (error) {
      console.error('Error adding to shopping list:', error);
      toast.error('Nem sikerült a termék hozzáadása');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('hu-HU').format(price);
  };

  const getBestPrice = (product: Product) => {
    let bestPrice = product.minUnitPrice;
    let bestStore = '';
    
    product.pricesOfChainStores.forEach(store => {
      const discountedPrice = store.prices.find(p => p.type === 'DISCOUNTED');
      const normalPrice = store.prices.find(p => p.type === 'NORMAL');
      // Use the actual item price (amount) instead of unit price
      const currentPrice = discountedPrice ? discountedPrice.amount : normalPrice?.amount || store.productMinAmount;
      
      if (currentPrice < bestPrice) {
        bestPrice = currentPrice;
        bestStore = store.name;
      }
    });
    
    return { price: bestPrice, store: bestStore };
  };

  if (status === 'loading') {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  if (!session) return null;

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  useEffect(() => {
    if (router.query.q) {
      setSearchQuery(router.query.q as string);
      searchProducts(router.query.q as string, 0, selectedStore);
    }
  }, [router.query.q]);

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Árfigyelő</h1>
            <p className="text-gray-600 dark:text-gray-400">Keress és hasonlíts össze termékárakat különböző boltokban</p>
          </div>
        </div>

        {/* Search Form */}
        <div className="bg-white dark:bg-zinc-950 rounded-lg shadow dark:shadow-none dark:border dark:border-zinc-900 p-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Termék keresése
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="pl. csirkemell filé, tej, kenyér..."
                    className="w-full px-3 py-2 pl-10 border border-gray-300 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={loading || !searchQuery.trim()}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Keresés...' : 'Keresés'}
                </button>
              </div>
            </div>
          </form>

          {/* Store Filter */}
          {availableStores.length > 0 && (
            <div className="mt-4">
              <div className="flex items-center gap-2 mb-2">
                <Filter className="h-4 w-4 text-gray-500 dark:text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Bolt szűrő:</span>
                <button
                  onClick={() => setShowStoreFilter(!showStoreFilter)}
                  className="text-blue-600 hover:text-blue-700 text-sm"
                >
                  {showStoreFilter ? 'Elrejtés' : 'Megjelenítés'}
                </button>
              </div>
              {showStoreFilter && (
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleStoreFilterChange('')}
                    className={`px-3 py-1 text-sm rounded-full border ${
                      selectedStore === '' 
                        ? 'bg-blue-100 border-blue-500 text-blue-700' 
                        : 'bg-gray-100 border-gray-300 dark:border-zinc-700 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Összes bolt
                  </button>
                  {availableStores.map((store) => (
                    <button
                      key={store}
                      onClick={() => handleStoreFilterChange(store)}
                      className={`px-3 py-1 text-sm rounded-full border ${
                        selectedStore === store 
                          ? 'bg-blue-100 border-blue-500 text-blue-700' 
                          : 'bg-gray-100 border-gray-300 dark:border-zinc-700 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {store}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Results */}
        {products.length > 0 && (
          <div className="space-y-4">
            {/* Results Header */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {totalCount} termék találat
                {selectedStore && ` (${selectedStore} szűrve)`}
              </p>
              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 0}
                    className="p-2 border border-gray-300 dark:border-zinc-700 rounded-md hover:bg-gray-50 dark:hover:bg-zinc-900 dark:bg-black disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {currentPage + 1} / {totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages - 1}
                    className="p-2 border border-gray-300 dark:border-zinc-700 rounded-md hover:bg-gray-50 dark:hover:bg-zinc-900 dark:bg-black disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => {
                const bestPrice = getBestPrice(product);
                return (
                  <div key={product.id} className="bg-white dark:bg-zinc-950 rounded-lg shadow-md dark:shadow-none dark:border dark:border-zinc-900 overflow-hidden hover:shadow-lg transition-shadow">
                    {/* Product Image */}
                    <div className="aspect-square bg-gray-100 dark:bg-zinc-950 flex items-center justify-center">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.currentTarget as HTMLImageElement;
                            target.style.display = 'none';
                            const nextElement = target.nextElementSibling as HTMLElement;
                            if (nextElement) {
                              nextElement.style.display = 'flex';
                            }
                          }}
                        />
                      ) : null}
                      <div className="w-full h-full flex items-center justify-center text-gray-400" style={{ display: product.imageUrl ? 'none' : 'flex' }}>
                        <ShoppingCart className="h-12 w-12" />
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="p-4">
                      <h3 className="font-medium text-gray-900 dark:text-white text-sm mb-2 line-clamp-2">
                        {product.name}
                      </h3>
                      
                      {/* Price Info */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-green-600">
                            {formatPrice(bestPrice.price)} Ft
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-500">
                            /{product.unitTitle}
                          </span>
                        </div>
                        
                        {bestPrice.store && (
                          <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                            <Store className="h-3 w-3" />
                            <span>{bestPrice.store}</span>
                          </div>
                        )}
                      </div>

                      {/* Store Prices */}
                      <div className="mt-3 space-y-1">
                        {product.pricesOfChainStores.slice(0, 2).map((store) => {
                          const discountedPrice = store.prices.find(p => p.type === 'DISCOUNTED');
                          const normalPrice = store.prices.find(p => p.type === 'NORMAL');
                          // Use the actual item price (amount) instead of unit price
                          const currentPrice = discountedPrice ? discountedPrice.amount : normalPrice?.amount || store.productMinAmount;
                          const isDiscounted = !!discountedPrice;
                          
                          return (
                            <div key={store.id} className="flex items-center justify-between text-xs">
                              <span className="text-gray-600 dark:text-gray-400">{store.name}</span>
                              <div className="flex items-center gap-1">
                                {isDiscounted && (
                                  <span className="text-gray-400 line-through">
                                    {formatPrice(normalPrice?.amount || store.productMinAmount)}
                                  </span>
                                )}
                                <span className={`font-medium ${isDiscounted ? 'text-red-600' : 'text-gray-900'}`}>
                                  {formatPrice(currentPrice)}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Add to Shopping List Section */}
                      <div className="mt-3 space-y-2">
                        {product.pricesOfChainStores.length > 1 ? (
                          <>
                            <select
                              onChange={(e) => {
                                if (e.target.value) {
                                  addToShoppingList(product, e.target.value);
                                  e.target.value = ''; // Reset selection
                                }
                              }}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                              defaultValue=""
                            >
                              <option value="" disabled>Bolt kiválasztása...</option>
                              {product.pricesOfChainStores.map((store) => {
                                const discountedPrice = store.prices.find(p => p.type === 'DISCOUNTED');
                                const normalPrice = store.prices.find(p => p.type === 'NORMAL');
                                // Use the actual item price (amount) instead of unit price
                                const currentPrice = discountedPrice ? discountedPrice.amount : normalPrice?.amount || store.productMinAmount;
                                return (
                                  <option key={store.id} value={store.name}>
                                    {store.name} - {formatPrice(currentPrice)} Ft
                                  </option>
                                );
                              })}
                              <option value="">Bolt nélkül</option>
                            </select>
                            <button
                              onClick={() => addToShoppingList(product)}
                              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700"
                            >
                              <Plus className="h-4 w-4" />
                              Bolt nélkül hozzáadás
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => addToShoppingList(product, product.pricesOfChainStores[0]?.name)}
                            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                          >
                            <Plus className="h-4 w-4" />
                            Bevásárlólistához ({product.pricesOfChainStores[0]?.name || 'Bolt nélkül'})
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && products.length === 0 && searchQuery && (
          <div className="text-center py-12 bg-white dark:bg-zinc-950 rounded-lg shadow dark:shadow-none dark:border dark:border-zinc-900">
            <Search className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
              Nincs találat
            </h3>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Próbálj meg másik keresési kifejezést használni
            </p>
          </div>
        )}

        {/* Initial State */}
        {!loading && products.length === 0 && !searchQuery && (
          <div className="text-center py-12 bg-white dark:bg-zinc-950 rounded-lg shadow dark:shadow-none dark:border dark:border-zinc-900">
            <Search className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
              Árfigyelő
            </h3>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Keress termékeket és hasonlítsd össze az árakat különböző boltokban
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default PriceMonitorPage;
