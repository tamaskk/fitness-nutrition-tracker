import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import IngredientSelector from '@/components/IngredientSelector';
import AIRecipeGenerator from '@/components/AIRecipeGenerator';
import RecipeCard from '@/components/RecipeCard';
import RecipeModal from '@/components/RecipeModal';
import RecipeEditor from '@/components/RecipeEditor';
import { Recipe } from '@/types';
import { Book, Plus, ChefHat, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

const RecipesPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'ingredients' | 'ai' | 'saved'>('ingredients');
  const [ingredientLoading, setIngredientLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [showRecipeEditor, setShowRecipeEditor] = useState(false);
  const [recipeToEdit, setRecipeToEdit] = useState<any>(null);
  const [titleFilter, setTitleFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortBy, setSortBy] = useState<'title' | 'category' | 'date'>('date');

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/login');
      return;
    }

    // Clear recipes when switching tabs and load saved recipes if on saved tab
    if (activeTab === 'saved') {
      loadSavedRecipes();
    } else {
      // Clear recipes when switching away from saved tab
      setRecipes([]);
      setTitleFilter(''); // Clear filter when switching away from saved tab
      setCategoryFilter(''); // Clear category filter when switching away from saved tab
      setSortBy('date'); // Reset sort when switching away from saved tab
    }
  }, [session, status, router, activeTab]);

  const loadSavedRecipes = async () => {
    setLoading(true);
    try {
      console.log('Loading saved recipes...');
      const response = await fetch('/api/recipes');
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Loaded recipes:', data);
        setRecipes(data);
      } else {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        toast.error('Failed to load saved recipes');
      }
    } catch (error) {
      console.error('Error loading saved recipes:', error);
      toast.error('Failed to load saved recipes');
    } finally {
      setLoading(false);
    }
  };

  const handleIngredientsSelected = async (ingredients: string[]) => {
    setIngredientLoading(true);
    try {
      // Search for recipes using the selected ingredients
      const { searchRecipesByIngredient, getMockRecipes } = await import('@/utils/recipeApi');
      
      let recipesByIngredient: { [key: string]: any[] } = {};
      
      // Search for recipes with each ingredient separately
      for (const ingredient of ingredients.slice(0, 5)) { // Increase to 5 ingredients for more variety
        try {
          const ingredientRecipes = await searchRecipesByIngredient(ingredient);
          recipesByIngredient[ingredient] = ingredientRecipes;
        } catch (error) {
          console.error(`Error searching for ${ingredient}:`, error);
          recipesByIngredient[ingredient] = [];
        }
      }
      
      // Find recipes that contain ALL selected ingredients
      let recipesWithAllIngredients: any[] = [];
      
      if (ingredients.length === 1) {
        // If only one ingredient, just use those recipes
        recipesWithAllIngredients = recipesByIngredient[ingredients[0]] || [];
      } else {
        // Find intersection of all ingredient recipe lists
        const firstIngredient = ingredients[0];
        const firstRecipes = recipesByIngredient[firstIngredient] || [];
        
        recipesWithAllIngredients = firstRecipes.filter(recipe => {
          // Check if this recipe contains all other ingredients
          return ingredients.slice(1).every(ingredient => {
            const ingredientRecipes = recipesByIngredient[ingredient] || [];
            return ingredientRecipes.some(r => r.uri === recipe.uri);
          });
        });
        
        // If no recipes contain all ingredients, fall back to recipes with most ingredients
        if (recipesWithAllIngredients.length === 0) {
          // Count how many ingredients each recipe contains
          const allRecipes = Object.values(recipesByIngredient).flat();
          const recipeScores: { [uri: string]: { recipe: any, score: number } } = {};
          
          allRecipes.forEach(recipe => {
            if (!recipeScores[recipe.uri]) {
              recipeScores[recipe.uri] = { recipe, score: 0 };
            }
            recipeScores[recipe.uri].score++;
          });
          
          // Sort by score (most ingredients first) and take top recipes
          recipesWithAllIngredients = Object.values(recipeScores)
            .sort((a, b) => b.score - a.score)
            .slice(0, 24) // Increase to 24 recipes for more variety
            .map(item => item.recipe);
        }
      }
      
      // If no results from API, use mock recipes
      if (recipesWithAllIngredients.length === 0) {
        const mockRecipes = getMockRecipes(ingredients.join(' '));
        setRecipes(mockRecipes.slice(0, 8));
        toast('No recipes found with those ingredients, showing similar recipes', { icon: 'ℹ️' });
      } else {
        setRecipes(recipesWithAllIngredients.slice(0, 24)); // Show more recipes
        if (ingredients.length > 1) {
          const perfectMatches = recipesWithAllIngredients.filter(recipe => {
            // Check if recipe actually contains all ingredients in its ingredient list
            const recipeIngredients = recipe.ingredients || [];
            return ingredients.every(ingredient => 
              recipeIngredients.some((recipeIng: any) => {
                const ingText = (recipeIng.text || recipeIng.name || '').toLowerCase();
                return ingText.includes(ingredient.toLowerCase());
              })
            );
          });
          
          if (perfectMatches.length > 0) {
            toast.success(`Found ${perfectMatches.length} recipes containing all your ingredients!`);
          } else {
            toast.success(`Found ${recipesWithAllIngredients.length} recipes with some of your ingredients!`);
          }
        } else {
          toast.success(`Found ${recipesWithAllIngredients.length} recipes with ${ingredients[0]}!`);
        }
      }
    } catch (error) {
      console.error('Error searching recipes by ingredients:', error);
      toast.error('Failed to search recipes');
      
      // Fallback to mock recipes
      const { getMockRecipes } = await import('@/utils/recipeApi');
      setRecipes(getMockRecipes(ingredients[0] || ''));
    } finally {
      setIngredientLoading(false);
    }
  };

  const handleAIRecipeGenerated = async (recipe: any) => {
    setAiLoading(true);
    try {
      // Add the AI-generated recipe to the recipes list
      setRecipes([recipe]);
      toast.success('AI recept generálás sikeres!');
    } catch (error) {
      console.error('Error handling AI recipe:', error);
      toast.error('Failed to process AI recipe');
    } finally {
      setAiLoading(false);
    }
  };

  const handleViewRecipe = (recipe: any) => {
    setSelectedRecipe(recipe);
    setShowModal(true);
  };

  const handleCreateNewRecipe = () => {
    setRecipeToEdit(null);
    setShowRecipeEditor(true);
  };

  const handleSaveRecipeFromEditor = async (recipeData: any) => {
    try {
      console.log('Saving recipe data:', recipeData);
      
      const isEdit = recipeToEdit && recipeToEdit._id;
      const url = isEdit ? `/api/recipes?id=${recipeToEdit._id}` : '/api/recipes';
      const method = isEdit ? 'PUT' : 'POST';
      
      console.log('Request:', { url, method, isEdit });
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(recipeData),
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        throw new Error(`Failed to save recipe: ${errorData.message || 'Unknown error'}`);
      }

      const savedRecipe = await response.json();
      console.log('Saved recipe:', savedRecipe);

      toast.success(isEdit ? 'Recept módosítva!' : 'Új recept mentve!');
      setShowRecipeEditor(false);
      setRecipeToEdit(null);
      
      // Refresh saved recipes if on saved tab
      if (activeTab === 'saved') {
        loadSavedRecipes();
      }
    } catch (error) {
      console.error('Error saving recipe:', error);
      toast.error(`Hiba történt a recept mentésekor: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleMigrateRecipes = async () => {
    try {
      console.log('Migrating recipes...');
      const response = await fetch('/api/recipes/migrate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to migrate recipes');
      }

      const result = await response.json();
      console.log('Migration result:', result);
      
      toast.success(`${result.modifiedCount} recept frissítve!`);
      
      // Refresh saved recipes
      if (activeTab === 'saved') {
        loadSavedRecipes();
      }
    } catch (error) {
      console.error('Error migrating recipes:', error);
      toast.error('Hiba történt a receptek migrálásakor');
    }
  };

  const handleDeleteRecipe = async (recipe: any) => {
    if (!recipe._id) {
      toast.error('Recept ID hiányzik');
      return;
    }

    if (!confirm(`Biztosan törölni szeretnéd a "${recipe.title}" receptet?`)) {
      return;
    }

    try {
      console.log('Deleting recipe:', recipe._id);
      const response = await fetch(`/api/recipes?id=${recipe._id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete recipe');
      }

      toast.success('Recept törölve!');
      
      // Refresh saved recipes
      if (activeTab === 'saved') {
        loadSavedRecipes();
      }
    } catch (error) {
      console.error('Error deleting recipe:', error);
      toast.error(`Hiba történt a recept törlésekor: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleEditRecipe = (recipe: any) => {
    setRecipeToEdit(recipe);
    setShowRecipeEditor(true);
  };

  // Filter and sort recipes
  const filteredAndSortedRecipes = recipes
    .filter(recipe => {
      const isRecipeModel = 'title' in recipe;
      
      // Title filter
      if (titleFilter.trim()) {
        const title = isRecipeModel ? recipe.title : recipe.label;
        if (!title.toLowerCase().includes(titleFilter.toLowerCase())) {
          return false;
        }
      }
      
      // Category filter
      if (categoryFilter) {
        const category = isRecipeModel ? recipe.category : null;
        if (category !== categoryFilter) {
          return false;
        }
      }
      
      return true;
    })
    .sort((a, b) => {
      const isAModel = 'title' in a;
      const isBModel = 'title' in b;
      
      switch (sortBy) {
        case 'title':
          const titleA = isAModel ? a.title : a.label;
          const titleB = isBModel ? b.title : b.label;
          return titleA.localeCompare(titleB, 'hu');
          
        case 'category':
          const categoryA = isAModel ? a.category || 'zzz' : 'zzz'; // Put recipes without category at end
          const categoryB = isBModel ? b.category || 'zzz' : 'zzz';
          if (categoryA === categoryB) {
            // If same category, sort by title
            const titleA = isAModel ? a.title : a.label;
            const titleB = isBModel ? b.title : b.label;
            return titleA.localeCompare(titleB, 'hu');
          }
          return categoryA.localeCompare(categoryB);
          
        case 'date':
        default:
          // Sort by creation date (newest first)
          const dateA = isAModel ? new Date(a.createdAt || 0) : new Date(0);
          const dateB = isBModel ? new Date(b.createdAt || 0) : new Date(0);
          return dateB.getTime() - dateA.getTime();
      }
    });

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
      console.log('Saving recipe:', recipe);
      const isRecipeModel = 'title' in recipe;
      
      const recipeData = {
        userId: session?.user?.id, // Add userId from session
        title: isRecipeModel ? recipe.title : recipe.label,
        ingredients: isRecipeModel ? recipe.ingredients : recipe.ingredients.map((ing: any) => ({
          name: ing.text,
          quantity: ing.measure,
          grams: ing.weight,
        })),
        steps: isRecipeModel ? recipe.steps : [], // Add steps field for API compatibility
        caloriesPerServing: isRecipeModel ? recipe.caloriesPerServing : Math.round(recipe.calories),
        servings: isRecipeModel ? recipe.servings : recipe.yield,
        tags: isRecipeModel ? recipe.tags : [...(recipe.cuisineType || []), ...(recipe.mealType || [])],
        imageUrl: isRecipeModel ? recipe.imageUrl : recipe.image,
        prepTime: isRecipeModel ? recipe.prepTime : Math.round(recipe.totalTime / 2),
        cookTime: isRecipeModel ? recipe.cookTime : Math.round(recipe.totalTime / 2),
      };

      console.log('Recipe data to save:', recipeData);

      const response = await fetch('/api/recipes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(recipeData),
      });

      console.log('Save response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Save error:', errorData);
        throw new Error(`Failed to save recipe: ${errorData.message || 'Unknown error'}`);
      }

      const savedRecipe = await response.json();
      console.log('Recipe saved successfully:', savedRecipe);

      toast.success('Recept mentve!');
      
      // Refresh saved recipes if on saved tab
      if (activeTab === 'saved') {
        loadSavedRecipes();
      }
    } catch (error) {
      console.error('Error saving recipe:', error);
      toast.error(`Hiba történt a recept mentésekor: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
            <h1 className="text-2xl font-bold text-gray-900">Receptek</h1>
            <p className="text-gray-600">Fedezz fel és ments el finom recepteket</p>
          </div>
          {activeTab === 'saved' && (
            <div className="mt-4 sm:mt-0 flex gap-2">
              <button
                onClick={handleCreateNewRecipe}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Új recept létrehozása
              </button>
              <button
                onClick={handleMigrateRecipes}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700"
              >
                Receptek migrálása
              </button>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('ingredients')}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === 'ingredients'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <ChefHat className="w-4 h-4" />
              Hozzávalók alapján
            </button>
            <button
              onClick={() => setActiveTab('ai')}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === 'ai'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              AI Generátor
            </button>
            <button
              onClick={() => setActiveTab('saved')}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === 'saved'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Book className="w-4 h-4" />
              Mentett receptek
            </button>
          </nav>
        </div>

        {/* Ingredients Tab */}
        {activeTab === 'ingredients' && (
          <div className="space-y-6">
            <IngredientSelector 
              onIngredientsSelected={handleIngredientsSelected} 
              loading={ingredientLoading} 
            />
            
            {recipes.length === 0 && !ingredientLoading && (
              <div className="text-center py-12">
                <ChefHat className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">Válaszd ki a hozzávalókat</h3>
                <p className="mt-2 text-gray-600">Válassz hozzávalókat a fenti kategóriákból, hogy recepteket találj!</p>
              </div>
            )}
          </div>
        )}

        {/* AI Generator Tab */}
        {activeTab === 'ai' && (
          <div className="space-y-6">
            <AIRecipeGenerator 
              onRecipeGenerated={handleAIRecipeGenerated} 
              loading={aiLoading} 
            />
            
            {recipes.length === 0 && !aiLoading && (
              <div className="text-center py-12">
                <Sparkles className="mx-auto h-12 w-12 text-purple-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">Egyedi receptek generálása</h3>
                <p className="mt-2 text-gray-600">Írd le, mit szeretnél főzni, és az AI személyre szabott receptet készít neked!</p>
              </div>
            )}
          </div>
        )}

        {/* Saved Tab */}
        {activeTab === 'saved' && recipes.length === 0 && !loading && (
          <div className="text-center py-12">
            <Book className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">Nincsenek mentett receptek</h3>
            <p className="mt-2 text-gray-600">Keress és ments recepteket, hogy itt lásd őket!</p>
          </div>
        )}

        {/* Loading */}
        {(loading || ingredientLoading || aiLoading) && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">
              {ingredientLoading && 'Receptek keresése a hozzávalóiddal...'}
              {aiLoading && 'Egyedi recept generálása...'}
              {loading && 'Receptek betöltése...'}
            </span>
          </div>
        )}

        {/* Filters and Sorting - Only show for saved recipes */}
        {activeTab === 'saved' && recipes.length > 0 && (
          <div className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl">
              <div>
                <label htmlFor="titleFilter" className="block text-sm font-medium text-gray-700 mb-2">
                  Receptek szűrése név alapján
                </label>
                <input
                  id="titleFilter"
                  type="text"
                  value={titleFilter}
                  onChange={(e) => setTitleFilter(e.target.value)}
                  placeholder="Keresés recept neve alapján..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="categoryFilter" className="block text-sm font-medium text-gray-700 mb-2">
                  Kategória szerinti szűrés
                </label>
                <select
                  id="categoryFilter"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Összes kategória</option>
                  <option value="breakfast">Reggeli</option>
                  <option value="lunch">Ebéd</option>
                  <option value="dinner">Vacsora</option>
                  <option value="snack">Uzsonna</option>
                  <option value="dessert">Desszert</option>
                  <option value="drink">Ital</option>
                </select>
              </div>
              <div>
                <label htmlFor="sortBy" className="block text-sm font-medium text-gray-700 mb-2">
                  Rendezés
                </label>
                <select
                  id="sortBy"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'title' | 'category' | 'date')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="date">Legújabb először</option>
                  <option value="title">Név szerint</option>
                  <option value="category">Kategória szerint</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Recipe Grid */}
        {filteredAndSortedRecipes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredAndSortedRecipes.map((recipe, index) => (
              <RecipeCard
                key={recipe.uri || recipe._id || index}
                recipe={recipe}
                onViewDetails={handleViewRecipe}
                onSaveRecipe={handleSaveRecipe}
                onEditRecipe={handleEditRecipe}
                onDeleteRecipe={handleDeleteRecipe}
                showEditDeleteButtons={activeTab === 'saved'}
                onAddToMeal={() => {
                  setSelectedRecipe(recipe);
                  setShowModal(true);
                }}
              />
            ))}
          </div>
        ) : recipes.length > 0 && (titleFilter.trim() || categoryFilter) ? (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg mb-2">
              Nincs találat a keresési feltételeknek
            </div>
            <div className="text-gray-400 text-sm">
              Próbálj másik keresési kifejezést
            </div>
          </div>
        ) : null}

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

        {/* Recipe Editor Modal */}
        <RecipeEditor
          recipe={recipeToEdit}
          isOpen={showRecipeEditor}
          onClose={() => {
            setShowRecipeEditor(false);
            setRecipeToEdit(null);
          }}
          onSave={handleSaveRecipeFromEditor}
        />
      </div>
    </Layout>
  );
};

export default RecipesPage;
