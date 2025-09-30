import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { X, Search, Camera, QrCode, Brain } from 'lucide-react';
import { MealFormData } from '@/types';
import { getCurrentDateString } from '@/utils/dateUtils';
import { getMealTypeColor } from '@/utils/calculations';
import BarcodeScanner from './BarcodeScanner';
import ImageAnalyzer from './ImageAnalyzer';
import AIEstimator from './AIEstimator';

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
    setSearchQuery('');
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
      // Mock food search - in real app, this would call a nutrition API
      const mockFoods = [
        { id: 1, name: 'Chicken Breast', caloriesPer100g: 165, proteinPer100g: 31, carbsPer100g: 0, fatPer100g: 3.6 },
        { id: 2, name: 'Brown Rice', caloriesPer100g: 111, proteinPer100g: 2.6, carbsPer100g: 23, fatPer100g: 0.9 },
        { id: 3, name: 'Broccoli', caloriesPer100g: 34, proteinPer100g: 2.8, carbsPer100g: 7, fatPer100g: 0.4 },
        { id: 4, name: 'Salmon Fillet', caloriesPer100g: 208, proteinPer100g: 25, carbsPer100g: 0, fatPer100g: 12 },
        { id: 5, name: 'Greek Yogurt', caloriesPer100g: 59, proteinPer100g: 10, carbsPer100g: 3.6, fatPer100g: 0.4 },
        { id: 6, name: 'Banana', caloriesPer100g: 89, proteinPer100g: 1.1, carbsPer100g: 23, fatPer100g: 0.3 },
        { id: 7, name: 'Almonds', caloriesPer100g: 579, proteinPer100g: 21, carbsPer100g: 22, fatPer100g: 50 },
        { id: 8, name: 'Sweet Potato', caloriesPer100g: 86, proteinPer100g: 1.6, carbsPer100g: 20, fatPer100g: 0.1 },
      ];

      const filtered = mockFoods.filter(food => 
        food.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      setSearchResults(filtered);
    } catch (error) {
      console.error('Food search error:', error);
    } finally {
      setLoading(false);
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
        
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-bold text-gray-900">Add Meal</h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6">
            <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  {...register('date', { required: 'Date is required' })}
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.date && (
                  <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
                )}
              </div>

              {/* Meal Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meal Type
                </label>
                <select
                  {...register('mealType', { required: 'Meal type is required' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="dinner">Dinner</option>
                  <option value="snack">Snack</option>
                  <option value="drink">Drink</option>
                </select>
                {errors.mealType && (
                  <p className="mt-1 text-sm text-red-600">{errors.mealType.message}</p>
                )}
              </div>

              {/* Smart Food Input Options */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Add Food Using:
                </label>
                
                {/* Smart Input Buttons */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-4">
                  <button
                    type="button"
                    onClick={() => setShowBarcodeScanner(true)}
                    className="flex items-center justify-center px-3 py-2 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 border border-blue-200"
                  >
                    <QrCode className="w-4 h-4 mr-2" />
                    Barcode
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowImageAnalyzer(true)}
                    className="flex items-center justify-center px-3 py-2 bg-purple-50 text-purple-700 rounded-md hover:bg-purple-100 border border-purple-200"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Photo
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAIEstimator(true)}
                    className="flex items-center justify-center px-3 py-2 bg-green-50 text-green-700 rounded-md hover:bg-green-100 border border-green-200"
                  >
                    <Brain className="w-4 h-4 mr-2" />
                    AI Estimate
                  </button>
                  <button
                    type="button"
                    onClick={handleFoodSearch}
                    disabled={loading || !searchQuery.trim()}
                    className="flex items-center justify-center px-3 py-2 bg-gray-50 text-gray-700 rounded-md hover:bg-gray-100 border border-gray-200 disabled:opacity-50"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Search
                  </button>
                </div>

                {/* Traditional Search */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for food or enter manually..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleFoodSearch())}
                  />
                </div>

                {/* Search Results */}
                {searchResults.length > 0 && (
                  <div className="mt-2 border border-gray-200 rounded-md max-h-40 overflow-y-auto">
                    {searchResults.map((food) => (
                      <button
                        key={food.id}
                        type="button"
                        onClick={() => handleFoodSelect(food)}
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                      >
                        <div className="font-medium">{food.name}</div>
                        <div className="text-sm text-gray-600">
                          {food.caloriesPer100g} cal/100g
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Food Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Food Name
                </label>
                <input
                  {...register('name', { required: 'Food name is required' })}
                  type="text"
                  placeholder="Enter food name or select from search"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity (grams)
                </label>
                <input
                  {...register('quantityGrams', { 
                    required: 'Quantity is required',
                    min: { value: 1, message: 'Quantity must be at least 1 gram' }
                  })}
                  type="number"
                  step="1"
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.quantityGrams && (
                  <p className="mt-1 text-sm text-red-600">{errors.quantityGrams.message}</p>
                )}
              </div>

              {/* Calories */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Calories
                </label>
                <input
                  {...register('calories', { 
                    required: 'Calories is required',
                    min: { value: 1, message: 'Calories must be at least 1' }
                  })}
                  type="number"
                  step="1"
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.calories && (
                  <p className="mt-1 text-sm text-red-600">{errors.calories.message}</p>
                )}
                {selectedFood && (
                  <p className="mt-1 text-sm text-gray-600">
                    Auto-calculated from {selectedFood.name} ({selectedFood.caloriesPer100g} cal/100g)
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Add Meal
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
