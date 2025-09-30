#!/bin/bash

# Environment Variables Setup Script for Vercel
echo "🔧 Setting up Environment Variables for Vercel Deployment"
echo "========================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}📋 Step 1: Generate NextAuth Secret${NC}"
echo "Run this command to generate a secure secret:"
echo -e "${GREEN}openssl rand -base64 32${NC}"
echo ""
echo "Copy the output and use it as your NEXTAUTH_SECRET"
echo ""

echo -e "${BLUE}🗄️ Step 2: Set up MongoDB Atlas${NC}"
echo "1. Go to https://mongodb.com/atlas"
echo "2. Create a free account and cluster"
echo "3. Create a database user with read/write permissions"
echo "4. Get your connection string"
echo "5. Replace <username>, <password>, and <cluster> in the connection string"
echo ""

echo -e "${BLUE}⚙️ Step 3: Add Environment Variables to Vercel${NC}"
echo "1. Go to: https://vercel.com/tamas-krisztian-kalmans-projects/fitness-nutrition-tracker"
echo "2. Click on 'Settings' tab"
echo "3. Click on 'Environment Variables'"
echo "4. Add these REQUIRED variables:"
echo ""
echo -e "${YELLOW}Required Variables:${NC}"
echo "MONGODB_URI = mongodb+srv://username:password@cluster.mongodb.net/fitness-tracker?retryWrites=true&w=majority"
echo "NEXTAUTH_URL = https://fitness-nutrition-tracker-2cs3szgtn.vercel.app"
echo "NEXTAUTH_SECRET = [your-generated-secret-from-step-1]"
echo ""

echo -e "${YELLOW}Optional Variables (for enhanced features):${NC}"
echo "NUTRITIONIX_APP_ID = [your-nutritionix-app-id]"
echo "NUTRITIONIX_API_KEY = [your-nutritionix-api-key]"
echo "OPENAI_API_KEY = [your-openai-api-key]"
echo ""

echo -e "${BLUE}🚀 Step 4: Redeploy After Adding Variables${NC}"
echo "After adding environment variables, redeploy your app:"
echo -e "${GREEN}vercel --prod${NC}"
echo ""

echo -e "${BLUE}🧪 Step 5: Test Your Deployment${NC}"
echo "1. Visit: https://fitness-nutrition-tracker-2cs3szgtn.vercel.app"
echo "2. Try to sign up for a new account"
echo "3. Test meal tracking, recipes, and workouts"
echo ""

echo -e "${GREEN}✅ Environment Setup Complete!${NC}"
echo "Your Fitness & Nutrition Tracker should now be fully functional."
echo ""
echo -e "${YELLOW}💡 Pro Tips:${NC}"
echo "- Make sure to select 'Production', 'Preview', and 'Development' for each environment variable"
echo "- Use strong passwords for your MongoDB user"
echo "- Keep your API keys secure and never commit them to Git"
echo ""
echo -e "${BLUE}📖 For detailed instructions, check:${NC}"
echo "- DEPLOYMENT_SUCCESS.md"
echo "- env-template.txt"
echo ""
echo "Happy deploying! 🎉"
