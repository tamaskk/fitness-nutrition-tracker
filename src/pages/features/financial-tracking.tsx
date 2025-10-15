import React from 'react';
import { useRouter } from 'next/router';
import { ArrowLeft, BarChart3, CreditCard, PiggyBank, TrendingUp, Check, Star, DollarSign } from 'lucide-react';

const FinancialTrackingPage = () => {
  const router = useRouter();

  const features = [
    {
      icon: <BarChart3 className="w-6 h-6 text-blue-600" />,
      title: "Expense Analytics",
      description: "Comprehensive spending analysis with detailed charts and insights."
    },
    {
      icon: <CreditCard className="w-6 h-6 text-green-600" />,
      title: "Bill Management",
      description: "Track bills, set reminders, and never miss a payment again."
    },
    {
      icon: <PiggyBank className="w-6 h-6 text-purple-600" />,
      title: "Savings Goals",
      description: "Set and track savings goals with automated progress monitoring."
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-orange-600" />,
      title: "Investment Tracking",
      description: "Monitor investments and portfolio performance in real-time."
    }
  ];

  const benefits = [
    "Automatically categorize expenses with AI-powered recognition",
    "Generate detailed financial reports and insights",
    "Set up automated savings transfers and goal tracking",
    "Monitor spending patterns and identify cost-saving opportunities",
    "Track bills and payments with smart reminders",
    "Export data for tax preparation and financial planning"
  ];

  const pricing = [
    {
      plan: "Free",
      price: "$0",
      features: [
        "Basic expense tracking",
        "5 categories",
        "Simple reports",
        "Bill reminders"
      ]
    },
    {
      plan: "Pro",
      price: "$9.99/month",
      features: [
        "Unlimited categories",
        "Advanced analytics",
        "Savings goals",
        "Investment tracking",
        "Custom reports",
        "Data export"
      ]
    },
    {
      plan: "Trainer",
      price: "$29.99/month",
      features: [
        "Everything in Pro",
        "Client financial tracking",
        "Bulk data management",
        "Advanced reporting",
        "API access",
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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Financial Tracking</h1>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                Take Control of Your
                <span className="text-blue-600"> Finances</span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
                Comprehensive financial tracking that helps you understand your spending, 
                save more, and achieve your financial goals with confidence.
              </p>
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <span className="ml-1 text-gray-600 dark:text-gray-400">4.8/5 rating</span>
                </div>
                <div className="text-gray-600 dark:text-gray-400">•</div>
                <div className="text-gray-600 dark:text-gray-400">75K+ users</div>
              </div>
            </div>
            <div className="bg-white dark:bg-zinc-950 p-8 rounded-2xl shadow-lg dark:shadow-none dark:border dark:border-zinc-900">
              <div className="text-center">
                <BarChart3 className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Start Tracking</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">Monitor your finances</p>
                <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  View Dashboard
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
              Complete Financial Management
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Our comprehensive financial tracking platform provides all the tools you need 
              to manage your money effectively and achieve your financial goals.
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
                Why Choose Our Financial Platform?
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                Our intelligent financial tracking system helps you understand your money habits, 
                identify opportunities for savings, and build a secure financial future.
              </p>
              <ul className="space-y-4">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="w-6 h-6 text-blue-500 mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white dark:bg-zinc-950 p-8 rounded-2xl shadow-lg dark:shadow-none dark:border dark:border-zinc-900">
              <h3 className="text-xl font-semibold mb-4">Financial Overview</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Monthly Income</span>
                  <span className="font-semibold text-green-600">$4,250</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Monthly Expenses</span>
                  <span className="font-semibold text-red-600">$3,120</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Savings Rate</span>
                  <span className="font-semibold text-blue-600">26.6%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Net Worth</span>
                  <span className="font-semibold">$45,230</span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-500">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    On track to reach your $50K goal
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
              Choose Your Financial Plan
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Start free and upgrade as your financial needs grow
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
                      <Check className="w-5 h-5 text-blue-500 mr-3 flex-shrink-0" />
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
            Ready to Take Control of Your Finances?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Join thousands of users who have improved their financial health with our platform.
          </p>
          <button className="bg-white dark:bg-zinc-950 text-blue-600 dark:text-blue-400 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-100 dark:hover:bg-zinc-900 transition-colors">
            Start Free Trial
          </button>
        </div>
      </section>
    </div>
  );
};

export default FinancialTrackingPage;

