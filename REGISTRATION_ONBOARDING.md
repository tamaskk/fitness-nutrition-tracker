# Enhanced Registration & Onboarding System

This document describes the comprehensive user registration and onboarding flow implemented in the FitTracker application.

## Overview

The new registration system provides a multi-step onboarding process that collects detailed user information and preferences to create a personalized experience.

## Registration Flow

### Step 1: Enhanced Registration Form (`/signup`)

**New Fields Added:**
- **First Name** (required)
- **Last Name** (required)
- **Email** (required, validated)
- **Password** (required, min 6 characters)
- **Confirm Password** (required, must match)
- **Country** (required, dropdown with 30+ countries)
- **Language** (required, supports: English, Hungarian, Spanish, French, German, Italian)

**Features:**
- Responsive design with grid layout
- Real-time form validation
- Password visibility toggle
- Comprehensive country selection
- Language preference selection
- Automatic redirect to preferences page after successful registration

### Step 2: Feature Preferences (`/onboarding/preferences`)

**Selectable Features:**
- 🥗 **Meal Plans** - Personalized meal planning and nutrition tracking
- 🍳 **Recipes** - Discover and save delicious recipes
- 🏋️ **Trainings** - Workout plans and fitness tracking
- 🛒 **Shopping List** - Smart shopping lists and meal prep
- 💰 **Price Monitor** - Track prices and find the best deals
- 📊 **Finance** - Expense tracking and financial management

**Features:**
- Visual checkbox interface with icons and descriptions
- Real-time selection counter
- At least one feature must be selected
- Session storage for data persistence
- Smooth transitions between steps

### Step 3: Detailed Onboarding Questions (`/onboarding/questions`)

**Dynamic Question Sets** based on selected preferences:

#### 🥗 Meal Plans Questions:
1. **Goal**: Follow specific diet, Watch calories, Gain muscle, Lose weight, Eat healthier
2. **Cooking Time**: <15 min, 15-30 min, 30-60 min, >1 hour, Ready meals
3. **Dietary Restrictions**: Vegetarian, Vegan, Gluten-free, High-protein, No restrictions

#### 🍳 Recipes Questions:
1. **Recipe Type**: Quick meals, Healthy recipes, High-protein, Budget-friendly, Gourmet
2. **Cooking Frequency**: Daily, Few times/week, Weekly, Occasionally, Rarely
3. **Priority**: Simplicity, Nutrition, Taste, Cooking time, Cost

#### 🏋️ Trainings Questions:
1. **Fitness Goal**: Lose fat, Build muscle, Improve endurance, Stay active, Improve mobility
2. **Training Location**: Gym, Home, Outdoors, Fitness classes, Haven't started
3. **Training Frequency**: 1-2x/week, 3-4x/week, 5+x/week, Occasionally, Not sure

#### 🛒 Shopping List Questions:
1. **Planning Style**: Make list, Spontaneous, Weekly plan, Daily fresh, Online mostly
2. **Shopping Priority**: Healthy ingredients, Save money, Convenience, Local products, Organic
3. **Shopping Frequency**: Daily, 2-3x/week, Weekly, Bi-weekly, Rarely online

#### 💰 Price Monitor Questions:
1. **Products to Track**: Groceries, Electronics, Clothing, Household items, All
2. **Price Priority**: Lowest price, Quality, Brand reputation, Delivery, Discounts
3. **Check Frequency**: Daily, Weekly, Monthly, Before big purchases, Rarely

#### 📊 Finance Questions:
1. **Financial Goal**: Save money, Track expenses, Emergency fund, Invest, Pay debt
2. **Current Management**: Budgeting app, Manual tracking, No tracking, Bank app, Help
3. **Tool Importance**: Simplicity, Analytics, Goal tracking, Categorization, Bank connection

**Features:**
- Progress bar showing completion status
- Section-by-section navigation
- Radio button selection for each question
- Form validation ensuring all questions are answered
- Smooth transitions between sections
- Final submission with loading states

## Database Schema Updates

### Enhanced User Model

```typescript
interface User {
  _id: string;
  email: string;
  firstName: string;        // NEW
  lastName: string;         // NEW
  country: string;          // NEW
  language: string;         // NEW
  passwordHash: string;
  
  // NEW: Feature preferences
  preferences: {
    mealPlans: boolean;
    recipes: boolean;
    trainings: boolean;
    shoppingList: boolean;
    priceMonitor: boolean;
    finance: boolean;
  };
  
  // NEW: Detailed onboarding answers
  onboardingAnswers: {
    mealPlans: {
      goal?: string;
      cookingTime?: string;
      dietaryRestrictions?: string;
    };
    recipes: {
      recipeType?: string;
      cookingFrequency?: string;
      priority?: string;
    };
    trainings: {
      fitnessGoal?: string;
      trainingLocation?: string;
      trainingFrequency?: string;
    };
    shoppingList: {
      planningStyle?: string;
      shoppingPriority?: string;
      shoppingFrequency?: string;
    };
    priceMonitor: {
      productsToTrack?: string;
      priceComparisonPriority?: string;
      priceCheckFrequency?: string;
    };
    finance: {
      financialGoal?: string;
      currentManagement?: string;
      toolImportance?: string;
    };
  };
  
  // Existing fields
  age?: number;
  gender?: 'male' | 'female' | 'other';
  weightKg?: number;
  heightCm?: number;
  dailyCalorieGoal?: number;
  createdAt: Date;
}
```

## API Endpoints

### POST `/api/auth/signup`
Enhanced to handle new registration fields:
- Validates all required fields
- Creates user with default preferences (all false)
- Initializes empty onboarding answers structure
- Returns user data for session management

### POST `/api/user/onboarding`
New endpoint to save onboarding data:
- Updates user preferences based on selections
- Saves detailed onboarding answers
- Requires authentication
- Returns updated user data

### GET `/api/user/preferences`
New endpoint to retrieve user preferences:
- Returns user's selected features
- Returns onboarding answers
- Used for personalizing dashboard experience

## Admin Dashboard Updates

### Enhanced User Display
- Shows first name and last name
- Displays country and language
- Shows selected feature preferences as badges
- Expandable details with preference information

### New Statistics
- User preference distribution
- Country and language breakdown
- Feature adoption rates

## Technical Implementation

### Frontend Components
- **Enhanced Signup Form**: Multi-field registration with validation
- **Preferences Selector**: Interactive checkbox interface
- **Onboarding Questions**: Dynamic question flow with progress tracking
- **Session Management**: Temporary storage during onboarding flow

### Backend Updates
- **User Model**: Extended schema with new fields
- **Authentication**: Updated NextAuth configuration
- **API Endpoints**: New endpoints for onboarding data
- **Admin Features**: Enhanced user management capabilities

### Type Safety
- **TypeScript Interfaces**: Comprehensive type definitions
- **Form Validation**: React Hook Form integration
- **API Types**: Strongly typed request/response interfaces

## User Experience Features

### Progressive Disclosure
- Information collected in logical steps
- Each step builds on the previous
- Clear progress indication

### Personalization
- Dashboard can be customized based on preferences
- Content recommendations based on onboarding answers
- Feature-specific interfaces

### Accessibility
- Keyboard navigation support
- Screen reader friendly
- High contrast design
- Responsive layout for all devices

## Future Enhancements

### Potential Additions
- **Profile Completion**: Encourage users to complete missing profile information
- **Preference Updates**: Allow users to modify preferences after onboarding
- **A/B Testing**: Test different onboarding flows
- **Analytics**: Track onboarding completion rates and drop-off points
- **Localization**: Full translation support for all languages
- **Smart Defaults**: Pre-select preferences based on country/language

### Integration Opportunities
- **Recommendation Engine**: Use onboarding data for personalized content
- **Feature Flags**: Show/hide features based on user preferences
- **Marketing**: Segment users based on preferences and goals
- **Support**: Provide targeted help based on user selections

## Migration Notes

### Existing Users
- Existing users will have default preferences (all false)
- Empty onboarding answers structure
- Can complete onboarding through profile settings

### Data Migration
- No data loss for existing users
- New fields have appropriate defaults
- Backward compatibility maintained

## Security Considerations

### Data Protection
- Sensitive information properly hashed
- Session-based temporary storage
- Secure API endpoints with authentication

### Privacy
- User consent for data collection
- Clear explanation of data usage
- Option to skip detailed questions

This comprehensive onboarding system provides a foundation for highly personalized user experiences while maintaining security and usability standards.
