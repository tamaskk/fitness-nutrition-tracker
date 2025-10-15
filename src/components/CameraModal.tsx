import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, RotateCcw, Check, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

// Utility function to check camera support
const checkCameraSupport = (): { supported: boolean; error?: string } => {
  if (typeof window === 'undefined') {
    return { supported: false, error: 'Not in browser environment' };
  }
  
  if (!window.isSecureContext && window.location.hostname !== 'localhost') {
    return { supported: false, error: 'Camera requires HTTPS or localhost' };
  }
  
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    // Check for legacy support
    const legacySupport = (navigator as any).getUserMedia || 
                         (navigator as any).webkitGetUserMedia || 
                         (navigator as any).mozGetUserMedia;
    
    if (!legacySupport) {
      return { supported: false, error: 'Camera not supported in this browser' };
    }
  }
  
  return { supported: true };
};

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAnalysisComplete: (analysisData: any) => void;
}

interface AnalysisResult {
  foodItems: Array<{
    name: string;
    estimatedGrams: number;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    confidence: number;
  }>;
  totalCalories: number;
  analysisNotes: string;
  confidence: number;
}

const CameraModal: React.FC<CameraModalProps> = ({ isOpen, onClose, onAnalysisComplete }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen && isMounted) {
      // Add a small delay to ensure the component is fully mounted
      const timer = setTimeout(() => {
        startCamera();
      }, 100);
      
      return () => clearTimeout(timer);
    } else {
      stopCamera();
      // Reset state when modal closes
      setCapturedImage(null);
      setAnalysis(null);
      setIsAnalyzing(false);
      setCameraError(null);
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, isMounted]);

  const startCamera = async () => {
    try {
      setCameraError(null);
      
      // Don't start camera if component is not mounted
      if (!isMounted) {
        return;
      }
      
      // Check camera support first
      const support = checkCameraSupport();
      if (!support.supported) {
        setCameraError(support.error || 'Camera not supported');
        return;
      }
      
      // Use modern API if available
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment', // Use back camera if available
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          }
        });
        
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } else {
        // Fallback to legacy API
        const getUserMedia = (navigator as any).getUserMedia || 
                           (navigator as any).webkitGetUserMedia || 
                           (navigator as any).mozGetUserMedia;
        
        getUserMedia.call(navigator, 
          { video: { facingMode: 'environment' } },
          (stream: MediaStream) => {
            streamRef.current = stream;
            if (videoRef.current) {
              videoRef.current.srcObject = stream;
            }
          },
          (error: any) => {
            console.error('Legacy camera access error:', error);
            setCameraError('Unable to access camera. Please check permissions and try again.');
          }
        );
      }
    } catch (error: any) {
      console.error('Camera access error:', error);
      
      // Provide more specific error messages
      if (error.name === 'NotAllowedError') {
        setCameraError('Camera access denied. Please allow camera permissions and try again.');
      } else if (error.name === 'NotFoundError') {
        setCameraError('No camera found on this device.');
      } else if (error.name === 'NotSupportedError') {
        setCameraError('Camera is not supported in this browser.');
      } else {
        setCameraError('Unable to access camera. Please check permissions and try again.');
      }
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw the video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to base64
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    setCapturedImage(imageData);
    
    // Stop camera after capture
    stopCamera();
    
    // Start analysis
    analyzeImage(imageData);
  };

  const analyzeImage = async (imageData: string) => {
    setIsAnalyzing(true);
    
    try {
      // Convert data URL to base64
      const base64Data = imageData.split(',')[1];
      
      const response = await fetch('/api/image/recognize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: base64Data,
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
      setIsAnalyzing(false);
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setAnalysis(null);
    setIsAnalyzing(false);
    startCamera();
  };

  const handleAddToMeal = (foodItem: any) => {
    onAnalysisComplete({
      name: foodItem.name,
      calories: foodItem.calories,
      quantityGrams: foodItem.estimatedGrams,
      protein: foodItem.protein,
      carbs: foodItem.carbs,
      fat: foodItem.fat,
      source: 'camera_analysis',
    });
    onClose();
  };

  const handleAddAllToMeal = () => {
    if (!analysis) return;
    
    // Add all food items as a combined meal
    const combinedData = {
      name: 'Analyzed Meal',
      calories: analysis.totalCalories,
      quantityGrams: analysis.foodItems.reduce((sum, item) => sum + item.estimatedGrams, 0),
      protein: analysis.foodItems.reduce((sum, item) => sum + item.protein, 0),
      carbs: analysis.foodItems.reduce((sum, item) => sum + item.carbs, 0),
      fat: analysis.foodItems.reduce((sum, item) => sum + item.fat, 0),
      source: 'camera_analysis',
      foodItems: analysis.foodItems,
    };
    
    onAnalysisComplete(combinedData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-black">
      {/* Camera View */}
      {!capturedImage && (
        <div className="relative w-full h-full">
          {!cameraError ? (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              
              {/* Analysis Animation Overlay */}
              {isAnalyzing && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <div className="text-center text-white">
                    {/* Scanning Line Animation */}
                    <div className="relative w-80 h-60 mb-8 mx-auto">
                      <div className="absolute inset-0 border-2 border-white rounded-lg opacity-30"></div>
                      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-white to-transparent animate-pulse"></div>
                      <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-white to-transparent animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                      
                      {/* Scanning Line */}
                      <div className="absolute inset-x-0 h-0.5 bg-white shadow-lg animate-bounce" style={{
                        animation: 'scanLine 2s ease-in-out infinite',
                        boxShadow: '0 0 10px rgba(255, 255, 255, 0.8)'
                      }}></div>
                      
                      {/* Rotating Circle */}
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-semibold mb-2">Analyzing Food...</h3>
                    <p className="text-sm opacity-75">Please wait while we identify your meal</p>
                  </div>
                </div>
              )}
              
              {/* Camera Controls */}
              {!isAnalyzing && (
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
                  <div className="flex items-center space-x-6">
                    {/* Close Button */}
                    <button
                      onClick={onClose}
                      className="w-12 h-12 bg-black bg-opacity-50 rounded-full flex items-center justify-center text-white hover:bg-opacity-70 transition-all"
                    >
                      <X className="w-6 h-6" />
                    </button>
                    
                    {/* Capture Button */}
                    <button
                      onClick={capturePhoto}
                      className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-all"
                    >
                      <div className="w-16 h-16 bg-white border-4 border-gray-300 rounded-full"></div>
                    </button>
                    
                    {/* Flip Camera Button (placeholder) */}
                    <button
                      className="w-12 h-12 bg-black bg-opacity-50 rounded-full flex items-center justify-center text-white hover:bg-opacity-70 transition-all"
                    >
                      <RotateCcw className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              )}
              
              {/* Instructions */}
              <div className="absolute top-8 left-4 right-4 text-center">
                <p className="text-white text-sm bg-black bg-opacity-50 rounded px-4 py-2 inline-block">
                  Position your food in the center and tap the capture button
                </p>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-white">
                <AlertCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-semibold mb-2">Camera Unavailable</h3>
                <p className="text-sm opacity-75 mb-4">{cameraError}</p>
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-white text-black rounded-lg hover:bg-gray-100 transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Results View */}
      {capturedImage && analysis && !isAnalyzing && (
        <div className="w-full h-full bg-white overflow-y-auto">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Analysis Results</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-all"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>
            
            {/* Captured Image */}
            <div className="mb-6">
              <img
                src={capturedImage}
                alt="Captured food"
                className="w-full max-w-md mx-auto rounded-lg shadow-lg"
              />
            </div>
            
            {/* Analysis Results */}
            <div className="space-y-6">
              {/* Total Calories */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Calories</h3>
                  <div className="text-3xl font-bold text-blue-600">{analysis.totalCalories}</div>
                  <p className="text-sm text-gray-600 mt-1">Confidence: {Math.round(analysis.confidence * 100)}%</p>
                </div>
              </div>
              
              {/* Food Items */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Detected Foods</h3>
                <div className="space-y-3">
                  {analysis.foodItems.map((item, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{item.name}</h4>
                        <span className="text-sm text-gray-600">{item.estimatedGrams}g</span>
                      </div>
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Calories:</span>
                          <div className="font-semibold text-red-600">{item.calories}</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Protein:</span>
                          <div className="font-semibold text-blue-600">{item.protein}g</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Carbs:</span>
                          <div className="font-semibold text-green-600">{item.carbs}g</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Fat:</span>
                          <div className="font-semibold text-yellow-600">{item.fat}g</div>
                        </div>
                      </div>
                      <div className="mt-3">
                        <button
                          onClick={() => handleAddToMeal(item)}
                          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-all flex items-center justify-center"
                        >
                          <Check className="w-4 h-4 mr-2" />
                          Add {item.name}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Analysis Notes */}
              {analysis.analysisNotes && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-medium text-yellow-800 mb-2">Analysis Notes</h4>
                  <p className="text-sm text-yellow-700">{analysis.analysisNotes}</p>
                </div>
              )}
              
              {/* Action Buttons */}
              <div className="flex space-x-4 pt-6">
                <button
                  onClick={handleRetake}
                  className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-300 transition-all flex items-center justify-center"
                >
                  <RotateCcw className="w-5 h-5 mr-2" />
                  Retake Photo
                </button>
                <button
                  onClick={handleAddAllToMeal}
                  className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-all flex items-center justify-center"
                >
                  <Check className="w-5 h-5 mr-2" />
                  Add All to Meal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Hidden Canvas for Image Capture */}
      <canvas ref={canvasRef} className="hidden" />
      
      {/* Custom CSS for scanning animation */}
      <style jsx>{`
        @keyframes scanLine {
          0% { top: 0; }
          50% { top: 50%; }
          100% { top: 100%; }
        }
      `}</style>
    </div>
  );
};

export default CameraModal;
