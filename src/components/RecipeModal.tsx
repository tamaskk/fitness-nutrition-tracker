import React, { useState, useEffect } from 'react';
import { Recipe } from '@/types';
import { X, Clock, Users, Utensils, Plus, ShoppingCart, Languages } from 'lucide-react';
import { formatCalories } from '@/utils/calculations';
import { getCurrentDateString } from '@/utils/dateUtils';
import { translateRecipe } from '@/utils/liveTranslation';
import toast from 'react-hot-toast';

interface RecipeModalProps {
  recipe: Recipe | {
    uri: string;
    label: string;
    image: string;
    ingredients: any[];
    calories: number;
    yield: number;
    totalTime: number;
    cuisineType: string[];
    mealType: string[];
  } | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToMeal?: (mealData: any) => void;
}

const RecipeModal: React.FC<RecipeModalProps> = ({ 
  recipe, 
  isOpen, 
  onClose, 
  onAddToMeal
}) => {
  const [selectedMealType, setSelectedMealType] = useState<string>('lunch');
  const [selectedDate, setSelectedDate] = useState(getCurrentDateString());
  const [servings, setServings] = useState(1);
  const [currentRecipe, setCurrentRecipe] = useState<any>(recipe || null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<'en' | 'hu'>('en');

  // Update current recipe when recipe prop changes
  useEffect(() => {
    if (recipe) {
      setCurrentRecipe(recipe);
      // Set language to Hungarian for AI-generated recipes, English for others
      const isAIGenerated = 'source' in recipe && recipe.source === 'openai';
      setCurrentLanguage(isAIGenerated ? 'hu' : 'en');
    }
  }, [recipe]);

  if (!isOpen || !recipe || !currentRecipe) return null;

  const isRecipeModel = 'title' in currentRecipe;
  
  const title = isRecipeModel ? currentRecipe.title : currentRecipe.label;
  const image = isRecipeModel ? currentRecipe.imageUrl : currentRecipe.image;
  const ingredients = isRecipeModel ? currentRecipe.ingredients : currentRecipe.ingredients;
  const steps = isRecipeModel ? (currentRecipe.instructions || currentRecipe.steps || []) : (currentRecipe.steps || []);
  const calories = isRecipeModel ? currentRecipe.caloriesPerServing : Math.round(currentRecipe.calories || 0);
  const defaultServings = isRecipeModel ? currentRecipe.servings : currentRecipe.yield;
  const totalTime = isRecipeModel ? 
    ((currentRecipe.prepTime || 0) + (currentRecipe.cookTime || 0)) : 
    (currentRecipe.totalTime || 0);
  const tags = isRecipeModel ? currentRecipe.tags : [...(currentRecipe.cuisineType || []), ...(currentRecipe.mealType || [])];

  const handleTranslate = async (targetLang: 'en' | 'hu') => {
    if (targetLang === currentLanguage) return;
    
    setIsTranslating(true);
    try {
      if (targetLang === 'en') {
        // Switch back to original recipe
        setCurrentRecipe(recipe);
      } else {
        // Translate to Hungarian
        console.log('Original recipe ingredients:', recipe.ingredients);
        const translatedRecipe = await translateRecipe(recipe, targetLang);
        console.log('Translated recipe ingredients:', translatedRecipe.ingredients);
        setCurrentRecipe(translatedRecipe);
      }
      setCurrentLanguage(targetLang);
      toast.success(`Recipe translated to ${targetLang === 'hu' ? 'Hungarian' : 'English'}!`);
    } catch (error) {
      console.error('Translation error:', error);
      toast.error('Translation failed');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleAddToMeal = async () => {
    if (!onAddToMeal) return;

    // Ensure we have valid numbers, default to 0 if NaN or null
    const safeCalories = isNaN(calories) || calories === null || calories === undefined ? 0 : calories;
    const safeServings = isNaN(servings) || servings === null || servings === undefined || servings <= 0 ? 1 : servings;
    const totalCalories = Math.round(safeCalories * safeServings);
    
    const mealData = {
      name: `${title} (${safeServings} serving${safeServings > 1 ? 's' : ''})`,
      mealType: selectedMealType,
      calories: totalCalories,
      date: selectedDate,
      protein: 0, // Could be calculated from ingredients
      carbs: 0,
      fat: 0,
    };

    try {
      await onAddToMeal(mealData);
      toast.success('Recipe added to meals!');
      onClose();
    } catch (error) {
      toast.error('Failed to add recipe to meals');
    }
  };

  const handleAddToShoppingList = async () => {
    if (!ingredients) return;

    const shoppingItems = ingredients.map((ingredient: any) => ({
      name: isRecipeModel ? ingredient.name : ingredient.text,
      quantity: isRecipeModel ? ingredient.quantity : ingredient.measure,
      category: 'recipe',
    }));

    try {
      const response = await fetch('/api/shopping', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items: shoppingItems }),
      });

      if (!response.ok) {
        throw new Error('Failed to add ingredients to shopping list');
      }

      toast.success('Ingredients added to shopping list!');
    } catch (error) {
      console.error('Error adding to shopping list:', error);
      toast.error('Failed to add ingredients to shopping list');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={onClose} />
        
        <div className="relative bg-white dark:bg-zinc-950 rounded-lg shadow-xl dark:shadow-none dark:border dark:border-zinc-900 max-w-4xl w-full max-h-screen overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
              {currentRecipe.isTranslated && (
                <p className="text-sm text-blue-600 mt-1">
                  Translated to {currentLanguage === 'hu' ? 'Hungarian' : 'English'}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => handleTranslate('en')}
                  disabled={isTranslating}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    currentLanguage === 'en'
                      ? 'bg-white dark:bg-zinc-950 text-gray-900 dark:text-white shadow-sm dark:shadow-none'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  EN
                </button>
                <button
                  onClick={() => handleTranslate('hu')}
                  disabled={isTranslating}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    currentLanguage === 'hu'
                      ? 'bg-white dark:bg-zinc-950 text-gray-900 dark:text-white shadow-sm dark:shadow-none'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  HU
                </button>
              </div>
              {isTranslating && (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              )}
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Image and Info */}
              <div>
                {/* Recipe Image */}
                <div className="relative h-64 bg-gray-200 rounded-lg mb-6">
                  {image ? (
                    <img
                      src={image}
                      alt={title}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center rounded-lg">
                      <Utensils className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Recipe Info */}
                <div className="space-y-4">
                  <div className="flex items-center gap-6 text-sm text-gray-600">
                    {totalTime > 0 && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5" />
                        <span>{totalTime} minutes</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      <span>{defaultServings} serving{defaultServings > 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Utensils className="w-5 h-5" />
                      <span>{formatCalories(calories || 0)} cal/serving</span>
                    </div>
                  </div>

                  {/* Tags */}
                  {tags && tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag: any, index: number) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full capitalize"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column - Ingredients and Steps */}
              <div>
                {/* Ingredients */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {currentLanguage === 'hu' ? 'Hozzávalók' : 'Ingredients'}
                    </h3>
                    <button
                      onClick={handleAddToShoppingList}
                      className="flex items-center gap-2 px-3 py-1 text-sm text-blue-600 hover:text-blue-700"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      {currentLanguage === 'hu' ? 'Hozzáadás a bevásárlólistához' : 'Add to Shopping List'}
                    </button>
                  </div>
                  {ingredients && ingredients.length > 0 ? (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <ul className="space-y-3 recipe-ingredients">
                        {ingredients
                          .filter((ingredient: any) => {
                            const text = ingredient.text || ingredient.name || '';
                            return text && text.trim().length > 1 && !(/^\d+$/.test(text.trim()));
                          })
                          .map((ingredient: any, index: number) => {
                            const displayText = isRecipeModel ? 
                              `${ingredient.quantity || ''} ${ingredient.name || ''}`.trim() :
                              (ingredient.text || ingredient.name || 'Unknown ingredient');
                            
                            return (
                              <li key={index} className="flex items-start gap-3">
                                <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                                <span className="ingredient-text text-gray-900 font-medium text-base leading-relaxed">
                                  {displayText}
                                </span>
                              </li>
                            );
                          })}
                      </ul>
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-500 text-sm">
                        {currentLanguage === 'hu' ? 'Nincsenek elérhető hozzávalók' : 'No ingredients available'}
                      </p>
                    </div>
                  )}
                </div>

                {/* Instructions */}
                {steps && steps.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      {currentLanguage === 'hu' ? 'Elkészítés' : 'Instructions'}
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <ol className="space-y-4 recipe-steps">
                        {steps.map((step: any, index: number) => (
                          <li key={index} className="flex gap-4">
                            <span className="flex-shrink-0 w-7 h-7 bg-blue-600 text-white text-sm rounded-full flex items-center justify-center font-medium">
                              {index + 1}
                            </span>
                            <span className="text-base text-gray-900 font-medium leading-relaxed">{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>
                )}
                
                {/* If no instructions, show a message */}
                {(!steps || steps.length === 0) && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      {currentLanguage === 'hu' ? 'Elkészítés' : 'Instructions'}
                    </h3>
                    <p className="text-gray-500 text-sm">
                      {currentLanguage === 'hu' ? 'Nincs elérhető elkészítési útmutató' : 'No instructions available for this recipe'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Add to Meal Section */}
            <div className="mt-8 pt-6 border-t">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {currentLanguage === 'hu' ? 'Hozzáadás az étkezéshez' : 'Add to Meal'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {currentLanguage === 'hu' ? 'Dátum' : 'Date'}
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {currentLanguage === 'hu' ? 'Étkezés típusa' : 'Meal Type'}
                  </label>
                  <select
                    value={selectedMealType}
                    onChange={(e) => setSelectedMealType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="breakfast">{currentLanguage === 'hu' ? 'Reggeli' : 'Breakfast'}</option>
                    <option value="lunch">{currentLanguage === 'hu' ? 'Ebéd' : 'Lunch'}</option>
                    <option value="dinner">{currentLanguage === 'hu' ? 'Vacsora' : 'Dinner'}</option>
                    <option value="snack">{currentLanguage === 'hu' ? 'Uzsonna' : 'Snack'}</option>
                    <option value="drink">{currentLanguage === 'hu' ? 'Ital' : 'Drink'}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {currentLanguage === 'hu' ? 'Adagok' : 'Servings'}
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
                <button
                  onClick={handleAddToMeal}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  {currentLanguage === 'hu' ? 'Hozzáadás az étkezéshez' : 'Add to Meal'} ({formatCalories(Math.round((isNaN(calories) || calories === null ? 0 : calories) * (isNaN(servings) || servings === null || servings <= 0 ? 1 : servings)))} {currentLanguage === 'hu' ? 'kal' : 'cal'})
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeModal;
