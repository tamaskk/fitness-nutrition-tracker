import React, { useState } from 'react';
import { X, Utensils, Clock, Users } from 'lucide-react';
import { formatCalories } from '@/utils/calculations';

interface RecipeToMealModalProps {
  recipe: any;
  isOpen: boolean;
  onClose: () => void;
  onAddToMeal: (mealData: { mealType: string; servings: number }) => void;
}

const RecipeToMealModal: React.FC<RecipeToMealModalProps> = ({
  recipe,
  isOpen,
  onClose,
  onAddToMeal
}) => {
  const [selectedMealType, setSelectedMealType] = useState('lunch');
  const [servings, setServings] = useState(1);

  if (!isOpen || !recipe) return null;

  const isRecipeModel = 'title' in recipe;
  const recipeName = isRecipeModel ? recipe.title : recipe.label;
  const recipeImage = isRecipeModel ? recipe.imageUrl : recipe.image;
  const recipeCalories = isRecipeModel ? recipe.caloriesPerServing : Math.round(recipe.calories || 0);
  const recipeServings = isRecipeModel ? recipe.servings : recipe.yield;
  const totalCalories = Math.round(recipeCalories * servings);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddToMeal({ mealType: selectedMealType, servings });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={onClose} />
        
        <div className="relative bg-white dark:bg-zinc-950 rounded-lg shadow-xl dark:shadow-none dark:border dark:border-zinc-900 max-w-md w-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-bold text-gray-900">Recept hozzáadása étkezéshez</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6">
            {/* Recipe Preview */}
            <div className="mb-6">
              <div className="flex items-start gap-4">
                {recipeImage && (
                  <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={recipeImage}
                      alt={recipeName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 mb-1">{recipeName}</h3>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Utensils className="w-4 h-4" />
                      <span>{formatCalories(recipeCalories)} kal/adag</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{recipeServings} adag</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Meal Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Étkezés típusa
                </label>
                <select
                  value={selectedMealType}
                  onChange={(e) => setSelectedMealType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="breakfast">Reggeli</option>
                  <option value="lunch">Ebéd</option>
                  <option value="dinner">Vacsora</option>
                  <option value="snack">Uzsonna</option>
                  <option value="drink">Ital</option>
                </select>
              </div>

              {/* Servings */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Adagok száma
                </label>
                <input
                  type="number"
                  min="0.5"
                  max="10"
                  step="0.5"
                  value={servings}
                  onChange={(e) => setServings(parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Calorie Summary */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-900">Összes kalória:</span>
                  <span className="text-lg font-bold text-blue-900">{formatCalories(totalCalories)} kal</span>
                </div>
                <p className="text-xs text-blue-700 mt-1">
                  {servings} adag × {formatCalories(recipeCalories)} kal/adag
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Hozzáadás étkezéshez
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeToMealModal;

