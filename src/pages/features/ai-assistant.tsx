import React from 'react';
import { useRouter } from 'next/router';
import { ArrowLeft, Brain, MessageCircle, Zap, Shield, Check, Star, Sparkles } from 'lucide-react';

const AIAssistantPage = () => {
  const router = useRouter();

  const features = [
    {
      icon: <Brain className="w-6 h-6 text-purple-600" />,
      title: "Smart Recommendations",
      description: "Get personalized suggestions based on your goals, preferences, and behavior patterns."
    },
    {
      icon: <MessageCircle className="w-6 h-6 text-blue-600" />,
      title: "Natural Conversations",
      description: "Chat with our AI assistant using natural language for instant help and guidance."
    },
    {
      icon: <Zap className="w-6 h-6 text-yellow-600" />,
      title: "Instant Insights",
      description: "Receive real-time analysis and actionable insights from your data."
    },
    {
      icon: <Shield className="w-6 h-6 text-green-600" />,
      title: "Privacy Protected",
      description: "Your data is processed securely with enterprise-grade privacy protection."
    }
  ];

  const benefits = [
    "Get personalized meal and workout recommendations based on your goals",
    "Receive instant answers to health and fitness questions",
    "Analyze your progress and suggest improvements automatically",
    "Get reminders and motivation tailored to your schedule",
    "Access expert-level advice 24/7 without the cost of a personal trainer",
    "Learn from your patterns and adapt recommendations over time"
  ];

  const pricing = [
    {
      plan: "Free",
      price: "$0",
      features: [
        "5 AI conversations per day",
        "Basic recommendations",
        "Simple insights",
        "Standard response time"
      ]
    },
    {
      plan: "Pro",
      price: "$9.99/month",
      features: [
        "Unlimited conversations",
        "Advanced AI recommendations",
        "Detailed insights",
        "Priority response time",
        "Custom goal setting",
        "Progress analysis"
      ]
    },
    {
      plan: "Trainer",
      price: "$29.99/month",
      features: [
        "Everything in Pro",
        "Client AI assistance",
        "Bulk recommendations",
        "Advanced analytics",
        "Custom AI training",
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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AI Personal Assistant</h1>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-purple-50 to-indigo-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                Your Personal
                <span className="text-purple-600"> AI Health Coach</span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
                Get personalized guidance, instant answers, and smart recommendations 
                from our advanced AI assistant that learns and adapts to your unique needs.
              </p>
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <span className="ml-1 text-gray-600 dark:text-gray-400">4.9/5 rating</span>
                </div>
                <div className="text-gray-600 dark:text-gray-400">•</div>
                <div className="text-gray-600 dark:text-gray-400">1M+ conversations</div>
              </div>
            </div>
            <div className="bg-white dark:bg-zinc-950 p-8 rounded-2xl shadow-lg dark:shadow-none dark:border dark:border-zinc-900">
              <div className="text-center">
                <Brain className="w-16 h-16 text-purple-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Chat with AI</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">Ask anything about health & fitness</p>
                <button className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                  Start Conversation
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
              Intelligent Assistance at Your Fingertips
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Our AI assistant combines advanced machine learning with health expertise 
              to provide personalized guidance that evolves with your journey.
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
                Why Choose Our AI Assistant?
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                Our AI assistant is like having a personal health coach available 24/7, 
                providing expert guidance tailored specifically to your goals and preferences.
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
              <h3 className="text-xl font-semibold mb-4">AI Conversation</h3>
              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-black p-3 rounded-lg">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">You:</div>
                  <div className="text-gray-900 dark:text-white">"I want to lose 10 pounds in 3 months"</div>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg">
                  <div className="text-sm text-purple-600 mb-1">AI Assistant:</div>
                  <div className="text-gray-900 dark:text-white">
                    "Great goal! Based on your current stats, I recommend a 500-calorie daily deficit. 
                    Let me create a personalized meal and workout plan for you..."
                  </div>
                </div>
                <div className="border-t pt-4">
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-500">
                    <Sparkles className="w-4 h-4 mr-2" />
                    AI is analyzing your profile...
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
              Choose Your AI Plan
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Start free and upgrade as your AI needs grow
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
      <section className="py-20 bg-gradient-to-r from-purple-600 to-indigo-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Meet Your AI Health Coach?
          </h2>
          <p className="text-xl text-purple-100 mb-8 max-w-3xl mx-auto">
            Join millions of users who have transformed their health journey with personalized AI guidance.
          </p>
          <button className="bg-white dark:bg-zinc-950 text-purple-600 dark:text-purple-400 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-100 dark:hover:bg-zinc-900 transition-colors">
            Start Free Trial
          </button>
        </div>
      </section>
    </div>
  );
};

export default AIAssistantPage;

