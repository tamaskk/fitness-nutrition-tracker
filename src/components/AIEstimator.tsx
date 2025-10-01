import React, { useState } from 'react';
import { X, Brain, Loader, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

interface AIEstimatorProps {
  isOpen: boolean;
  onClose: () => void;
  onEstimationComplete: (estimationData: any) => void;
  initialFoodName?: string;
}

const AIEstimator: React.FC<AIEstimatorProps> = ({ 
  isOpen, 
  onClose, 
  onEstimationComplete, 
  initialFoodName = '' 
}) => {
  const [foodName, setFoodName] = useState(initialFoodName);
  const [quantity, setQuantity] = useState<number>(100);
  const [unit, setUnit] = useState('g');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [estimation, setEstimation] = useState<any>(null);

  const handleEstimate = async () => {
    if (!foodName.trim()) {
      toast.error('Please enter a food name');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/openai/estimate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          foodName: foodName.trim(),
          quantity,
          unit,
          description: description.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get nutrition estimation');
      }

      const data = await response.json();

      if (data.success) {
        setEstimation(data.estimation);
        toast.success('Nutrition estimated successfully!');
      } else {
        throw new Error(data.message || 'Estimation failed');
      }
    } catch (error) {
      console.error('AI estimation error:', error);
      toast.error('Failed to estimate nutrition');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToMeal = () => {
    if (!estimation) return;

    const nutrition = estimation.nutrition;
    const totalQuantity = quantity || 100;
    const factor = totalQuantity / 100;

    onEstimationComplete({
      name: `${foodName} (AI estimated)`,
      calories: Math.round((nutrition.totalCalories || nutrition.caloriesPer100g * factor)),
      quantityGrams: totalQuantity,
      protein: Math.round((nutrition.totalProtein || nutrition.proteinPer100g * factor) * 10) / 10,
      carbs: Math.round((nutrition.totalCarbs || nutrition.carbsPer100g * factor) * 10) / 10,
      fat: Math.round((nutrition.totalFat || nutrition.fatPer100g * factor) * 10) / 10,
      source: 'ai_estimation',
      confidence: nutrition.confidence,
    });
    handleClose();
  };

  const handleClose = () => {
    setFoodName(initialFoodName);
    setQuantity(100);
    setUnit('g');
    setDescription('');
    setEstimation(null);
    onClose();
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence > 0.7) return 'text-green-600 bg-green-100';
    if (confidence > 0.5) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={handleClose} />
        
        <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center">
              <Brain className="w-6 h-6 text-purple-600 mr-2" />
              <h2 className="text-xl font-bold text-gray-900">AI Táplálkozási Becslő</h2>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6">
            {/* Input Form */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Étel neve *
                </label>
                <input
                  type="text"
                  value={foodName}
                  onChange={(e) => setFoodName(e.target.value)}
                  placeholder="pl. grillezett csirkemell, házi pizza"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mennyiség
                  </label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Egység
                  </label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="g">gramm</option>
                    <option value="oz">uncia</option>
                    <option value="cup">csésze</option>
                    <option value="piece">darab</option>
                    <option value="serving">adag</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Leírás (opcionális)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="További részletek, mint főzési mód, márka, méret..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <button
                onClick={handleEstimate}
                disabled={loading || !foodName.trim()}
                className="w-full flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
              >
                {loading ? (
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4 mr-2" />
                )}
                {loading ? 'Becslés...' : 'AI Becslés kérése'}
              </button>
            </div>

            {/* Estimation Results */}
            {estimation && (
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Nutrition Estimation</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getConfidenceColor(estimation.nutrition.confidence)}`}>
                    {Math.round(estimation.nutrition.confidence * 100)}% confidence
                  </span>
                </div>

                {/* Nutrition Facts */}
                <div className="bg-white rounded-lg p-4 mb-4">
                  <h4 className="font-medium text-gray-900 mb-3">
                    {estimation.foodName} ({estimation.quantity} {estimation.unit})
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">
                        {estimation.nutrition.totalCalories || Math.round(estimation.nutrition.caloriesPer100g * (quantity / 100))}
                      </p>
                      <p className="text-sm text-gray-600">Calories</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Protein:</span>
                        <span className="text-sm font-medium">
                          {estimation.nutrition.totalProtein || Math.round(estimation.nutrition.proteinPer100g * (quantity / 100) * 10) / 10}g
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Carbs:</span>
                        <span className="text-sm font-medium">
                          {estimation.nutrition.totalCarbs || Math.round(estimation.nutrition.carbsPer100g * (quantity / 100) * 10) / 10}g
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Fat:</span>
                        <span className="text-sm font-medium">
                          {estimation.nutrition.totalFat || Math.round(estimation.nutrition.fatPer100g * (quantity / 100) * 10) / 10}g
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Per 100g Breakdown */}
                <div className="bg-white rounded-lg p-4 mb-4">
                  <h5 className="font-medium text-gray-900 mb-2">Per 100g:</h5>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div className="flex justify-between">
                      <span>Calories:</span>
                      <span>{estimation.nutrition.caloriesPer100g}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Protein:</span>
                      <span>{estimation.nutrition.proteinPer100g}g</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Carbs:</span>
                      <span>{estimation.nutrition.carbsPer100g}g</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Fat:</span>
                      <span>{estimation.nutrition.fatPer100g}g</span>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {estimation.notes && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                    <p className="text-sm text-yellow-800">{estimation.notes}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <button
                    onClick={handleAddToMeal}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Add to Meal
                  </button>
                  <button
                    onClick={() => setEstimation(null)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                  >
                    New Estimation
                  </button>
                </div>
              </div>
            )}

            {/* AI Disclaimer */}
            <div className="mt-6 text-xs text-gray-500 text-center">
              <p>AI estimations are approximate. For precise nutrition tracking, use verified food databases or nutrition labels.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIEstimator;

