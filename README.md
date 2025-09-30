# Fitness & Nutrition Tracker

A comprehensive web application for tracking daily calorie intake, logging meals and workouts, exploring recipes, and managing shopping lists. Built with Next.js, TypeScript, MongoDB, and NextAuth.js.

## Features

### Core Features ✅
- **User Authentication**: Complete signup/login system with NextAuth.js and secure sessions
- **Dashboard**: Interactive daily summary with calories consumed vs burned, progress tracking
- **Meal Tracking**: Full meal logging with food search, calorie calculation, and CRUD operations
- **Recipe System**: Recipe search with mock data, save recipes, add to meals, ingredient management
- **Workout Tracking**: Complete exercise database, workout logging with calorie burn calculation
- **Shopping Lists**: Full shopping list management with add/remove/purchase tracking
- **Responsive UI**: Modern, mobile-friendly design with TailwindCSS and Lucide icons
- **Database Integration**: Complete MongoDB integration with all data models

### Smart Features (Ready for Integration) 🚧
- **Food Search APIs**: Structure ready for USDA, Nutritionix, Edamam integration
- **Barcode Scanning**: API endpoints prepared for barcode food lookup
- **AI Integration**: OpenAI integration points for calorie estimation
- **Advanced Analytics**: Chart components ready for weekly/monthly data visualization
- **Social Features**: Foundation for recipe sharing and workout plans

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, TailwindCSS v4
- **Backend**: Next.js API Routes, MongoDB with Mongoose
- **Authentication**: NextAuth.js with JWT sessions
- **UI Components**: Lucide React icons, React Hook Form
- **Styling**: TailwindCSS with custom color scheme
- **Notifications**: React Hot Toast

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- MongoDB Atlas account (or local MongoDB)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd goal
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   # MongoDB
   MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/fitness-tracker?retryWrites=true&w=majority

   # NextAuth
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-nextauth-secret-here

   # External APIs (Optional - app works with free APIs and fallbacks)
   # Nutritionix API for food data (optional)
   NUTRITIONIX_APP_ID=your-nutritionix-app-id
   NUTRITIONIX_API_KEY=your-nutritionix-api-key
   
   # OpenAI API for AI features (optional)
   OPENAI_API_KEY=your-openai-api-key
   
   # Note: Recipe search uses TheMealDB API (completely free, no key needed)
   ```

4. **Generate NextAuth secret**
   ```bash
   openssl rand -base64 32
   ```

5. **Set up MongoDB**
   - Create a MongoDB Atlas account at https://mongodb.com/atlas
   - Create a new cluster and database
   - Get your connection string and add it to `.env.local`

6. **Initialize the database (optional)**
   ```bash
   # After setting up MongoDB, initialize with demo data
   curl -X POST http://localhost:3001/api/init
   ```

7. **Run the development server**
   ```bash
   npm run dev
   ```

8. **Open your browser**
   Navigate to [http://localhost:3001](http://localhost:3001) (or the port shown in terminal)

## Project Structure

```
src/
├── components/          # Reusable UI components
│   └── Layout.tsx      # Main app layout with sidebar
├── lib/                # Utility libraries
│   └── mongodb.ts      # Database connection
├── models/             # Mongoose schemas
│   ├── User.ts
│   ├── MealEntry.ts
│   ├── Recipe.ts
│   ├── Exercise.ts
│   └── WorkoutEntry.ts
├── pages/              # Next.js pages
│   ├── api/           # API routes
│   ├── index.tsx      # Dashboard
│   ├── login.tsx      # Login page
│   ├── signup.tsx     # Registration page
│   ├── meals.tsx      # Meal tracking
│   └── ...
├── styles/            # Global styles
├── types/             # TypeScript type definitions
└── utils/             # Helper functions
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User login (NextAuth)
- `GET /api/auth/session` - Get current session

### Data
- `GET /api/summary?date=YYYY-MM-DD` - Daily summary
- `GET /api/meals?date=YYYY-MM-DD` - Get meals for date
- `POST /api/meals` - Create new meal entry
- `DELETE /api/meals?id=<meal-id>` - Delete meal entry

## Data Models

### User
- Email, password, name
- Physical stats (age, gender, weight, height)
- Daily calorie goal

### MealEntry
- User reference, date, meal type
- Food name, quantity, calories
- Macros (protein, carbs, fat)

### Recipe (Coming Soon)
- Title, ingredients, steps
- Calories per serving, prep/cook time
- Tags for categorization

### Exercise & WorkoutEntry (Coming Soon)
- Exercise database with calorie calculations
- Workout logging with sets, reps, duration

## Contributing

This is a learning project. Feel free to:
- Report bugs or suggest features
- Submit pull requests
- Share feedback on the user experience

## Development Roadmap

### Phase 1 ✅ - Foundation
- [x] Next.js setup with TypeScript and TailwindCSS
- [x] MongoDB integration with Mongoose
- [x] NextAuth.js authentication
- [x] Complete responsive UI with modern design

### Phase 2 ✅ - Core Features
- [x] Complete meal tracking with food search and calorie calculation
- [x] Recipe system with search, filtering, and meal integration
- [x] Full workout tracking with exercise database
- [x] Shopping list management with recipe integration

### Phase 3 📋 - Smart Features
- [ ] Barcode scanning
- [ ] Image recognition for calorie estimation
- [ ] OpenAI integration for missing nutrition data
- [ ] Shopping list management

### Phase 4 📋 - Advanced Features
- [ ] Data visualization with charts
- [ ] Export functionality (CSV/PDF)
- [ ] Social features and sharing
- [ ] Mobile app considerations

## License

This project is for educational purposes. Feel free to use and modify as needed.

## Support

For questions or issues, please create an issue in the GitHub repository.