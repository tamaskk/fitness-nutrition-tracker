import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';

export async function getOrCreateAdminUser() {
  await connectToDatabase();
  
  // Get or create admin user for sentBy field
  let adminUser = await User.findOne({ email: process.env.ADMIN_EMAIL });
  if (!adminUser) {
    // Create admin user if it doesn't exist
    adminUser = new User({
      email: process.env.ADMIN_EMAIL,
      firstName: 'Admin',
      lastName: 'User',
      passwordHash: 'admin-placeholder', // This won't be used for login
      country: 'US',
      language: 'en',
      preferences: {
        mealPlans: true,
        recipes: true,
        trainings: true,
        shoppingList: true,
        priceMonitor: true,
        finance: true,
      },
      birthday: new Date('1990-01-01'),
      createdAt: new Date(),
    });
    await adminUser.save();
  }
  
  return adminUser;
}
