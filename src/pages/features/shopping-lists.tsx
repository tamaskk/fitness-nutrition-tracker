import React from 'react';
import { useRouter } from 'next/router';
import { ArrowLeft, ShoppingCart, MapPin, DollarSign, Bell, Check, Star, TrendingUp } from 'lucide-react';

const ShoppingListsPage = () => {
  const router = useRouter();

  const features = [
    {
      icon: <ShoppingCart className="w-6 h-6 text-orange-600" />,
      title: "Smart Lists",
      description: "AI-powered shopping lists that learn from your preferences and habits."
    },
    {
      icon: <MapPin className="w-6 h-6 text-blue-600" />,
      title: "Store Integration",
      description: "Find the best prices and locations for your items across multiple stores."
    },
    {
      icon: <DollarSign className="w-6 h-6 text-green-600" />,
      title: "Price Tracking",
      description: "Monitor price changes and get alerts for the best deals on your items."
    },
    {
      icon: <Bell className="w-6 h-6 text-purple-600" />,
      title: "Smart Notifications",
      description: "Get reminders for sales, restocks, and shopping list updates."
    }
  ];

  const benefits = [
    "Generate shopping lists automatically from recipes and meal plans",
    "Compare prices across multiple stores and online retailers",
    "Get personalized recommendations based on your shopping history",
    "Track spending patterns and set budget goals",
    "Share lists with family members and sync across devices",
    "Receive alerts for sales and discounts on your favorite items"
  ];

  const pricing = [
    {
      plan: "Free",
      price: "$0",
      features: [
        "3 shopping lists",
        "Basic price comparison",
        "Simple notifications",
        "Store finder"
      ]
    },
    {
      plan: "Pro",
      price: "$9.99/month",
      features: [
        "Unlimited lists",
        "Advanced price tracking",
        "Smart recommendations",
        "Budget tracking",
        "Family sharing",
        "Sale alerts"
      ]
    },
    {
      plan: "Trainer",
      price: "$29.99/month",
      features: [
        "Everything in Pro",
        "Bulk list management",
        "Client list sharing",
        "Advanced analytics",
        "Custom integrations",
        "Priority support"
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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Smart Shopping Lists</h1>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-orange-50 to-red-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                Shop Smarter with
                <span className="text-orange-600"> AI-Powered Lists</span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
                Never forget an item again. Our intelligent shopping lists help you save time, 
                money, and stress with smart recommendations and price tracking.
              </p>
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <span className="ml-1 text-gray-600 dark:text-gray-400">4.6/5 rating</span>
                </div>
                <div className="text-gray-600 dark:text-gray-400">•</div>
                <div className="text-gray-600 dark:text-gray-400">100K+ lists created</div>
              </div>
            </div>
            <div className="bg-white dark:bg-zinc-950 p-8 rounded-2xl shadow-lg dark:shadow-none dark:border dark:border-zinc-900">
              <div className="text-center">
                <ShoppingCart className="w-16 h-16 text-orange-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Start Shopping</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">Create your first smart list</p>
                <button className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors">
                  New List
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
              Intelligent Shopping Made Simple
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Our smart shopping platform combines AI technology with real-world data 
              to make your shopping experience more efficient and cost-effective.
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
                Why Choose Our Shopping Platform?
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                Our intelligent shopping system helps you save time and money by automating 
                the tedious parts of shopping while providing valuable insights into your spending habits.
              </p>
              <ul className="space-y-4">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="w-6 h-6 text-orange-500 mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white dark:bg-zinc-950 p-8 rounded-2xl shadow-lg dark:shadow-none dark:border dark:border-zinc-900">
              <h3 className="text-xl font-semibold mb-4">Savings This Month</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Total Saved</span>
                  <span className="font-semibold text-green-600">$127.50</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Lists Created</span>
                  <span className="font-semibold">12</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Items Tracked</span>
                  <span className="font-semibold">89</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Best Deal Found</span>
                  <span className="font-semibold">-35%</span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-500">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    On track to save $1,500 this year
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
              Choose Your Shopping Plan
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Start free and upgrade as your shopping needs grow
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricing.map((plan, index) => (
              <div 
                key={index} 
                className={`bg-white dark:bg-zinc-950 rounded-2xl shadow-lg dark:shadow-none border-2 dark:border-zinc-900 p-8 ${
                  index === 1 ? 'border-orange-500 scale-105' : 'border-gray-200'
                }`}
              >
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{plan.plan}</h3>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{plan.price}</div>
                </div>
                
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <Check className="w-5 h-5 text-orange-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-600 dark:text-gray-400">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <button 
                  className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
                    index === 1 
                      ? 'bg-orange-600 text-white hover:bg-orange-700' 
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
      <section className="py-20 bg-gradient-to-r from-orange-600 to-red-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Shop Smarter?
          </h2>
          <p className="text-xl text-orange-100 mb-8 max-w-3xl mx-auto">
            Join thousands of smart shoppers who have saved time and money with our platform.
          </p>
          <button className="bg-white dark:bg-zinc-950 text-orange-600 dark:text-orange-400 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-100 dark:hover:bg-zinc-900 transition-colors">
            Start Free Trial
          </button>
        </div>
      </section>
    </div>
  );
};

export default ShoppingListsPage;

