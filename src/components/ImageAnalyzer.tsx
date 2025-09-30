import React, { useState, useRef } from 'react';
import { X, Camera, Upload, Loader, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

interface ImageAnalyzerProps {
  isOpen: boolean;
  onClose: () => void;
  onAnalysisComplete: (analysisData: any) => void;
}

const ImageAnalyzer: React.FC<ImageAnalyzerProps> = ({ isOpen, onClose, onAnalysisComplete }) => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (file: File) => {
    setSelectedImage(file);
    setAnalysis(null);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error('Image size must be less than 10MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }
      
      handleImageSelect(file);
    }
  };

  const handleCameraCapture = () => {
    // In a real app, you would implement camera capture
    // For now, we'll simulate it with file input
    fileInputRef.current?.click();
  };

  const analyzeImage = async () => {
    if (!selectedImage && !imagePreview) {
      toast.error('Please select an image first');
      return;
    }

    setLoading(true);
    try {
      let imageData = '';
      
      if (selectedImage) {
        // Convert image to base64
        const reader = new FileReader();
        imageData = await new Promise((resolve) => {
          reader.onload = (e) => {
            const base64 = e.target?.result as string;
            resolve(base64.split(',')[1]); // Remove data:image/jpeg;base64, prefix
          };
          reader.readAsDataURL(selectedImage);
        });
      }

      const response = await fetch('/api/image/recognize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: imageData,
          imageUrl: imagePreview?.startsWith('data:') ? imagePreview : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze image');
      }

      const data = await response.json();

      if (data.success) {
        setAnalysis(data.analysis);
        toast.success('Image analyzed successfully!');
      } else {
        throw new Error(data.message || 'Analysis failed');
      }
    } catch (error) {
      console.error('Image analysis error:', error);
      toast.error('Failed to analyze image');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToMeal = (foodItem: any) => {
    onAnalysisComplete({
      name: foodItem.name,
      calories: foodItem.calories,
      quantityGrams: foodItem.estimatedGrams,
      protein: foodItem.protein,
      carbs: foodItem.carbs,
      fat: foodItem.fat,
      source: 'image_analysis',
    });
    onClose();
  };

  const handleAddAllToMeal = () => {
    if (!analysis) return;
    
    onAnalysisComplete({
      name: `Mixed meal (${analysis.foodItems.length} items)`,
      calories: analysis.totalCalories,
      quantityGrams: analysis.foodItems.reduce((sum: number, item: any) => sum + item.estimatedGrams, 0),
      protein: analysis.foodItems.reduce((sum: number, item: any) => sum + item.protein, 0),
      carbs: analysis.foodItems.reduce((sum: number, item: any) => sum + item.carbs, 0),
      fat: analysis.foodItems.reduce((sum: number, item: any) => sum + item.fat, 0),
      source: 'image_analysis',
    });
    onClose();
  };

  const handleClose = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setAnalysis(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={handleClose} />
        
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-bold text-gray-900">AI Food Analysis</h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6">
            {/* Image Upload/Capture */}
            {!imagePreview ? (
              <div className="text-center">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-12">
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <Camera className="w-12 h-12 text-gray-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">Upload Food Image</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Take a photo or upload an image of your meal for AI analysis
                      </p>
                    </div>
                    <div className="flex justify-center space-x-4">
                      <button
                        onClick={handleCameraCapture}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        <Camera className="w-4 h-4 mr-2" />
                        Take Photo
                      </button>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Image
                      </button>
                    </div>
                  </div>
                </div>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="space-y-6">
                {/* Image Preview */}
                <div className="text-center">
                  <img
                    src={imagePreview}
                    alt="Food to analyze"
                    className="max-w-full h-64 object-contain mx-auto rounded-lg border"
                  />
                  <div className="mt-4 space-x-2">
                    <button
                      onClick={analyzeImage}
                      disabled={loading}
                      className="inline-flex items-center px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
                    >
                      {loading ? (
                        <Loader className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Eye className="w-4 h-4 mr-2" />
                      )}
                      {loading ? 'Analyzing...' : 'Analyze with AI'}
                    </button>
                    <button
                      onClick={() => {
                        setSelectedImage(null);
                        setImagePreview(null);
                        setAnalysis(null);
                      }}
                      className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                    >
                      Choose Different Image
                    </button>
                  </div>
                </div>

                {/* Analysis Results */}
                {analysis && (
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-900">Analysis Results</h3>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        analysis.confidence > 0.7 
                          ? 'bg-green-100 text-green-800' 
                          : analysis.confidence > 0.5 
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {Math.round(analysis.confidence * 100)}% confidence
                      </span>
                    </div>

                    {/* Total Summary */}
                    <div className="bg-white rounded-lg p-4 mb-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">Total Estimated Calories</h4>
                          <p className="text-2xl font-bold text-blue-600">{analysis.totalCalories} cal</p>
                        </div>
                        <button
                          onClick={handleAddAllToMeal}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                          Add All to Meal
                        </button>
                      </div>
                    </div>

                    {/* Individual Food Items */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-900">Detected Food Items:</h4>
                      {analysis.foodItems.map((item: any, index: number) => (
                        <div key={index} className="bg-white rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h5 className="font-medium text-gray-900">{item.name}</h5>
                              <div className="text-sm text-gray-600 mt-1">
                                <span className="mr-4">{item.estimatedGrams}g</span>
                                <span className="mr-4">{item.calories} cal</span>
                                <span className="mr-4">P: {item.protein}g</span>
                                <span className="mr-4">C: {item.carbs}g</span>
                                <span>F: {item.fat}g</span>
                              </div>
                              <div className="mt-1">
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  item.confidence > 0.7 
                                    ? 'bg-green-100 text-green-800' 
                                    : item.confidence > 0.5 
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {Math.round(item.confidence * 100)}% confidence
                                </span>
                              </div>
                            </div>
                            <button
                              onClick={() => handleAddToMeal(item)}
                              className="ml-4 px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
                            >
                              Add Item
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Analysis Notes */}
                    {analysis.analysisNotes && (
                      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                        <h5 className="font-medium text-gray-900 mb-1">Analysis Notes</h5>
                        <p className="text-sm text-gray-700">{analysis.analysisNotes}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageAnalyzer;

