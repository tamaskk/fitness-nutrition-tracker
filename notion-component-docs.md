# Component Documentation for Notion

## 📱 RecipeModal Component

### Overview
A comprehensive modal component for displaying recipe details, managing servings, and adding recipes to meals.

### Props Interface
```typescript
interface RecipeModalProps {
  recipe: Recipe | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToMeal?: (recipe: Recipe, servings: number) => void;
}
```

### Key Features
- **Dynamic Serving Adjustment**: Users can modify serving sizes with real-time calorie recalculation
- **Meal Integration**: Direct "Add to Meal" functionality
- **Rich Recipe Display**: Shows ingredients, instructions, nutrition info, and cooking times
- **Responsive Design**: Mobile-friendly modal with proper touch interactions

### State Management
```typescript
const [servings, setServings] = useState(defaultServings);
const [selectedMealType, setSelectedMealType] = useState('breakfast');
const [isAddingToMeal, setIsAddingToMeal] = useState(false);
```

### Key Functions
- `handleServingChange()`: Recalculates calories based on serving size
- `handleAddToMeal()`: Adds recipe to selected meal with proper serving size
- `formatCalories()`: Formats calorie display with proper rounding

### Usage Example
```tsx
<RecipeModal
  recipe={selectedRecipe}
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  onAddToMeal={handleAddRecipeToMeal}
/>
```

---

## 🍽️ MealForm Component

### Overview
Form component for logging meals with food search, quantity input, and calorie calculation.

### Features
- Food search with autocomplete
- Manual calorie entry
- Meal type selection (breakfast, lunch, dinner, snack)
- Form validation with React Hook Form

### State Management
```typescript
const { register, handleSubmit, formState: { errors } } = useForm<MealFormData>();
const [foodSuggestions, setFoodSuggestions] = useState<FoodItem[]>([]);
const [isLoading, setIsLoading] = useState(false);
```

---

## 🏋️ WorkoutForm Component

### Overview
Workout logging form with exercise selection, duration tracking, and calorie burn calculation.

### Features
- Exercise database integration
- Duration and intensity tracking
- Automatic calorie burn calculation
- Workout history

---

## 📱 BarcodeScanner Component

### Overview
Barcode scanning component for quick food item lookup and nutrition data retrieval.

### Implementation Status
- ⚠️ **In Development** - API endpoints prepared
- Uses device camera for barcode scanning
- Integrates with nutrition databases

### Planned Features
- Real-time barcode detection
- Nutrition data lookup
- Quick meal entry from scanned items

---

## 🖼️ ImageAnalyzer Component

### Overview
AI-powered image analysis for calorie estimation from food photos.

### Implementation Status
- ⚠️ **In Development** - OpenAI integration ready
- Image upload and processing
- Calorie estimation with confidence scores

### Planned Features
- Food recognition from images
- Portion size estimation
- Nutritional breakdown prediction

---

## 🤖 AIEstimator Component

### Overview
OpenAI-powered component for intelligent calorie and nutrition estimation.

### Features
- Missing nutrition data estimation
- Meal suggestion based on preferences
- Smart recipe recommendations

### API Integration
```typescript
const estimateNutrition = async (foodDescription: string) => {
  const response = await fetch('/api/openai/estimate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ description: foodDescription })
  });
  return response.json();
};
```

---

## 🔍 RecipeSearch Component

### Overview
Advanced recipe search with filtering, sorting, and integration with TheMealDB API.

### Features
- Text-based recipe search
- Category and cuisine filtering
- Dietary restriction filters
- Recipe favoriting and saving

### Search Implementation
```typescript
const searchRecipes = async (query: string, filters: SearchFilters) => {
  const response = await fetch('/api/recipes/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, filters })
  });
  return response.json();
};
```

---

## 🏠 Layout Component

### Overview
Main application layout with responsive sidebar navigation and user session management.

### Features
- Responsive sidebar navigation
- User authentication state
- Page routing and active state management
- Mobile-friendly hamburger menu

### Navigation Structure
```typescript
const navigationItems = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Meals', href: '/meals', icon: Utensils },
  { name: 'Recipes', href: '/recipes', icon: BookOpen },
  { name: 'Workouts', href: '/workouts', icon: Dumbbell },
  { name: 'Shopping', href: '/shopping', icon: ShoppingCart },
  { name: 'Profile', href: '/profile', icon: User }
];
```

---

## 📋 RecipeCard Component

### Overview
Reusable card component for displaying recipe previews in lists and grids.

### Features
- Recipe thumbnail display
- Quick info (calories, time, servings)
- Favorite toggle
- Click-to-open modal integration

### Props
```typescript
interface RecipeCardProps {
  recipe: Recipe;
  onSelect: (recipe: Recipe) => void;
  onFavorite?: (recipeId: string) => void;
  isFavorited?: boolean;
}
```

---

## 🎨 Styling Guidelines

### Color Scheme
- **Primary**: Blue tones for main actions
- **Secondary**: Gray tones for secondary elements
- **Success**: Green for positive actions
- **Warning**: Yellow for caution states
- **Error**: Red for error states

### Component Patterns
- Consistent spacing using Tailwind's spacing scale
- Rounded corners (rounded-lg) for cards and modals
- Shadow usage for depth (shadow-sm, shadow-md)
- Hover states for interactive elements

### Responsive Design
- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Touch-friendly button sizes (min 44px height)
- Proper text scaling across devices

---

## 🧪 Testing Guidelines

### Component Testing
- Unit tests for individual components
- Integration tests for component interactions
- Accessibility testing with screen readers
- Mobile device testing

### Test Coverage Goals
- Components: 80%+ coverage
- API routes: 90%+ coverage
- Critical user flows: 100% coverage

---

## 🔄 State Management

### Context Usage
- **LanguageContext**: Multi-language support
- **AuthContext**: User authentication state
- **ThemeContext**: Dark/light mode (planned)

### Local State Patterns
- Form state with React Hook Form
- Modal state with boolean toggles
- Loading states for async operations
- Error state management with try/catch

---

## 📱 Mobile Considerations

### Touch Interactions
- Swipe gestures for navigation
- Pull-to-refresh on data lists
- Touch-friendly form inputs
- Proper keyboard handling

### Performance
- Image lazy loading
- Component code splitting
- API response caching
- Optimistic UI updates

---

## 🔐 Security Considerations

### Component Security
- Input sanitization in forms
- XSS prevention in dynamic content
- CSRF protection in forms
- Secure image upload handling

### Authentication Integration
- Protected route components
- Session state management
- Automatic logout on session expiry
- Role-based component rendering
