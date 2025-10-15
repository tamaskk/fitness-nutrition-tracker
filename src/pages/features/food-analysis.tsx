import React from 'react';
import { useRouter } from 'next/router';
import { ArrowLeft, Camera, Brain, Zap, Shield, Check, Star } from 'lucide-react';

const FoodAnalysisPage = () => {
  const router = useRouter();

  const features = [
    {
      icon: <Camera className="w-6 h-6 text-blue-600" />,
      title: "Instant Photo Analysis",
      description: "Simply take a photo of your meal and get detailed nutritional information in seconds."
    },
    {
      icon: <Brain className="w-6 h-6 text-purple-600" />,
      title: "AI-Powered Recognition",
      description: "Advanced machine learning algorithms identify foods with 95%+ accuracy."
    },
    {
      icon: <Zap className="w-6 h-6 text-yellow-600" />,
      title: "Real-time Processing",
      description: "Get instant results with our optimized cloud processing infrastructure."
    },
    {
      icon: <Shield className="w-6 h-6 text-green-600" />,
      title: "Privacy First",
      description: "Your photos are processed securely and never stored permanently."
    }
  ];

  const benefits = [
    "Track calories and macronutrients automatically",
    "Identify portion sizes with precision",
    "Get personalized dietary recommendations",
    "Monitor nutritional goals and progress",
    "Export data for professional analysis",
    "Integration with popular fitness apps"
  ];

  const pricing = [
    {
      plan: "Free",
      price: "$0",
      features: [
        "5 photos per day",
        "Basic nutritional info",
        "Standard accuracy"
      ]
    },
    {
      plan: "Pro",
      price: "$9.99/month",
      features: [
        "Unlimited photos",
        "Detailed nutritional breakdown",
        "High accuracy analysis",
        "Custom dietary goals",
        "Export capabilities"
      ]
    },
    {
      plan: "Trainer",
      price: "$29.99/month",
      features: [
        "Everything in Pro",
        "Bulk analysis for clients",
        "Advanced reporting",
        "API access",
        "White-label options"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Header */}
      <header className="bg-gray-50 dark:bg-black border-b border-gray-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Left Section - Logo and Back */}
            <div className="flex items-center">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <div className="w-6 h-6 bg-blue-400 rounded-full"></div>
                </div>
                <button 
                  onClick={() => router.push('/')}
                  className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-white"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Back to Home
                </button>
              </div>
            </div>

            {/* Center Section - Page Title */}
            <div className="hidden lg:block">
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">AI Food Analysis</h1>
            </div>

            {/* Right Section - Action Buttons */}
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => router.push('/login')}
                className="text-gray-700 hover:text-gray-900 dark:text-white text-sm font-medium"
              >
                Login
              </button>
              <button 
                onClick={() => router.push('/signup')}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
              >
                Sign up
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                Analyze Your Meals with
                <span className="text-blue-600"> AI Precision</span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
                Transform the way you track nutrition with our cutting-edge AI food analysis. 
                Simply snap a photo and get instant, accurate nutritional information.
              </p>
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <span className="ml-1 text-gray-600 dark:text-gray-400">4.9/5 rating</span>
                </div>
                <div className="text-gray-600 dark:text-gray-400">•</div>
                <div className="text-gray-600 dark:text-gray-400">1M+ meals analyzed</div>
              </div>
            </div>
            <div className="bg-white dark:bg-zinc-950 p-8 rounded-2xl shadow-lg dark:shadow-none dark:border dark:border-zinc-900">
              <div className="text-center">
                <Camera className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Try It Now</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">Upload a photo of your meal</p>
                <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  Analyze Photo
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Powerful Features for Accurate Analysis
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Our AI technology combines computer vision, machine learning, and nutritional science 
              to provide the most accurate food analysis available.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="bg-gray-50 dark:bg-black w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50 dark:bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                Why Choose Our AI Food Analysis?
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                Our advanced AI technology provides accurate, instant nutritional analysis 
                that helps you make informed decisions about your diet and health.
              </p>
              <ul className="space-y-4">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="w-6 h-6 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white dark:bg-zinc-950 p-8 rounded-2xl shadow-lg dark:shadow-none dark:border dark:border-zinc-900">
              <h3 className="text-xl font-semibold mb-4">Sample Analysis</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Calories</span>
                  <span className="font-semibold">450 kcal</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Protein</span>
                  <span className="font-semibold">25g</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Carbs</span>
                  <span className="font-semibold">45g</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Fat</span>
                  <span className="font-semibold">18g</span>
                </div>
                <div className="border-t pt-4">
                  <div className="text-sm text-gray-500 dark:text-gray-500">
                    Detected: Grilled chicken, rice, vegetables
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-white dark:bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Choose Your Plan
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Start free and upgrade as your needs grow
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricing.map((plan, index) => (
              <div 
                key={index} 
                className={`bg-white dark:bg-zinc-950 rounded-2xl shadow-lg dark:shadow-none border-2 dark:border-zinc-900 p-8 ${
                  index === 1 ? 'border-blue-500 scale-105' : 'border-gray-200'
                }`}
              >
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{plan.plan}</h3>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{plan.price}</div>
                </div>
                
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-600 dark:text-gray-400">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <button 
                  className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
                    index === 1 
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                      : 'bg-gray-100 text-gray-900 dark:text-white hover:bg-gray-200'
                  }`}
                >
                  {index === 0 ? 'Get Started' : index === 1 ? 'Start Free Trial' : 'Contact Sales'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Transform Your Nutrition Tracking?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Join millions of users who have simplified their nutrition tracking with AI-powered food analysis.
          </p>
          <button className="bg-white dark:bg-zinc-950 text-blue-600 dark:text-blue-400 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-100 dark:hover:bg-zinc-900 transition-colors">
            Start Free Trial
          </button>
        </div>
      </section>
    </div>
  );
};

export default FoodAnalysisPage;
