import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface IngredientSelectorProps {
  onIngredientsSelected: (ingredients: string[]) => void;
  loading?: boolean;
}

const IngredientSelector: React.FC<IngredientSelectorProps> = ({ 
  onIngredientsSelected, 
  loading = false 
}) => {
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [expandedSections, setExpandedSections] = useState<string[]>(['meats']);

  // Mapping from Hungarian ingredient names to English for API searches
  const ingredientMapping: { [hungarian: string]: string } = {
    // Húsok
    'Csirkemell': 'Chicken Breast',
    'Csirkecomb': 'Chicken Thighs',
    'Darált csirke': 'Ground Chicken',
    'Egész csirke': 'Whole Chicken',
    'Marhaszelet': 'Beef Steak',
    'Darált marha': 'Ground Beef',
    'Marhapecsenye': 'Beef Roast',
    'Marhaborda': 'Beef Ribs',
    'Sertésszelet': 'Pork Chops',
    'Darált sertés': 'Ground Pork',
    'Sertéskaraj': 'Pork Tenderloin',
    'Szalonna': 'Bacon',
    'Pulykamell': 'Turkey Breast',
    'Darált pulyka': 'Ground Turkey',
    'Bárány': 'Lamb',
    'Halfilé': 'Fish Fillet',
    'Lazac': 'Salmon',
    'Tonhal': 'Tuna',
    'Garnélarák': 'Shrimp',
    'Rák': 'Crab',
    // Zöldségek
    'Hagyma': 'Onion',
    'Fokhagyma': 'Garlic',
    'Paradicsom': 'Tomato',
    'Paprika': 'Bell Pepper',
    'Répa': 'Carrot',
    'Zeller': 'Celery',
    'Brokkoli': 'Broccoli',
    'Karfiol': 'Cauliflower',
    'Spenót': 'Spinach',
    'Saláta': 'Lettuce',
    'Uborka': 'Cucumber',
    'Cukkini': 'Zucchini',
    'Padlizsán': 'Eggplant',
    'Gomba': 'Mushrooms',
    'Burgonya': 'Potato',
    'Édesburgonya': 'Sweet Potato',
    'Kukorica': 'Corn',
    'Zöldbab': 'Green Beans',
    'Borsó': 'Peas',
    'Spárga': 'Asparagus',
    'Káposzta': 'Cabbage',
    'Kelkáposzta': 'Kale',
    // Gyümölcsök
    'Alma': 'Apple',
    'Banán': 'Banana',
    'Narancs': 'Orange',
    'Citrom': 'Lemon',
    'Lime': 'Lime',
    'Eper': 'Strawberry',
    'Áfonya': 'Blueberry',
    'Málna': 'Raspberry',
    'Szeder': 'Blackberry',
    'Szőlő': 'Grape',
    'Ananász': 'Pineapple',
    'Mangó': 'Mango',
    'Avokádó': 'Avocado',
    'Őszibarack': 'Peach',
    'Körte': 'Pear',
    'Cseresznye': 'Cherry',
    'Görögdinnye': 'Watermelon',
    'Sárgadinnye': 'Cantaloupe',
    'Kivi': 'Kiwi',
    'Gránátalma': 'Pomegranate',
    // Kamra
    'Tojás': 'Eggs',
    'Tej': 'Milk',
    'Vaj': 'Butter',
    'Sajt': 'Cheese',
    'Joghurt': 'Yogurt',
    'Tejszín': 'Cream',
    'Kenyér': 'Bread',
    'Rizs': 'Rice',
    'Tészta': 'Pasta',
    'Quinoa': 'Quinoa',
    'Zab': 'Oats',
    'Liszt': 'Flour',
    'Olívaolaj': 'Olive Oil',
    'Kókuszolaj': 'Coconut Oil',
    'Ecet': 'Vinegar',
    'Szójaszósz': 'Soy Sauce',
    'Méz': 'Honey',
    'Só': 'Salt',
    'Fekete bors': 'Black Pepper',
    'Fokhagymapor': 'Garlic Powder',
    'Paprikapor': 'Paprika',
    'Kömény': 'Cumin',
    'Oregánó': 'Oregano',
    'Bazsalikom': 'Basil',
    'Kakukkfű': 'Thyme',
    'Rozmaring': 'Rosemary',
    'Fahéj': 'Cinnamon'
  };

  const ingredientCategories = {
    meats: {
      title: 'Húsok',
      items: [
        { name: 'Csirkemell', emoji: '🐔' },
        { name: 'Csirkecomb', emoji: '🐔' },
        { name: 'Darált csirke', emoji: '🐔' },
        { name: 'Egész csirke', emoji: '🐔' },
        { name: 'Marhaszelet', emoji: '🥩' },
        { name: 'Darált marha', emoji: '🥩' },
        { name: 'Marhapecsenye', emoji: '🥩' },
        { name: 'Marhaborda', emoji: '🥩' },
        { name: 'Sertésszelet', emoji: '🐷' },
        { name: 'Darált sertés', emoji: '🐷' },
        { name: 'Sertéskaraj', emoji: '🐷' },
        { name: 'Szalonna', emoji: '🥓' },
        { name: 'Pulykamell', emoji: '🦃' },
        { name: 'Darált pulyka', emoji: '🦃' },
        { name: 'Bárány', emoji: '🐑' },
        { name: 'Halfilé', emoji: '🐟' },
        { name: 'Lazac', emoji: '🐟' },
        { name: 'Tonhal', emoji: '🐟' },
        { name: 'Garnélarák', emoji: '🦐' },
        { name: 'Rák', emoji: '🦀' }
      ]
    },
    vegetables: {
      title: 'Zöldségek',
      items: [
        { name: 'Hagyma', emoji: '🧅' },
        { name: 'Fokhagyma', emoji: '🧄' },
        { name: 'Paradicsom', emoji: '🍅' },
        { name: 'Paprika', emoji: '🫑' },
        { name: 'Répa', emoji: '🥕' },
        { name: 'Zeller', emoji: '🥬' },
        { name: 'Brokkoli', emoji: '🥦' },
        { name: 'Karfiol', emoji: '🥬' },
        { name: 'Spenót', emoji: '🥬' },
        { name: 'Saláta', emoji: '🥬' },
        { name: 'Uborka', emoji: '🥒' },
        { name: 'Cukkini', emoji: '🥒' },
        { name: 'Padlizsán', emoji: '🍆' },
        { name: 'Gomba', emoji: '🍄' },
        { name: 'Burgonya', emoji: '🥔' },
        { name: 'Édesburgonya', emoji: '🍠' },
        { name: 'Kukorica', emoji: '🌽' },
        { name: 'Zöldbab', emoji: '🫘' },
        { name: 'Borsó', emoji: '🫛' },
        { name: 'Spárga', emoji: '🥬' },
        { name: 'Káposzta', emoji: '🥬' },
        { name: 'Kelkáposzta', emoji: '🥬' }
      ]
    },
    fruits: {
      title: 'Gyümölcsök',
      items: [
        { name: 'Alma', emoji: '🍎' },
        { name: 'Banán', emoji: '🍌' },
        { name: 'Narancs', emoji: '🍊' },
        { name: 'Citrom', emoji: '🍋' },
        { name: 'Lime', emoji: '🍋' },
        { name: 'Eper', emoji: '🍓' },
        { name: 'Áfonya', emoji: '🫐' },
        { name: 'Málna', emoji: '🍇' },
        { name: 'Szeder', emoji: '🍇' },
        { name: 'Szőlő', emoji: '🍇' },
        { name: 'Ananász', emoji: '🍍' },
        { name: 'Mangó', emoji: '🥭' },
        { name: 'Avokádó', emoji: '🥑' },
        { name: 'Őszibarack', emoji: '🍑' },
        { name: 'Körte', emoji: '🍐' },
        { name: 'Cseresznye', emoji: '🍒' },
        { name: 'Görögdinnye', emoji: '🍉' },
        { name: 'Sárgadinnye', emoji: '🍈' },
        { name: 'Kivi', emoji: '🥝' },
        { name: 'Gránátalma', emoji: '🍎' }
      ]
    },
    pantry: {
      title: 'Kamra és egyéb',
      items: [
        { name: 'Tojás', emoji: '🥚' },
        { name: 'Tej', emoji: '🥛' },
        { name: 'Vaj', emoji: '🧈' },
        { name: 'Sajt', emoji: '🧀' },
        { name: 'Joghurt', emoji: '🥛' },
        { name: 'Tejszín', emoji: '🥛' },
        { name: 'Kenyér', emoji: '🍞' },
        { name: 'Rizs', emoji: '🍚' },
        { name: 'Tészta', emoji: '🍝' },
        { name: 'Quinoa', emoji: '🌾' },
        { name: 'Zab', emoji: '🌾' },
        { name: 'Liszt', emoji: '🌾' },
        { name: 'Olívaolaj', emoji: '🫒' },
        { name: 'Kókuszolaj', emoji: '🥥' },
        { name: 'Ecet', emoji: '🍶' },
        { name: 'Szójaszósz', emoji: '🍶' },
        { name: 'Méz', emoji: '🍯' },
        { name: 'Só', emoji: '🧂' },
        { name: 'Fekete bors', emoji: '🌶️' },
        { name: 'Fokhagymapor', emoji: '🧄' },
        { name: 'Paprikapor', emoji: '🌶️' },
        { name: 'Kömény', emoji: '🌿' },
        { name: 'Oregánó', emoji: '🌿' },
        { name: 'Bazsalikom', emoji: '🌿' },
        { name: 'Kakukkfű', emoji: '🌿' },
        { name: 'Rozmaring', emoji: '🌿' },
        { name: 'Fahéj', emoji: '🌿' }
      ]
    }
  };

  const toggleSection = (sectionKey: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionKey) 
        ? prev.filter(key => key !== sectionKey)
        : [...prev, sectionKey]
    );
  };

  const toggleIngredient = (ingredientName: string) => {
    setSelectedIngredients(prev => {
      const newSelection = prev.includes(ingredientName)
        ? prev.filter(item => item !== ingredientName)
        : [...prev, ingredientName];
      
      return newSelection;
    });
  };

  const handleFindRecipes = () => {
    if (selectedIngredients.length > 0) {
      // Convert Hungarian ingredient names to English for API searches
      const englishIngredients = selectedIngredients.map(ingredient => 
        ingredientMapping[ingredient] || ingredient
      );
      onIngredientsSelected(englishIngredients);
    }
  };

  const clearSelection = () => {
    setSelectedIngredients([]);
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Hozzávalók kiválasztása</h3>
          <p className="text-sm text-gray-600 mt-1">
            Válaszd ki az elérhető hozzávalókat receptek kereséséhez
          </p>
        </div>

        <div className="p-4 space-y-3">
          {Object.entries(ingredientCategories).map(([key, category]) => (
            <div key={key} className="border border-gray-200 rounded-lg overflow-hidden">
              {/* Section Header */}
              <button
                onClick={() => toggleSection(key)}
                className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 flex items-center justify-between transition-colors"
              >
                <span className="font-medium text-gray-900">{category.title}</span>
                <div className="flex items-center gap-2">
                  {selectedIngredients.some(ingredient => 
                    category.items.some(item => item.name === ingredient)
                  ) && (
                    <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                      {selectedIngredients.filter(ingredient => 
                        category.items.some(item => item.name === ingredient)
                      ).length}
                    </span>
                  )}
                  {expandedSections.includes(key) ? (
                    <ChevronUp className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  )}
                </div>
              </button>

              {/* Section Content */}
              {expandedSections.includes(key) && (
                <div className="p-4 bg-white">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {category.items.map((item) => (
                      <button
                        key={item.name}
                        onClick={() => toggleIngredient(item.name)}
                        className={`px-3 py-2 text-sm rounded-md border transition-all flex items-center gap-2 ${
                          selectedIngredients.includes(item.name)
                            ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                        }`}
                      >
                        <span>{item.emoji}</span>
                        <span>{item.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Selected Ingredients Summary */}
        {selectedIngredients.length > 0 && (
          <div className="p-4 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900">
                Kiválasztott hozzávalók ({selectedIngredients.length})
              </h4>
              <button
                onClick={clearSelection}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                Összes törlése
              </button>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {selectedIngredients.map((ingredient) => (
                <span
                  key={ingredient}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                >
                  {ingredient}
                  <button
                    onClick={() => toggleIngredient(ingredient)}
                    className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            <button
              onClick={handleFindRecipes}
              disabled={loading || selectedIngredients.length === 0}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Receptek keresése...' : `Receptek keresése ${selectedIngredients.length} hozzávalóval`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default IngredientSelector;
