import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import MealForm from '@/components/MealForm';
import RecipeToMealModal from '@/components/RecipeToMealModal';
import { getCurrentDateString } from '@/utils/dateUtils';
import { MealEntry, MealFormData } from '@/types';
import { Plus, Clock, Utensils, Trash2 } from 'lucide-react';
import { getMealTypeColor } from '@/utils/calculations';
import toast from 'react-hot-toast';

const MealsPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [meals, setMeals] = useState<MealEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(getCurrentDateString());
  const [showMealForm, setShowMealForm] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<string>('lunch');
  const [savedRecipes, setSavedRecipes] = useState<any[]>([]);
  const [recipesLoading, setRecipesLoading] = useState(false);
  const [showRecipeToMealModal, setShowRecipeToMealModal] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null);
  const [foodSearchQuery, setFoodSearchQuery] = useState('');
  const [foodSearchResults, setFoodSearchResults] = useState<any[]>([]);
  const [foodSearchLoading, setFoodSearchLoading] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/login');
      return;
    }

    fetchMeals();
    loadSavedRecipes();
  }, [session, status, router, selectedDate]);

  const fetchMeals = async () => {
    try {
      const response = await fetch(`/api/meals?date=${selectedDate}`);
      if (response.ok) {
        const data = await response.json();
        setMeals(data);
      }
    } catch (error) {
      console.error('Error fetching meals:', error);
      toast.error('Failed to load meals');
    } finally {
      setLoading(false);
    }
  };

  const loadSavedRecipes = async () => {
    setRecipesLoading(true);
    try {
      const response = await fetch('/api/recipes');
      if (response.ok) {
        const data = await response.json();
        setSavedRecipes(data);
      }
    } catch (error) {
      console.error('Error loading saved recipes:', error);
      toast.error('Failed to load saved recipes');
    } finally {
      setRecipesLoading(false);
    }
  };

  const handleAddMeal = async (mealData: MealFormData & { date: string }) => {
    try {
      const response = await fetch('/api/meals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mealData),
      });

      if (!response.ok) {
        throw new Error('Failed to add meal');
      }

      toast.success('Meal added successfully!');
      fetchMeals(); // Refresh the meals list
    } catch (error) {
      console.error('Error adding meal:', error);
      toast.error('Failed to add meal');
    }
  };

  const handleDeleteMeal = async (mealId: string) => {
    if (!confirm('Are you sure you want to delete this meal?')) {
      return;
    }

    try {
      const response = await fetch(`/api/meals?id=${mealId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete meal');
      }

      toast.success('Meal deleted successfully!');
      fetchMeals(); // Refresh the meals list
    } catch (error) {
      console.error('Error deleting meal:', error);
      toast.error('Failed to delete meal');
    }
  };

  const handleOpenMealForm = (mealType: string) => {
    setSelectedMealType(mealType);
    setShowMealForm(true);
  };

  const handleSelectRecipe = (recipe: any) => {
    setSelectedRecipe(recipe);
    setShowRecipeToMealModal(true);
  };

  const handleAddRecipeToMeal = async (mealData: { mealType: string; servings: number }) => {
    if (!selectedRecipe) return;

    try {
      const isRecipeModel = 'title' in selectedRecipe;
      const recipeName = isRecipeModel ? selectedRecipe.title : selectedRecipe.label;
      const recipeCalories = isRecipeModel ? selectedRecipe.caloriesPerServing : Math.round(selectedRecipe.calories || 0);
      
      const totalCalories = Math.round(recipeCalories * mealData.servings);
      
      const mealEntry = {
        name: `${recipeName} (${mealData.servings} adag)`,
        mealType: mealData.mealType,
        calories: totalCalories,
        date: selectedDate,
        protein: 0, // Could be calculated from recipe
        carbs: 0,
        fat: 0,
        quantityGrams: 0, // Recipe-based meals don't have specific grams
      };

      const response = await fetch('/api/meals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mealEntry),
      });

      if (!response.ok) {
        throw new Error('Failed to add recipe to meal');
      }

      toast.success('Recept hozzáadva az étkezéshez!');
      setShowRecipeToMealModal(false);
      setSelectedRecipe(null);
      fetchMeals(); // Refresh meals
    } catch (error) {
      console.error('Error adding recipe to meal:', error);
      toast.error('Hiba történt a recept hozzáadásakor');
    }
  };

  const handleFoodSearch = () => {
    if (!foodSearchQuery.trim()) return;

    setFoodSearchLoading(true);
    
    try {
      // Search through saved recipes
      const query = foodSearchQuery.toLowerCase();
      const filteredRecipes = savedRecipes.filter(recipe => 
        recipe.title.toLowerCase().includes(query) ||
        recipe.tags?.some((tag: string) => tag.toLowerCase().includes(query)) ||
        recipe.ingredients?.some((ing: any) => 
          ing.name?.toLowerCase().includes(query)
        )
      );
      
      setFoodSearchResults(filteredRecipes);
      
      if (filteredRecipes.length === 0) {
        toast.error('Nem találtunk receptet ezzel a névvel');
      } else {
        toast.success(`${filteredRecipes.length} recept találva!`);
      }
    } catch (error) {
      console.error('Recipe search error:', error);
      toast.error('Hiba történt a recept keresésekor');
    } finally {
      setFoodSearchLoading(false);
    }
  };

  const handleSelectFood = (recipe: any) => {
    setSelectedRecipe(recipe);
    setShowRecipeToMealModal(true);
    setFoodSearchResults([]);
    setFoodSearchQuery('');
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

  if (!session) {
    return null;
  }

  const mealsByType = meals.reduce((acc, meal) => {
    if (!acc[meal.mealType]) {
      acc[meal.mealType] = [];
    }
    acc[meal.mealType].push(meal);
    return acc;
  }, {} as Record<string, MealEntry[]>);

  const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack', 'drink'];
  
  const mealTypeTranslations: { [key: string]: string } = {
    breakfast: 'Reggeli',
    lunch: 'Ebéd',
    dinner: 'Vacsora',
    snack: 'Uzsonna',
    drink: 'Ital'
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Étkezések</h1>
            <p className="text-gray-600">Kövesd nyomon a napi táplálkozásod</p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            <button 
              onClick={() => handleOpenMealForm('lunch')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Étkezés hozzáadása
            </button>
          </div>
        </div>

        {/* Recipe Search Section */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recept keresése</h3>
            <p className="text-sm text-gray-600 mt-1">
              Keress a mentett receptjeid között és add hozzá az étkezéseidhez
            </p>
          </div>
          <div className="p-6">
            <div className="flex gap-3">
              <input
                type="text"
                value={foodSearchQuery}
                onChange={(e) => setFoodSearchQuery(e.target.value)}
                placeholder="Keress receptet név alapján..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleFoodSearch())}
              />
              <button
                onClick={handleFoodSearch}
                disabled={foodSearchLoading || !foodSearchQuery.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {foodSearchLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : null}
                {foodSearchLoading ? 'Keresés...' : 'Keresés'}
              </button>
            </div>

            {/* Recipe Search Results */}
            {foodSearchResults.length > 0 && (
              <div className="mt-4 border border-gray-200 rounded-lg max-h-60 overflow-y-auto">
                {foodSearchResults.map((recipe) => (
                  <button
                    key={recipe._id}
                    onClick={() => handleSelectFood(recipe)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                  >
                    <div className="font-medium text-gray-900">{recipe.title}</div>
                    <div className="text-sm text-gray-600">
                      {recipe.caloriesPerServing || 0} kal/adag • {recipe.servings || 1} adag
                      {recipe.prepTime && recipe.cookTime && (
                        <span className="ml-2">• {(recipe.prepTime + recipe.cookTime)} perc</span>
                      )}
                    </div>
                    {recipe.tags && recipe.tags.length > 0 && (
                      <div className="text-xs text-gray-500 mt-1">
                        Címkék: {recipe.tags.slice(0, 3).join(', ')}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Meal Sections */}
        <div className="space-y-6">
          {mealTypes.map((mealType) => (
            <div key={mealType} className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 capitalize flex items-center">
                  <Utensils className="w-5 h-5 mr-2" />
                  {mealTypeTranslations[mealType] || mealType}
                  {mealsByType[mealType] && (
                    <span className="ml-2 text-sm text-gray-500">
                      ({mealsByType[mealType].reduce((sum, meal) => sum + meal.calories, 0)} cal)
                    </span>
                  )}
                </h3>
              </div>
              <div className="p-6">
                {mealsByType[mealType] && mealsByType[mealType].length > 0 ? (
                  <div className="space-y-3">
                    {mealsByType[mealType].map((meal) => (
                      <div key={meal._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{meal.name}</h4>
                          {meal.quantityGrams && (
                            <p className="text-sm text-gray-500">{meal.quantityGrams}g</p>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="font-medium text-gray-900">{meal.calories} cal</p>
                            {meal.createdAt && (
                              <p className="text-xs text-gray-500">
                                <Clock className="w-3 h-3 inline mr-1" />
                                {new Date(meal.createdAt).toLocaleTimeString()}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => handleDeleteMeal(meal._id!)}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Utensils className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Nincs rögzített {mealTypeTranslations[mealType]?.toLowerCase()}</h3>
                    <p className="mt-1 text-sm text-gray-500">Kezdj azzal, hogy hozzáadod az első {mealTypeTranslations[mealType]?.toLowerCase()}ed.</p>
                    <div className="mt-6">
                      <button 
                        onClick={() => handleOpenMealForm(mealType)}
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        {mealTypeTranslations[mealType]} hozzáadása
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Saved Recipes Section */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Plus className="w-5 h-5 mr-2" />
              Mentett receptek
              {savedRecipes.length > 0 && (
                <span className="ml-2 text-sm text-gray-500">
                  ({savedRecipes.length})
                </span>
              )}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Válassz egy mentett receptet és add hozzá az étkezéseidhez
            </p>
          </div>
          <div className="p-6">
            {recipesLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Receptek betöltése...</span>
              </div>
            ) : savedRecipes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {savedRecipes.map((recipe) => (
                  <div key={recipe._id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                    {recipe.imageUrl && (
                      <div className="h-32 bg-gray-200">
                        <img
                          src={recipe.imageUrl}
                          alt={recipe.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="p-4">
                      <h4 className="font-medium text-gray-900 mb-2 line-clamp-2">{recipe.title}</h4>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        <span>{recipe.caloriesPerServing || 0} kal/adag</span>
                        <span>{recipe.servings || 1} adag</span>
                        {recipe.prepTime && recipe.cookTime && (
                          <span>{(recipe.prepTime + recipe.cookTime)} perc</span>
                        )}
                      </div>
                      <button
                        onClick={() => handleSelectRecipe(recipe)}
                        className="w-full px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                      >
                        Hozzáadás étkezéshez
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Plus className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Nincsenek mentett receptek</h3>
                <p className="mt-1 text-sm text-gray-500">Menj a Receptek oldalra és ments el recepteket!</p>
              </div>
            )}
          </div>
        </div>

        {/* Meal Form Modal */}
        <MealForm
          isOpen={showMealForm}
          onClose={() => setShowMealForm(false)}
          onSubmit={handleAddMeal}
          initialMealType={selectedMealType}
          initialDate={selectedDate}
        />

        {/* Recipe to Meal Modal */}
        <RecipeToMealModal
          recipe={selectedRecipe}
          isOpen={showRecipeToMealModal}
          onClose={() => {
            setShowRecipeToMealModal(false);
            setSelectedRecipe(null);
          }}
          onAddToMeal={handleAddRecipeToMeal}
        />

      </div>
    </Layout>
  );
};

export default MealsPage;
