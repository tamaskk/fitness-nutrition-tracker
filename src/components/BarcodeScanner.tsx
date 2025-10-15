import React, { useState, useRef, useEffect } from 'react';
import { X, Camera, Search, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

interface BarcodeScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onFoodFound: (foodData: any) => void;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ isOpen, onClose, onFoodFound }) => {
  const [manualBarcode, setManualBarcode] = useState('');
  const [loading, setLoading] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Use back camera if available
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Camera access error:', error);
      setCameraError('Unable to access camera. Please check permissions or enter barcode manually.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const handleBarcodeSubmit = async (barcode: string) => {
    if (!barcode.trim()) {
      toast.error('Please enter a barcode');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/barcode/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ barcode: barcode.trim() }),
      });

      if (!response.ok) {
        throw new Error('Failed to scan barcode');
      }

      const data = await response.json();

      if (data.found) {
        toast.success('Product found!');
        onFoodFound({
          name: data.product.name,
          brand: data.product.brand,
          caloriesPer100g: data.product.caloriesPer100g,
          proteinPer100g: data.product.proteinPer100g,
          carbsPer100g: data.product.carbsPer100g,
          fatPer100g: data.product.fatPer100g,
          servingSize: data.product.servingSize,
          barcode: data.product.barcode,
        });
        onClose();
      } else {
        toast.error('Product not found in database');
        // Optionally, could trigger OpenAI estimation here
      }
    } catch (error) {
      console.error('Barcode scan error:', error);
      toast.error('Failed to scan barcode');
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleBarcodeSubmit(manualBarcode);
  };

  // Simulate barcode detection (in a real app, you'd use a barcode scanning library)
  const simulateBarcodeDetection = () => {
    const mockBarcodes = ['012345678901', '123456789012', '234567890123', '345678901234'];
    const randomBarcode = mockBarcodes[Math.floor(Math.random() * mockBarcodes.length)];
    handleBarcodeSubmit(randomBarcode);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={onClose} />
        
        <div className="relative bg-white dark:bg-zinc-950 rounded-lg shadow-xl dark:shadow-none dark:border dark:border-zinc-900 max-w-md w-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-bold text-gray-900">Scan Barcode</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6">
            {/* Camera View */}
            <div className="mb-6">
              <div className="relative bg-gray-900 rounded-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>
                {!cameraError ? (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                    {/* Scanning overlay */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="border-2 border-white rounded-lg w-64 h-20 relative">
                        <div className="absolute inset-x-0 top-1/2 h-0.5 bg-red-500 animate-pulse"></div>
                      </div>
                    </div>
                    {/* Instructions */}
                    <div className="absolute bottom-4 left-4 right-4 text-center">
                      <p className="text-white text-sm bg-black bg-opacity-50 rounded px-2 py-1">
                        Position barcode within the frame
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center text-white">
                      <Camera className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p className="text-sm">{cameraError}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Demo Scan Button */}
              {!cameraError && (
                <div className="mt-4 text-center">
                  <button
                    onClick={simulateBarcodeDetection}
                    disabled={loading}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Camera className="w-4 h-4 mr-2" />
                    )}
                    {loading ? 'Scanning...' : 'Demo Scan'}
                  </button>
                  <p className="text-xs text-gray-500 mt-2">
                    Click to simulate barcode detection
                  </p>
                </div>
              )}
            </div>

            {/* Manual Entry */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Or Enter Manually</h3>
              <form onSubmit={handleManualSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Barcode Number
                  </label>
                  <input
                    type="text"
                    value={manualBarcode}
                    onChange={(e) => setManualBarcode(e.target.value)}
                    placeholder="Enter barcode (e.g., 012345678901)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || !manualBarcode.trim()}
                  className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  {loading ? (
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4 mr-2" />
                  )}
                  {loading ? 'Looking up...' : 'Look Up Product'}
                </button>
              </form>

              {/* Demo Barcodes */}
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">Try these demo barcodes:</p>
                <div className="grid grid-cols-2 gap-2">
                  {['012345678901', '123456789012', '234567890123', '345678901234'].map((code) => (
                    <button
                      key={code}
                      onClick={() => setManualBarcode(code)}
                      className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded text-left"
                    >
                      {code}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BarcodeScanner;

