import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Save, Edit3 } from 'lucide-react';
import toast from 'react-hot-toast';

interface RecipeEditorProps {
  recipe?: any; // Existing recipe to edit (optional)
  isOpen: boolean;
  onClose: () => void;
  onSave: (recipe: any) => void;
}

const RecipeEditor: React.FC<RecipeEditorProps> = ({
  recipe,
  isOpen,
  onClose,
  onSave
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [servings, setServings] = useState(4);
  const [prepTime, setPrepTime] = useState(15);
  const [cookTime, setCookTime] = useState(30);
  const [difficulty, setDifficulty] = useState('Könnyű');
  const [cuisine, setCuisine] = useState('');
  const [category, setCategory] = useState('dinner');
  const [ingredients, setIngredients] = useState<{name: string; quantity: string; notes: string}[]>([
    { name: '', quantity: '', notes: '' }
  ]);
  const [instructions, setInstructions] = useState<string[]>(['']);
  const [tips, setTips] = useState<string[]>(['']);
  const [tags, setTags] = useState<string[]>(['']);
  const [caloriesPerServing, setCaloriesPerServing] = useState(0);

  // Load recipe data when editing
  useEffect(() => {
    if (recipe && isOpen) {
      const isRecipeModel = 'title' in recipe;
      setTitle(isRecipeModel ? recipe.title : recipe.label);
      setDescription(recipe.description || '');
      setServings(isRecipeModel ? recipe.servings : recipe.yield || 4);
      setPrepTime(recipe.prepTime || 15);
      setCookTime(recipe.cookTime || 30);
      setDifficulty(recipe.difficulty || 'Könnyű');
      setCuisine(recipe.cuisine || '');
      setCategory(recipe.category || 'dinner');
      setCaloriesPerServing(isRecipeModel ? recipe.caloriesPerServing : Math.round(recipe.calories || 0));
      
      // Load ingredients
      if (recipe.ingredients) {
        if (isRecipeModel) {
          setIngredients(recipe.ingredients.map((ing: any) => ({
            name: ing.name || '',
            quantity: ing.quantity || '',
            notes: ing.notes || ''
          })));
        } else {
          setIngredients(recipe.ingredients.map((ing: any) => ({
            name: ing.food || ing.text || '',
            quantity: ing.measure || '',
            notes: ''
          })));
        }
      }
      
      // Load instructions
      if (recipe.instructions) {
        setInstructions(recipe.instructions);
      } else if (recipe.steps) {
        setInstructions(recipe.steps);
      }
      
      // Load tips and tags
      setTips(recipe.tips || ['']);
      setTags(recipe.tags || ['']);
    } else if (isOpen && !recipe) {
      // Reset for new recipe
      resetForm();
    }
  }, [recipe, isOpen]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setServings(4);
    setPrepTime(15);
    setCookTime(30);
    setDifficulty('Könnyű');
    setCuisine('');
    setCategory('dinner');
    setIngredients([{ name: '', quantity: '', notes: '' }]);
    setInstructions(['']);
    setTips(['']);
    setTags(['']);
    setCaloriesPerServing(0);
  };

  const addIngredient = () => {
    setIngredients([...ingredients, { name: '', quantity: '', notes: '' }]);
  };

  const removeIngredient = (index: number) => {
    if (ingredients.length > 1) {
      setIngredients(ingredients.filter((_, i) => i !== index));
    }
  };

  const updateIngredient = (index: number, field: string, value: string) => {
    const updated = [...ingredients];
    updated[index] = { ...updated[index], [field]: value };
    setIngredients(updated);
  };

  const addInstruction = () => {
    setInstructions([...instructions, '']);
  };

  const removeInstruction = (index: number) => {
    if (instructions.length > 1) {
      setInstructions(instructions.filter((_, i) => i !== index));
    }
  };

  const updateInstruction = (index: number, value: string) => {
    const updated = [...instructions];
    updated[index] = value;
    setInstructions(updated);
  };

  const addTip = () => {
    setTips([...tips, '']);
  };

  const removeTip = (index: number) => {
    setTips(tips.filter((_, i) => i !== index));
  };

  const updateTip = (index: number, value: string) => {
    const updated = [...tips];
    updated[index] = value;
    setTips(updated);
  };

  const addTag = () => {
    setTags([...tags, '']);
  };

  const removeTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  const updateTag = (index: number, value: string) => {
    const updated = [...tags];
    updated[index] = value;
    setTags(updated);
  };

  const handleSave = () => {
    if (!title.trim()) {
      toast.error('A recept neve kötelező!');
      return;
    }

    if (ingredients.filter(ing => ing.name.trim()).length === 0) {
      toast.error('Legalább egy hozzávaló szükséges!');
      return;
    }

    if (instructions.filter(inst => inst.trim()).length === 0) {
      toast.error('Legalább egy elkészítési lépés szükséges!');
      return;
    }

    const recipeData = {
      title: title.trim(),
      description: description.trim(),
      servings,
      prepTime,
      cookTime,
      difficulty,
      cuisine: cuisine.trim(),
      category,
      ingredients: ingredients.filter(ing => ing.name.trim()),
      steps: instructions.filter(inst => inst.trim()), // API expects 'steps' not 'instructions'
      tips: tips.filter(tip => tip.trim()),
      tags: tags.filter(tag => tag.trim()),
      caloriesPerServing,
      totalTime: prepTime + cookTime,
      imageUrl: recipe?.imageUrl || recipe?.image || null,
    };

    onSave(recipeData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={onClose} />
        
        <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-screen overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center gap-2">
              <Edit3 className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">
                {recipe ? 'Recept szerkesztése' : 'Új recept létrehozása'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Basic Info */}
              <div className="space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Recept neve *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="pl. Grillezett csirkemell"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Leírás
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Rövid leírás a receptről..."
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Basic Info Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Adagok
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={servings}
                      onChange={(e) => setServings(parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Kalóriák/adag
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={caloriesPerServing}
                      onChange={(e) => setCaloriesPerServing(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Time Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Előkészítési idő (perc)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={prepTime}
                      onChange={(e) => setPrepTime(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Főzési idő (perc)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={cookTime}
                      onChange={(e) => setCookTime(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Difficulty and Type */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nehézség
                    </label>
                    <select
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Könnyű">Könnyű</option>
                      <option value="Közepes">Közepes</option>
                      <option value="Nehéz">Nehéz</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Kategória
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="breakfast">Reggeli</option>
                      <option value="lunch">Ebéd</option>
                      <option value="dinner">Vacsora</option>
                      <option value="snack">Uzsonna</option>
                      <option value="dessert">Desszert</option>
                      <option value="drink">Ital</option>
                    </select>
                  </div>
                </div>

                {/* Cuisine */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Konyha típusa
                  </label>
                  <input
                    type="text"
                    value={cuisine}
                    onChange={(e) => setCuisine(e.target.value)}
                    placeholder="pl. Magyar, Olasz, Ázsiai"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Right Column - Ingredients and Instructions */}
              <div className="space-y-6">
                {/* Ingredients */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Hozzávalók *
                    </label>
                    <button
                      type="button"
                      onClick={addIngredient}
                      className="flex items-center gap-1 px-2 py-1 text-sm text-blue-600 hover:text-blue-700"
                    >
                      <Plus className="w-4 h-4" />
                      Hozzávaló hozzáadása
                    </button>
                  </div>
                  <div className="space-y-2">
                    {ingredients.map((ingredient, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={ingredient.quantity}
                          onChange={(e) => updateIngredient(index, 'quantity', e.target.value)}
                          placeholder="Mennyiség"
                          className="w-24 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <input
                          type="text"
                          value={ingredient.name}
                          onChange={(e) => updateIngredient(index, 'name', e.target.value)}
                          placeholder="Hozzávaló neve"
                          className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <input
                          type="text"
                          value={ingredient.notes}
                          onChange={(e) => updateIngredient(index, 'notes', e.target.value)}
                          placeholder="Megjegyzés"
                          className="w-24 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <button
                          type="button"
                          onClick={() => removeIngredient(index)}
                          className="p-1 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Instructions */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Elkészítési lépések *
                    </label>
                    <button
                      type="button"
                      onClick={addInstruction}
                      className="flex items-center gap-1 px-2 py-1 text-sm text-blue-600 hover:text-blue-700"
                    >
                      <Plus className="w-4 h-4" />
                      Lépés hozzáadása
                    </button>
                  </div>
                  <div className="space-y-2">
                    {instructions.map((instruction, index) => (
                      <div key={index} className="flex gap-2">
                        <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center font-medium mt-1">
                          {index + 1}
                        </span>
                        <textarea
                          value={instruction}
                          onChange={(e) => updateInstruction(index, e.target.value)}
                          placeholder={`${index + 1}. lépés leírása...`}
                          rows={2}
                          className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <button
                          type="button"
                          onClick={() => removeInstruction(index)}
                          className="p-1 text-red-500 hover:text-red-700 mt-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tips */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Tippek
                    </label>
                    <button
                      type="button"
                      onClick={addTip}
                      className="flex items-center gap-1 px-2 py-1 text-sm text-blue-600 hover:text-blue-700"
                    >
                      <Plus className="w-4 h-4" />
                      Tipp hozzáadása
                    </button>
                  </div>
                  <div className="space-y-2">
                    {tips.map((tip, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={tip}
                          onChange={(e) => updateTip(index, e.target.value)}
                          placeholder="Hasznos tipp..."
                          className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <button
                          type="button"
                          onClick={() => removeTip(index)}
                          className="p-1 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Címkék
                    </label>
                    <button
                      type="button"
                      onClick={addTag}
                      className="flex items-center gap-1 px-2 py-1 text-sm text-blue-600 hover:text-blue-700"
                    >
                      <Plus className="w-4 h-4" />
                      Címke hozzáadása
                    </button>
                  </div>
                  <div className="space-y-2">
                    {tags.map((tag, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={tag}
                          onChange={(e) => updateTag(index, e.target.value)}
                          placeholder="pl. egészséges, gyors, vegetáriánus"
                          className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <button
                          type="button"
                          onClick={() => removeTag(index)}
                          className="p-1 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="mt-8 pt-6 border-t">
              <div className="flex gap-4">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Mégse
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {recipe ? 'Módosítások mentése' : 'Recept mentése'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeEditor;
