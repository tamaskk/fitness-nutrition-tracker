import React from 'react';
import { useRouter } from 'next/router';
import { ArrowLeft, Dumbbell, BarChart3, Target, Users, Check, Star, TrendingUp } from 'lucide-react';

const WorkoutTrackingPage = () => {
  const router = useRouter();

  const features = [
    {
      icon: <Dumbbell className="w-6 h-6 text-green-600" />,
      title: "Exercise Library",
      description: "Access 1000+ exercises with detailed instructions and video demonstrations."
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-blue-600" />,
      title: "Progress Analytics",
      description: "Track your strength gains, endurance improvements, and body composition changes."
    },
    {
      icon: <Target className="w-6 h-6 text-purple-600" />,
      title: "Goal Setting",
      description: "Set and achieve personalized fitness goals with smart recommendations."
    },
    {
      icon: <Users className="w-6 h-6 text-orange-600" />,
      title: "Social Features",
      description: "Connect with friends, share workouts, and participate in challenges."
    }
  ];

  const benefits = [
    "Track workouts across all fitness disciplines",
    "Monitor strength progression with detailed charts",
    "Get personalized workout recommendations",
    "Access professional trainer-created programs",
    "Sync with popular fitness devices and apps",
    "Export data for professional analysis"
  ];

  const pricing = [
    {
      plan: "Free",
      price: "$0",
      features: [
        "Basic workout logging",
        "10 exercise templates",
        "Simple progress tracking",
        "Community access"
      ]
    },
    {
      plan: "Pro",
      price: "$9.99/month",
      features: [
        "Unlimited exercise library",
        "Advanced analytics",
        "Custom workout plans",
        "Goal tracking",
        "Data export",
        "Premium support"
      ]
    },
    {
      plan: "Trainer",
      price: "$29.99/month",
      features: [
        "Everything in Pro",
        "Client management tools",
        "Custom program creation",
        "Advanced reporting",
        "API access",
        "White-label options"
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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Workout Tracking</h1>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-50 to-emerald-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                Track Your Fitness Journey with
                <span className="text-green-600"> Precision</span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
                Comprehensive workout tracking that adapts to your fitness level and goals. 
                From beginner to elite athlete, we've got you covered.
              </p>
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <span className="ml-1 text-gray-600 dark:text-gray-400">4.8/5 rating</span>
                </div>
                <div className="text-gray-600 dark:text-gray-400">•</div>
                <div className="text-gray-600 dark:text-gray-400">500K+ workouts logged</div>
              </div>
            </div>
            <div className="bg-white dark:bg-zinc-950 p-8 rounded-2xl shadow-lg dark:shadow-none dark:border dark:border-zinc-900">
              <div className="text-center">
                <Dumbbell className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Start Tracking</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">Log your first workout</p>
                <button className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors">
                  Begin Workout
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
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Our comprehensive workout tracking platform provides all the tools you need 
              to achieve your fitness goals and maintain long-term success.
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
                Why Our Workout Tracking Works
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                Our platform combines scientific principles with intuitive design to help you 
                build consistent habits and achieve measurable results.
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
              <h3 className="text-xl font-semibold mb-4">Progress Overview</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">This Week</span>
                  <span className="font-semibold text-green-600">+5.2%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Workouts Completed</span>
                  <span className="font-semibold">4/5</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Total Volume</span>
                  <span className="font-semibold">12,450 lbs</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Streak</span>
                  <span className="font-semibold">15 days</span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-500">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    On track to reach your goal
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
              Choose Your Fitness Plan
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Start free and upgrade as your fitness journey evolves
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricing.map((plan, index) => (
              <div 
                key={index} 
                className={`bg-white dark:bg-zinc-950 rounded-2xl shadow-lg dark:shadow-none border-2 dark:border-zinc-900 p-8 ${
                  index === 1 ? 'border-green-500 scale-105' : 'border-gray-200'
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
                      ? 'bg-green-600 text-white hover:bg-green-700' 
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
      <section className="py-20 bg-gradient-to-r from-green-600 to-emerald-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Transform Your Fitness?
          </h2>
          <p className="text-xl text-green-100 mb-8 max-w-3xl mx-auto">
            Join thousands of athletes and fitness enthusiasts who have achieved their goals with our platform.
          </p>
          <button className="bg-white dark:bg-zinc-950 text-green-600 dark:text-green-400 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-100 dark:hover:bg-zinc-900 transition-colors">
            Start Free Trial
          </button>
        </div>
      </section>
    </div>
  );
};

export default WorkoutTrackingPage;

