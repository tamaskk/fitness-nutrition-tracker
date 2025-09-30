import React from 'react';
import { Recipe } from '@/types';
import { Clock, Users, Utensils, Plus } from 'lucide-react';
import { formatCalories } from '@/utils/calculations';

interface RecipeCardProps {
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
  };
  onAddToMeal?: (recipe: any) => void;
  onViewDetails?: (recipe: any) => void;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onAddToMeal, onViewDetails }) => {
  const isRecipeModel = 'title' in recipe;
  
  const title = isRecipeModel ? recipe.title : recipe.label;
  const image = isRecipeModel ? recipe.imageUrl : recipe.image;
  const calories = isRecipeModel ? recipe.caloriesPerServing : Math.round(recipe.calories);
  const servings = isRecipeModel ? recipe.servings : recipe.yield;
  const totalTime = isRecipeModel ? 
    ((recipe.prepTime || 0) + (recipe.cookTime || 0)) : 
    recipe.totalTime;
  const tags = isRecipeModel ? recipe.tags : [...(recipe.cuisineType || []), ...(recipe.mealType || [])];

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {/* Recipe Image */}
      <div className="relative h-48 bg-gray-200">
        {image ? (
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Utensils className="w-12 h-12 text-gray-400" />
          </div>
        )}
        <div className="absolute top-2 right-2">
          <span className="bg-black bg-opacity-70 text-white px-2 py-1 rounded text-sm">
            {formatCalories(calories || 0)} cal
          </span>
        </div>
      </div>

      {/* Recipe Content */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          {title}
        </h3>

        {/* Recipe Info */}
        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
          {totalTime > 0 && (
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{totalTime} min</span>
            </div>
          )}
          {servings && (
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{servings} serving{servings > 1 ? 's' : ''}</span>
            </div>
          )}
        </div>

        {/* Tags */}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full capitalize"
              >
                {tag}
              </span>
            ))}
            {tags.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                +{tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Ingredients Preview */}
        {isRecipeModel && recipe.ingredients && recipe.ingredients.length > 0 && (
          <div className="mb-3">
            <p className="text-sm text-gray-600">
              {recipe.ingredients.length} ingredient{recipe.ingredients.length > 1 ? 's' : ''}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => onViewDetails?.(recipe)}
            className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            View Recipe
          </button>
          <button
            onClick={() => onAddToMeal?.(recipe)}
            className="px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Add to Meal
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecipeCard;

