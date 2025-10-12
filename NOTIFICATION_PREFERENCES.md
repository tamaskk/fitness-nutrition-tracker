# Notification Preferences System

This document describes the notification preferences feature added to the FitTracker onboarding system.

## Overview

After users complete each section of the onboarding questions, they are prompted to choose their notification preferences for that specific feature. This allows for granular control over how users receive updates and reminders.

## Notification Options

For each selected feature, users can choose from four notification options:

### 📧 **Email Notifications**
- Daily/weekly email updates
- Progress reports and insights
- Feature-specific tips and recommendations
- Best for users who prefer email communication

### 🔔 **In-App Notifications**
- Real-time notifications within the application
- Dashboard alerts and reminders
- Feature-specific activity updates
- Best for users who are frequently active in the app

### 📱 **Both Email and In-App**
- Comprehensive notification coverage
- Email for important updates and summaries
- In-app for real-time activity and reminders
- Best for users who want maximum engagement

### 🚫 **No Notifications**
- Opt-out of all notifications for that feature
- Users can still use the feature without interruptions
- Best for users who prefer minimal communication

## Feature-Specific Notification Questions

### 🥗 **Meal Plans**
**Question**: "Would you like to receive daily updates about your meal planning progress?"
- **Email**: Weekly meal plan summaries, nutrition insights
- **In-app**: Daily meal reminders, calorie tracking alerts
- **Both**: Comprehensive meal planning support
- **None**: Use meal planning features without notifications

### 🍳 **Recipes**
**Question**: "Would you like to receive notifications about new recipes and cooking tips?"
- **Email**: Weekly recipe recommendations, cooking tips newsletter
- **In-app**: New recipe alerts, cooking reminders
- **Both**: Full recipe discovery experience
- **None**: Browse recipes without notifications

### 🏋️ **Trainings**
**Question**: "Would you like to receive workout reminders and fitness progress updates?"
- **Email**: Weekly fitness reports, workout plan updates
- **In-app**: Workout reminders, progress celebrations
- **Both**: Complete fitness motivation system
- **None**: Track workouts without notifications

### 🛒 **Shopping List**
**Question**: "Would you like to receive shopping reminders and list updates?"
- **Email**: Weekly shopping lists, meal prep reminders
- **In-app**: Shopping list updates, item reminders
- **Both**: Comprehensive shopping support
- **None**: Use shopping lists without notifications

### 💰 **Price Monitor**
**Question**: "Would you like to receive price alerts and deal notifications?"
- **Email**: Weekly price reports, deal summaries
- **In-app**: Real-time price alerts, deal notifications
- **Both**: Complete price monitoring experience
- **None**: Monitor prices without notifications

### 📊 **Finance**
**Question**: "Would you like to receive financial insights and spending alerts?"
- **Email**: Monthly financial reports, spending summaries
- **In-app**: Spending alerts, budget reminders
- **Both**: Comprehensive financial management
- **None**: Track finances without notifications

## Technical Implementation

### Database Schema Updates

```typescript
// Enhanced User Model
interface User {
  // ... existing fields
  onboardingAnswers: {
    mealPlans: {
      goal?: string;
      cookingTime?: string;
      dietaryRestrictions?: string;
      notifications?: 'email' | 'in-app' | 'both' | 'none';
    };
    recipes: {
      recipeType?: string;
      cookingFrequency?: string;
      priority?: string;
      notifications?: 'email' | 'in-app' | 'both' | 'none';
    };
    trainings: {
      fitnessGoal?: string;
      trainingLocation?: string;
      trainingFrequency?: string;
      notifications?: 'email' | 'in-app' | 'both' | 'none';
    };
    shoppingList: {
      planningStyle?: string;
      shoppingPriority?: string;
      shoppingFrequency?: string;
      notifications?: 'email' | 'in-app' | 'both' | 'none';
    };
    priceMonitor: {
      productsToTrack?: string;
      priceComparisonPriority?: string;
      priceCheckFrequency?: string;
      notifications?: 'email' | 'in-app' | 'both' | 'none';
    };
    finance: {
      financialGoal?: string;
      currentManagement?: string;
      toolImportance?: string;
      notifications?: 'email' | 'in-app' | 'both' | 'none';
    };
  };
}
```

### UI Components

#### Notification Selection Interface
- **Grid Layout**: 2x2 grid for easy selection
- **Visual Icons**: Mail, Bell, Smartphone icons for clarity
- **Hover Effects**: Interactive feedback on selection
- **Default Selection**: "No notifications" pre-selected
- **Responsive Design**: Works on all device sizes

#### Admin Dashboard Display
- **Color-coded Badges**: Different colors for each notification type
- **Feature Mapping**: Shows notification preferences per feature
- **Compact Layout**: Efficient use of space in user details
- **Visual Indicators**: Emojis and colors for quick recognition

## User Experience Flow

### Onboarding Process
1. **User selects features** in preferences page
2. **Answers detailed questions** for each selected feature
3. **Chooses notification preferences** after each section
4. **Completes onboarding** with all preferences saved
5. **Receives personalized notifications** based on selections

### Admin Management
1. **View user preferences** in admin dashboard
2. **See notification settings** for each feature
3. **Understand user engagement** preferences
4. **Plan notification campaigns** based on user data

## Benefits

### For Users
- **Personalized Experience**: Notifications tailored to their preferences
- **Control**: Granular control over communication frequency
- **Flexibility**: Different preferences for different features
- **No Spam**: Only receive notifications they want

### For Administrators
- **User Insights**: Understand how users want to be contacted
- **Engagement Strategy**: Plan notifications based on user preferences
- **Feature Adoption**: See which features users want notifications for
- **Communication Planning**: Optimize notification delivery methods

### For Business
- **Higher Engagement**: Users more likely to engage with preferred notifications
- **Reduced Churn**: Users won't be overwhelmed by unwanted notifications
- **Better Retention**: Personalized experience increases user satisfaction
- **Data-Driven Decisions**: Rich data on user communication preferences

## Future Enhancements

### Advanced Notification Features
- **Time-based Preferences**: Choose specific times for notifications
- **Frequency Options**: Daily, weekly, monthly notification schedules
- **Content Customization**: Choose specific types of content to receive
- **Smart Notifications**: AI-powered notification timing and content

### Integration Opportunities
- **Push Notifications**: Mobile app integration
- **SMS Notifications**: Text message options for urgent updates
- **Calendar Integration**: Add reminders to user calendars
- **Social Sharing**: Notifications about social features and achievements

### Analytics and Optimization
- **Open Rates**: Track email notification engagement
- **Click-through Rates**: Measure in-app notification effectiveness
- **User Feedback**: Collect feedback on notification relevance
- **A/B Testing**: Test different notification strategies

## Implementation Notes

### Default Behavior
- All notification preferences default to "none"
- Users must explicitly opt-in to receive notifications
- Respects user privacy and communication preferences

### Data Privacy
- Notification preferences are stored securely
- Users can change preferences at any time
- Clear communication about what notifications contain

### Scalability
- System designed to handle large numbers of users
- Efficient database queries for notification preferences
- Ready for integration with notification services

This notification preferences system provides a foundation for highly personalized user communication while respecting user choice and privacy preferences.
