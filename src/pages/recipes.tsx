import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useLanguage } from '@/contexts/LanguageContext';
import Layout from '@/components/Layout';
import RecipeSearch from '@/components/RecipeSearch';
import RecipeCard from '@/components/RecipeCard';
import RecipeModal from '@/components/RecipeModal';
import { Recipe } from '@/types';
import { Book, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

const RecipesPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t } = useLanguage();
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'search' | 'saved'>('search');

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/login');
      return;
    }

    // Load saved recipes if on saved tab, or random recipes on search tab
    if (activeTab === 'saved') {
      loadSavedRecipes();
    } else if (activeTab === 'search' && recipes.length === 0) {
      loadRandomRecipes();
    }
  }, [session, status, router, activeTab]);

  const loadSavedRecipes = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/recipes');
      if (response.ok) {
        const data = await response.json();
        setRecipes(data);
      }
    } catch (error) {
      console.error('Error loading saved recipes:', error);
      toast.error('Failed to load saved recipes');
    } finally {
      setLoading(false);
    }
  };

  const loadRandomRecipes = async () => {
    setLoading(true);
    try {
      const { searchRecipes, getMockRecipes } = await import('@/utils/recipeApi');
      
      // Try searching for common terms to get variety
      const searchTerms = ['chicken', 'pasta', 'salad', 'soup', 'beef'];
      const randomTerm = searchTerms[Math.floor(Math.random() * searchTerms.length)];
      
      let randomRecipes = await searchRecipes(randomTerm);
      
      // If API fails, use mock recipes
      if (randomRecipes.length === 0) {
        randomRecipes = getMockRecipes('').slice(0, 8);
      }
      
      setRecipes(randomRecipes.slice(0, 8));
    } catch (error) {
      console.error('Error loading random recipes:', error);
      // Fallback to mock recipes
      const { getMockRecipes } = await import('@/utils/recipeApi');
      setRecipes(getMockRecipes('').slice(0, 8));
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (searchParams: any) => {
    setLoading(true);
    try {
      // Import the recipe search function dynamically to avoid SSR issues
      const { searchRecipes, getMockRecipes } = await import('@/utils/recipeApi');
      
      let results = await searchRecipes(searchParams.query, searchParams.mealType);
      
      // If no results from API, use mock recipes
      if (results.length === 0) {
        results = getMockRecipes(searchParams.query);
      }
      
      setRecipes(results);
      
      if (results.length > 0) {
        toast.success(`Found ${results.length} recipes!`);
      } else {
        toast('No recipes found for your search', { icon: 'ℹ️' });
      }
    } catch (error) {
      console.error('Recipe search error:', error);
      toast.error('Failed to search recipes');
      
      // Fallback to mock recipes on error
      const { getMockRecipes } = await import('@/utils/recipeApi');
      setRecipes(getMockRecipes(searchParams.query || ''));
    } finally {
      setLoading(false);
    }
  };

  const handleViewRecipe = (recipe: any) => {
    setSelectedRecipe(recipe);
    setShowModal(true);
  };

  const handleAddToMeal = async (mealData: any) => {
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

      toast.success('Recipe added to meals!');
    } catch (error) {
      console.error('Error adding meal:', error);
      toast.error('Failed to add recipe to meals');
    }
  };


  const handleSaveRecipe = async (recipe: any) => {
    try {
      const isRecipeModel = 'title' in recipe;
      
      const recipeData = {
        title: isRecipeModel ? recipe.title : recipe.label,
        ingredients: isRecipeModel ? recipe.ingredients : recipe.ingredients.map((ing: any) => ({
          name: ing.text,
          quantity: ing.measure,
          grams: ing.weight,
        })),
        caloriesPerServing: isRecipeModel ? recipe.caloriesPerServing : Math.round(recipe.calories),
        servings: isRecipeModel ? recipe.servings : recipe.yield,
        tags: isRecipeModel ? recipe.tags : [...(recipe.cuisineType || []), ...(recipe.mealType || [])],
        imageUrl: isRecipeModel ? recipe.imageUrl : recipe.image,
        prepTime: isRecipeModel ? recipe.prepTime : Math.round(recipe.totalTime / 2),
        cookTime: isRecipeModel ? recipe.cookTime : Math.round(recipe.totalTime / 2),
      };

      const response = await fetch('/api/recipes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(recipeData),
      });

      if (!response.ok) {
        throw new Error('Failed to save recipe');
      }

      toast.success('Recipe saved!');
    } catch (error) {
      console.error('Error saving recipe:', error);
      toast.error('Failed to save recipe');
    }
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

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('Recipes')}</h1>
            <p className="text-gray-600">{t('Discover and save delicious recipes')}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('search')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'search'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {t('Search Recipes')}
            </button>
            <button
              onClick={() => setActiveTab('saved')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'saved'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {t('Saved Recipes')}
            </button>
          </nav>
        </div>

        {/* Search Tab */}
        {activeTab === 'search' && (
          <div className="space-y-6">
            <RecipeSearch onSearch={handleSearch} loading={loading} />
            
            {recipes.length === 0 && !loading && (
              <div className="text-center py-12">
                <Book className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">Discover Recipes</h3>
                <p className="mt-2 text-gray-600">Search for recipes above or browse random suggestions!</p>
                <div className="mt-6">
                  <button 
                    onClick={loadRandomRecipes}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Load Random Recipes
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Saved Tab */}
        {activeTab === 'saved' && recipes.length === 0 && !loading && (
          <div className="text-center py-12">
            <Book className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No saved recipes</h3>
            <p className="mt-2 text-gray-600">Search and save recipes to see them here!</p>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Recipe Grid */}
        {recipes.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {recipes.map((recipe, index) => (
              <RecipeCard
                key={recipe.uri || recipe._id || index}
                recipe={recipe}
                onViewDetails={handleViewRecipe}
                onAddToMeal={() => {
                  setSelectedRecipe(recipe);
                  setShowModal(true);
                }}
              />
            ))}
          </div>
        )}

        {/* Recipe Modal */}
        <RecipeModal
          recipe={selectedRecipe}
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setSelectedRecipe(null);
          }}
          onAddToMeal={handleAddToMeal}
        />
      </div>
    </Layout>
  );
};

export default RecipesPage;
