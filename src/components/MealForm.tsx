import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { X, Search, Camera, QrCode, Brain, BookOpen } from 'lucide-react';
import { MealFormData } from '@/types';
import { getCurrentDateString } from '@/utils/dateUtils';
import { getMealTypeColor } from '@/utils/calculations';
import BarcodeScanner from './BarcodeScanner';
import ImageAnalyzer from './ImageAnalyzer';
import AIEstimator from './AIEstimator';
import toast from 'react-hot-toast';

interface MealFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: MealFormData & { date: string }) => void;
  initialMealType?: string;
  initialDate?: string;
}

const MealForm: React.FC<MealFormProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialMealType = 'lunch',
  initialDate = getCurrentDateString()
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFood, setSelectedFood] = useState<any>(null);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [showImageAnalyzer, setShowImageAnalyzer] = useState(false);
  const [showAIEstimator, setShowAIEstimator] = useState(false);
  const [searchMode, setSearchMode] = useState<'food' | 'recipe'>('food');
  const [recipeResults, setRecipeResults] = useState<any[]>([]);
  const [recipeLoading, setRecipeLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<MealFormData & { date: string }>({
    defaultValues: {
      mealType: initialMealType as any,
      date: initialDate,
      quantityGrams: 100,
    },
  });

  const watchedQuantity = watch('quantityGrams');

  const handleClose = () => {
    reset();
    setSelectedFood(null);
    setSearchResults([]);
    setRecipeResults([]);
    setSearchQuery('');
    setSearchMode('food');
    setShowBarcodeScanner(false);
    setShowImageAnalyzer(false);
    setShowAIEstimator(false);
    onClose();
  };

  const handleBarcodeResult = (foodData: any) => {
    setValue('name', `${foodData.name}${foodData.brand ? ` (${foodData.brand})` : ''}`);
    setSelectedFood(foodData);
    setShowBarcodeScanner(false);
  };

  const handleImageAnalysis = (analysisData: any) => {
    setValue('name', analysisData.name);
    setValue('calories', analysisData.calories);
    setValue('quantityGrams', analysisData.quantityGrams);
    setShowImageAnalyzer(false);
  };

  const handleAIEstimation = (estimationData: any) => {
    setValue('name', estimationData.name);
    setValue('calories', estimationData.calories);
    setValue('quantityGrams', estimationData.quantityGrams);
    setShowAIEstimator(false);
  };

  const handleFoodSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      // Use Edamam Food Database API for nutrition data
      const response = await fetch(`/api/food/search?q=${encodeURIComponent(searchQuery)}`);
      
      if (!response.ok) {
        throw new Error('Failed to search foods');
      }
      
      const foods = await response.json();
      setSearchResults(foods);
      
      if (foods.length === 0) {
        toast.error('Nem találtunk ételt ezzel a névvel');
      }
    } catch (error) {
      console.error('Food search error:', error);
      toast.error('Hiba történt az étel keresésekor');
      
      // Fallback to mock data
      const mockFoods = [
        { id: 1, name: 'Csirkemell', caloriesPer100g: 165, proteinPer100g: 31, carbsPer100g: 0, fatPer100g: 3.6, fiberPer100g: 0, brand: null, category: 'Hús', image: null },
        { id: 2, name: 'Barna rizs', caloriesPer100g: 111, proteinPer100g: 2.6, carbsPer100g: 23, fatPer100g: 0.9, fiberPer100g: 1.8, brand: null, category: 'Gabona', image: null },
        { id: 3, name: 'Brokkoli', caloriesPer100g: 34, proteinPer100g: 2.8, carbsPer100g: 7, fatPer100g: 0.4, fiberPer100g: 2.6, brand: null, category: 'Zöldség', image: null },
      ];
      
      const filtered = mockFoods.filter(food => 
        food.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(filtered);
    } finally {
      setLoading(false);
    }
  };

  const handleRecipeSearch = async () => {
    if (!searchQuery.trim()) return;

    setRecipeLoading(true);
    try {
      // Search through saved recipes
      const response = await fetch(`/api/recipes?search=${encodeURIComponent(searchQuery)}&limit=10`);
      
      if (!response.ok) {
        throw new Error('Failed to search recipes');
      }
      
      const recipes = await response.json();
      setRecipeResults(recipes);
      
      if (recipes.length === 0) {
        toast.error('Nem találtunk receptet ezzel a névvel');
      }
    } catch (error) {
      console.error('Recipe search error:', error);
      toast.error('Hiba történt a recept keresésekor');
    } finally {
      setRecipeLoading(false);
    }
  };

  const handleFoodSelect = (food: any) => {
    setSelectedFood(food);
    setValue('name', food.name);
    
    // Calculate calories based on current quantity
    const calories = Math.round((food.caloriesPer100g * watchedQuantity) / 100);
    setValue('calories', calories);
    
    setSearchResults([]);
    setSearchQuery('');
  };

  const handleRecipeSelect = (recipe: any) => {
    setSelectedFood(recipe);
    setValue('name', recipe.title);
    
    // Use recipe's calories per serving
    if (recipe.caloriesPerServing) {
      setValue('calories', recipe.caloriesPerServing);
    }
    
    setRecipeResults([]);
    setSearchQuery('');
  };

  const onFormSubmit = (data: MealFormData & { date: string }) => {
    // Recalculate calories if we have selected food
    if (selectedFood) {
      const calories = Math.round((selectedFood.caloriesPer100g * data.quantityGrams) / 100);
      data.calories = calories;
    }
    
    onSubmit(data);
    handleClose();
  };

  // Update calories when quantity changes
  React.useEffect(() => {
    if (selectedFood && watchedQuantity) {
      const calories = Math.round((selectedFood.caloriesPer100g * watchedQuantity) / 100);
      setValue('calories', calories);
    }
  }, [selectedFood, watchedQuantity, setValue]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={handleClose} />
        
        <div className="relative bg-white dark:bg-zinc-950 rounded-lg shadow-xl dark:shadow-none dark:border dark:border-zinc-900 max-w-md w-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b dark:border-zinc-900">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Étkezés hozzáadása</h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-400"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6">
            <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Dátum
                </label>
                <input
                  {...register('date', { required: 'Date is required' })}
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-900 dark:text-white"
                />
                {errors.date && (
                  <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
                )}
              </div>

              {/* Meal Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Étkezés típusa
                </label>
                <select
                  {...register('mealType', { required: 'Meal type is required' })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-900 dark:text-white"
                >
                  <option value="breakfast">Reggeli</option>
                  <option value="lunch">Ebéd</option>
                  <option value="dinner">Vacsora</option>
                  <option value="snack">Uzsonna</option>
                  <option value="drink">Ital</option>
                </select>
                {errors.mealType && (
                  <p className="mt-1 text-sm text-red-600">{errors.mealType.message}</p>
                )}
              </div>

              {/* Smart Food Input Options */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Étel hozzáadása:
                </label>
                
                {/* Search Mode Toggle */}
                <div className="flex gap-2 mb-4">
                  <button
                    type="button"
                    onClick={() => {
                      setSearchMode('food');
                      setSearchResults([]);
                      setRecipeResults([]);
                    }}
                    className={`flex-1 px-3 py-2 text-sm font-medium rounded-md border transition-all ${
                      searchMode === 'food'
                        ? 'bg-blue-50 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/30'
                        : 'bg-gray-50 dark:bg-zinc-900 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <Search className="w-4 h-4 mr-2 inline" />
                    Étel keresés
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchMode('recipe');
                      setSearchResults([]);
                      setRecipeResults([]);
                    }}
                    className={`flex-1 px-3 py-2 text-sm font-medium rounded-md border transition-all ${
                      searchMode === 'recipe'
                        ? 'bg-purple-50 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-500/30'
                        : 'bg-gray-50 dark:bg-zinc-900 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <BookOpen className="w-4 h-4 mr-2 inline" />
                    Recept keresés
                  </button>
                </div>

                {/* Smart Input Buttons */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <button
                    type="button"
                    onClick={() => setShowAIEstimator(true)}
                    className="flex items-center justify-center px-3 py-2 bg-green-50 dark:bg-green-500/20 text-green-700 dark:text-green-400 rounded-md hover:bg-green-100 dark:hover:bg-green-500/30 border border-green-200 dark:border-green-500/30"
                  >
                    <Brain className="w-4 h-4 mr-2" />
                    AI Becslés
                  </button>
                  <button
                    type="button"
                    onClick={searchMode === 'food' ? handleFoodSearch : handleRecipeSearch}
                    disabled={(searchMode === 'food' ? loading : recipeLoading) || !searchQuery.trim()}
                    className="flex items-center justify-center px-3 py-2 bg-gray-50 dark:bg-zinc-900 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-zinc-800 border border-gray-200 dark:border-zinc-800 disabled:opacity-50"
                  >
                    {(searchMode === 'food' ? loading : recipeLoading) ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 dark:border-gray-400 mr-2"></div>
                    ) : (
                      <Search className="w-4 h-4 mr-2" />
                    )}
                    {(searchMode === 'food' ? loading : recipeLoading) ? 'Keresés...' : 'Keresés'}
                  </button>
                </div>

                {/* Traditional Search */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={searchMode === 'food' ? "Keress ételt vagy add meg kézzel..." : "Keress mentett receptek között..."}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-zinc-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-900 dark:text-white dark:placeholder-gray-500"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), searchMode === 'food' ? handleFoodSearch() : handleRecipeSearch())}
                  />
                </div>

                {/* Search Results */}
                {searchMode === 'food' && searchResults.length > 0 && (
                  <div className="mt-2 border border-gray-200 dark:border-zinc-800 rounded-md max-h-40 overflow-y-auto dark:bg-zinc-950">
                    {searchResults.map((food) => (
                      <button
                        key={food.id}
                        type="button"
                        onClick={() => handleFoodSelect(food)}
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-zinc-900 border-b border-gray-100 dark:border-zinc-800 last:border-b-0"
                      >
                        <div className="font-medium dark:text-white">{food.name}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {food.caloriesPer100g} kal/100g
                          {food.brand && <span className="ml-2 text-gray-500 dark:text-gray-500">({food.brand})</span>}
                          {food.category && <span className="ml-2 text-blue-600 dark:text-blue-400">• {food.category}</span>}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          Fehérje: {food.proteinPer100g}g • Szénhidrát: {food.carbsPer100g}g • Zsír: {food.fatPer100g}g
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Recipe Results */}
                {searchMode === 'recipe' && recipeResults.length > 0 && (
                  <div className="mt-2 border border-gray-200 dark:border-zinc-800 rounded-md max-h-40 overflow-y-auto dark:bg-zinc-950">
                    {recipeResults.map((recipe) => (
                      <button
                        key={recipe._id}
                        type="button"
                        onClick={() => handleRecipeSelect(recipe)}
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-zinc-900 border-b border-gray-100 dark:border-zinc-800 last:border-b-0"
                      >
                        <div className="font-medium flex items-center dark:text-white">
                          <BookOpen className="w-4 h-4 mr-2 text-purple-600 dark:text-purple-400" />
                          {recipe.title}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {recipe.caloriesPerServing ? `${recipe.caloriesPerServing} kal/adag` : 'Kalória nincs megadva'}
                          {recipe.servings && <span className="ml-2 text-gray-500 dark:text-gray-500">• {recipe.servings} adag</span>}
                          {recipe.category && <span className="ml-2 text-purple-600 dark:text-purple-400">• {recipe.category}</span>}
                        </div>
                        {recipe.ingredients && recipe.ingredients.length > 0 && (
                          <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                            {recipe.ingredients.slice(0, 3).map((ing: any) => ing.name).join(', ')}
                            {recipe.ingredients.length > 3 && '...'}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Food Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Étel neve
                </label>
                <input
                  {...register('name', { required: 'Food name is required' })}
                  type="text"
                  placeholder="Add meg az étel nevét vagy válassz a keresésből"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-900 dark:text-white dark:placeholder-gray-500"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Mennyiség (gramm)
                </label>
                <input
                  {...register('quantityGrams', { 
                    required: 'Quantity is required',
                    min: { value: 1, message: 'Quantity must be at least 1 gram' }
                  })}
                  type="number"
                  step="1"
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-900 dark:text-white"
                />
                {errors.quantityGrams && (
                  <p className="mt-1 text-sm text-red-600">{errors.quantityGrams.message}</p>
                )}
              </div>

              {/* Calories */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Kalóriák
                </label>
                <input
                  {...register('calories', { 
                    required: 'Calories is required',
                    min: { value: 1, message: 'Calories must be at least 1' }
                  })}
                  type="number"
                  step="1"
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-900 dark:text-white"
                />
                {errors.calories && (
                  <p className="mt-1 text-sm text-red-600">{errors.calories.message}</p>
                )}
                {selectedFood && (
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Auto-calculated from {selectedFood.name} ({selectedFood.caloriesPer100g} cal/100g)
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Étkezés hozzáadása
                </button>
              </div>
            </form>
          </div>

          {/* Smart Feature Modals */}
          <BarcodeScanner
            isOpen={showBarcodeScanner}
            onClose={() => setShowBarcodeScanner(false)}
            onFoodFound={handleBarcodeResult}
          />

          <ImageAnalyzer
            isOpen={showImageAnalyzer}
            onClose={() => setShowImageAnalyzer(false)}
            onAnalysisComplete={handleImageAnalysis}
          />

          <AIEstimator
            isOpen={showAIEstimator}
            onClose={() => setShowAIEstimator(false)}
            onEstimationComplete={handleAIEstimation}
            initialFoodName={searchQuery}
          />
        </div>
      </div>
    </div>
  );
};

export default MealForm;
