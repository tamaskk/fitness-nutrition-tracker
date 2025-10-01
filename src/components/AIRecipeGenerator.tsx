import React, { useState } from 'react';
import { Sparkles, Send } from 'lucide-react';

interface AIRecipeGeneratorProps {
  onRecipeGenerated: (recipe: any) => void;
  loading?: boolean;
}

const AIRecipeGenerator: React.FC<AIRecipeGeneratorProps> = ({ 
  onRecipeGenerated, 
  loading = false 
}) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    try {
      const response = await fetch('/api/recipes/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: prompt.trim() }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate recipe');
      }

      const recipe = await response.json();
      onRecipeGenerated(recipe);
      setPrompt(''); // Clear the input after successful generation
    } catch (error) {
      console.error('Error generating recipe:', error);
      // You could add toast notification here
    } finally {
      setIsGenerating(false);
    }
  };

  const examplePrompts = [
    "Egészséges csirkesaláta avokádóval",
    "Gyors 15 perces tészta vacsora",
    "Vegetáriánus reggeli tojással",
    "Alacsony szénhidrát tartalmú vacsora lazaccal",
    "Meleg leves hideg időre",
    "Magas fehérjetartalmú smoothie tál"
  ];

  const handleExampleClick = (example: string) => {
    setPrompt(example);
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900">AI Recept Generátor</h3>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Írd le, mit szeretnél főzni, és az AI egyedi receptet készít neked
          </p>
        </div>

        <div className="p-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="recipe-prompt" className="block text-sm font-medium text-gray-700 mb-2">
                Mit szeretnél főzni?
              </label>
              <div className="relative">
                <textarea
                  id="recipe-prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="pl. Egészséges vacsora csirkével és zöldségekkel, ami kevesebb mint 30 perc alatt elkészül..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  disabled={isGenerating}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={!prompt.trim() || isGenerating}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Recept generálása...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Recept generálása
                </>
              )}
            </button>
          </form>

          {/* Example Prompts */}
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Próbáld ki ezeket a példákat:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {examplePrompts.map((example, index) => (
                <button
                  key={index}
                  onClick={() => handleExampleClick(example)}
                  disabled={isGenerating}
                  className="text-left px-3 py-2 text-sm text-gray-600 bg-gray-50 rounded-md hover:bg-gray-100 hover:text-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  "{example}"
                </button>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div className="mt-6 p-3 bg-purple-50 rounded-md">
            <h4 className="text-sm font-medium text-purple-900 mb-2">💡 Tippek jobb receptekhez:</h4>
            <ul className="text-sm text-purple-800 space-y-1">
              <li>• Légy konkrét az elkészítési idővel kapcsolatban</li>
              <li>• Említsd meg az étkezési korlátozásokat vagy preferenciákat</li>
              <li>• Add meg a kívánt konyha stílust vagy íz profilt</li>
              <li>• Határozd meg az adag méretet, ha fontos</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIRecipeGenerator;
