import React, { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';

interface RecipeSearchProps {
  onSearch: (searchParams: {
    query: string;
    mealType?: string;
    cuisineType?: string;
    diet?: string;
    health?: string;
  }) => void;
  loading?: boolean;
}

const RecipeSearch: React.FC<RecipeSearchProps> = ({ onSearch, loading = false }) => {
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    mealType: '',
    cuisineType: '',
    diet: '',
    health: '',
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch({
        query: query.trim(),
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== '')
        ),
      });
    }
  };

  const clearFilters = () => {
    setFilters({
      mealType: '',
      cuisineType: '',
      diet: '',
      health: '',
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  return (
    <div className="space-y-4">
      {/* Search Form */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for recipes..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className={`px-4 py-2 border rounded-lg flex items-center gap-2 ${
            showFilters || hasActiveFilters
              ? 'border-blue-500 text-blue-600 bg-blue-50'
              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Filter className="w-4 h-4" />
          Filters
          {hasActiveFilters && (
            <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {Object.values(filters).filter(v => v !== '').length}
            </span>
          )}
        </button>
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-gray-50 p-4 rounded-lg border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-900">Filters</h3>
            <div className="flex gap-2">
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-gray-600 hover:text-gray-800"
                >
                  Clear all
                </button>
              )}
              <button
                onClick={() => setShowFilters(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Meal Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Meal Type
              </label>
              <select
                value={filters.mealType}
                onChange={(e) => setFilters({ ...filters, mealType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Any</option>
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
                <option value="snack">Snack</option>
              </select>
            </div>

            {/* Cuisine Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cuisine
              </label>
              <select
                value={filters.cuisineType}
                onChange={(e) => setFilters({ ...filters, cuisineType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Any</option>
                <option value="american">American</option>
                <option value="asian">Asian</option>
                <option value="italian">Italian</option>
                <option value="mexican">Mexican</option>
                <option value="mediterranean">Mediterranean</option>
                <option value="indian">Indian</option>
              </select>
            </div>

            {/* Diet */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Diet
              </label>
              <select
                value={filters.diet}
                onChange={(e) => setFilters({ ...filters, diet: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Any</option>
                <option value="balanced">Balanced</option>
                <option value="high-protein">High Protein</option>
                <option value="low-carb">Low Carb</option>
                <option value="low-fat">Low Fat</option>
              </select>
            </div>

            {/* Health */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Health
              </label>
              <select
                value={filters.health}
                onChange={(e) => setFilters({ ...filters, health: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Any</option>
                <option value="vegetarian">Vegetarian</option>
                <option value="vegan">Vegan</option>
                <option value="gluten-free">Gluten Free</option>
                <option value="dairy-free">Dairy Free</option>
                <option value="nut-free">Nut Free</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecipeSearch;

