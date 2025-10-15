import React from 'react';
import { useRouter } from 'next/router';
import { ArrowLeft, ChefHat, Search, BookOpen, Users, Check, Star, Heart } from 'lucide-react';

const RecipeManagementPage = () => {
  const router = useRouter();

  const features = [
    {
      icon: <ChefHat className="w-6 h-6 text-purple-600" />,
      title: "Recipe Creation",
      description: "Create and customize recipes with detailed ingredients, instructions, and nutritional info."
    },
    {
      icon: <Search className="w-6 h-6 text-blue-600" />,
      title: "Smart Search",
      description: "Find recipes by ingredients, dietary restrictions, cooking time, or nutritional goals."
    },
    {
      icon: <BookOpen className="w-6 h-6 text-green-600" />,
      title: "Recipe Collections",
      description: "Organize recipes into custom collections and meal plans for easy access."
    },
    {
      icon: <Users className="w-6 h-6 text-orange-600" />,
      title: "Community Sharing",
      description: "Share your favorite recipes with the community and discover new ones."
    }
  ];

  const benefits = [
    "Create unlimited custom recipes with nutritional calculations",
    "Import recipes from popular cooking websites",
    "Generate shopping lists from selected recipes",
    "Plan meals weeks in advance with our meal planner",
    "Get personalized recipe recommendations based on your preferences",
    "Track cooking history and favorite ingredients"
  ];

  const pricing = [
    {
      plan: "Free",
      price: "$0",
      features: [
        "5 saved recipes",
        "Basic recipe search",
        "Simple meal planning",
        "Community access"
      ]
    },
    {
      plan: "Pro",
      price: "$9.99/month",
      features: [
        "Unlimited recipes",
        "Advanced search filters",
        "Meal planning tools",
        "Nutritional analysis",
        "Shopping list generation",
        "Recipe scaling"
      ]
    },
    {
      plan: "Trainer",
      price: "$29.99/month",
      features: [
        "Everything in Pro",
        "Client recipe sharing",
        "Bulk recipe management",
        "Custom meal plans",
        "Nutritional reporting",
        "API access"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Header */}
      <header className="bg-white dark:bg-zinc-950 shadow-sm dark:shadow-none dark:border-b dark:border-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-6">
            <button 
              onClick={() => router.push('/')}
              className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-white mr-8"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Home
            </button>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Recipe Management</h1>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-purple-50 to-pink-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                Master Your Kitchen with
                <span className="text-purple-600"> Smart Recipes</span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
                Create, organize, and discover delicious recipes that fit your lifestyle. 
                From meal planning to nutritional tracking, we make cooking simple and enjoyable.
              </p>
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <span className="ml-1 text-gray-600 dark:text-gray-400">4.7/5 rating</span>
                </div>
                <div className="text-gray-600 dark:text-gray-400">•</div>
                <div className="text-gray-600 dark:text-gray-400">50K+ recipes shared</div>
              </div>
            </div>
            <div className="bg-white dark:bg-zinc-950 p-8 rounded-2xl shadow-lg dark:shadow-none dark:border dark:border-zinc-900">
              <div className="text-center">
                <ChefHat className="w-16 h-16 text-purple-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Start Cooking</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">Create your first recipe</p>
                <button className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                  New Recipe
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
              Everything You Need to Cook Better
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Our comprehensive recipe management system helps you organize your culinary journey 
              and discover new flavors that align with your health goals.
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
                Why Choose Our Recipe Platform?
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                Our recipe management system combines culinary expertise with modern technology 
                to help you cook better, eat healthier, and enjoy your time in the kitchen.
              </p>
              <ul className="space-y-4">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="w-6 h-6 text-purple-500 mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white dark:bg-zinc-950 p-8 rounded-2xl shadow-lg dark:shadow-none dark:border dark:border-zinc-900">
              <h3 className="text-xl font-semibold mb-4">Recipe Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Total Recipes</span>
                  <span className="font-semibold">127</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">This Week</span>
                  <span className="font-semibold text-purple-600">+8 new</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Favorites</span>
                  <span className="font-semibold">23</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Avg. Rating</span>
                  <span className="font-semibold">4.6/5</span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-500">
                    <Heart className="w-4 h-4 mr-2" />
                    Most loved: Mediterranean Quinoa Bowl
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
              Choose Your Cooking Plan
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Start free and upgrade as your culinary skills grow
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricing.map((plan, index) => (
              <div 
                key={index} 
                className={`bg-white dark:bg-zinc-950 rounded-2xl shadow-lg dark:shadow-none border-2 dark:border-zinc-900 p-8 ${
                  index === 1 ? 'border-purple-500 scale-105' : 'border-gray-200'
                }`}
              >
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{plan.plan}</h3>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{plan.price}</div>
                </div>
                
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <Check className="w-5 h-5 text-purple-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-600 dark:text-gray-400">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <button 
                  className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
                    index === 1 
                      ? 'bg-purple-600 text-white hover:bg-purple-700' 
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
      <section className="py-20 bg-gradient-to-r from-purple-600 to-pink-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Elevate Your Cooking?
          </h2>
          <p className="text-xl text-purple-100 mb-8 max-w-3xl mx-auto">
            Join thousands of home cooks who have transformed their kitchen experience with our platform.
          </p>
          <button className="bg-white dark:bg-zinc-950 text-purple-600 dark:text-purple-400 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-100 dark:hover:bg-zinc-900 transition-colors">
            Start Free Trial
          </button>
        </div>
      </section>
    </div>
  );
};

export default RecipeManagementPage;

