import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth/[...nextauth]';
import connectToDatabase from '@/lib/mongodb';
import Income from '@/models/Income';
import User from '@/models/User';
import { getUserFromToken } from '@/utils/auth';

// Validation helper functions
const validateAmount = (amount: any): { valid: boolean; error?: string } => {
  const numAmount = parseFloat(amount);
  if (isNaN(numAmount) || numAmount <= 0) {
    return { valid: false, error: 'Az összegnek pozitív számnak kell lennie' };
  }
  return { valid: true };
};

const validateRequiredString = (value: any, fieldName: string): { valid: boolean; error?: string } => {
  if (!value || typeof value !== 'string' || value.trim() === '') {
    return { valid: false, error: `A ${fieldName} mező kötelező` };
  }
  return { valid: true };
};

const validateDate = (date: any): { valid: boolean; error?: string } => {
  if (!date) {
    return { valid: true }; // Optional, will use current date
  }
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) {
    return { valid: false, error: 'Érvénytelen dátum formátum' };
  }
  return { valid: true };
};

const validatePaymentMethod = (method: any): { valid: boolean; error?: string } => {
  const validMethods = ['cash', 'card', 'transfer'];
  if (method && !validMethods.includes(method)) {
    return { valid: false, error: 'A fizetési mód csak "cash", "card", vagy "transfer" lehet' };
  }
  return { valid: true };
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    console.log(`[Income API] ${req.method} request received`);
    
    // Connect to database first
    await connectToDatabase();
    
    const tokenUser = getUserFromToken(req);
    const session = await getServerSession(req, res, authOptions);
    
    const userEmail = tokenUser?.email || session?.user?.email;
    
    if (!userEmail) {
      console.log('[Income API] Unauthorized: No user email found');
      return res.status(401).json({ success: false, message: 'Nincs jogosultság' });
    }

    const user = await User.findOne({ email: userEmail });

    if (!user) {
      console.log(`[Income API] User not found: ${userEmail}`);
      return res.status(404).json({ success: false, message: 'Felhasználó nem található' });
    }

    console.log(`[Income API] User authenticated: ${user.email} (${user._id})`);

    if (req.method === 'GET') {
      const { startDate, endDate, category } = req.query;
      console.log('[Income API] GET - Query params:', { startDate, endDate, category });
      
      let query: any = { userId: user._id };
      
      if (startDate || endDate) {
        query.date = {};
        if (startDate) query.date.$gte = new Date(startDate as string);
        if (endDate) query.date.$lte = new Date(endDate as string);
      }
      
      if (category) {
        query.category = category;
      }

      const income = await Income.find(query)
        .sort({ date: -1, createdAt: -1 })
        .limit(100);

      console.log(`[Income API] GET - Found ${income.length} income entries`);
      return res.status(200).json({ success: true, data: income });
    } else if (req.method === 'POST') {
      const { amount, category, description, date, location, paymentMethod, source } = req.body;

      console.log('[Income API] POST - Creating income:', { amount, category, description, paymentMethod });

      // Comprehensive validation
      const amountValidation = validateAmount(amount);
      if (!amountValidation.valid) {
        console.log('[Income API] POST - Validation failed: amount');
        return res.status(400).json({ success: false, message: amountValidation.error });
      }

      const categoryValidation = validateRequiredString(category, 'kategória');
      if (!categoryValidation.valid) {
        console.log('[Income API] POST - Validation failed: category');
        return res.status(400).json({ success: false, message: categoryValidation.error });
      }

      const descriptionValidation = validateRequiredString(description, 'leírás');
      if (!descriptionValidation.valid) {
        console.log('[Income API] POST - Validation failed: description');
        return res.status(400).json({ success: false, message: descriptionValidation.error });
      }

      const dateValidation = validateDate(date);
      if (!dateValidation.valid) {
        console.log('[Income API] POST - Validation failed: date');
        return res.status(400).json({ success: false, message: dateValidation.error });
      }

      const paymentMethodValidation = validatePaymentMethod(paymentMethod);
      if (!paymentMethodValidation.valid) {
        console.log('[Income API] POST - Validation failed: paymentMethod');
        return res.status(400).json({ success: false, message: paymentMethodValidation.error });
      }

      const income = await Income.create({
        userId: user._id,
        amount: parseFloat(amount),
        category: category.trim(),
        description: description.trim(),
        date: date ? new Date(date) : new Date(),
        location: location?.trim(),
        paymentMethod: paymentMethod || 'cash',
        source: source?.trim(),
      });

      console.log(`[Income API] POST - Income created successfully: ${income._id}`);
      return res.status(201).json({ success: true, data: income });
    } else if (req.method === 'PUT') {
      const { id } = req.query;
      const { amount, category, description, date, location, paymentMethod, source } = req.body;

      console.log(`[Income API] PUT - Updating income: ${id}`);

      if (!id) {
        console.log('[Income API] PUT - Missing income ID');
        return res.status(400).json({ success: false, message: 'A bevétel azonosítója kötelező' });
      }

      const updateData: any = {};
      if (amount !== undefined) updateData.amount = parseFloat(amount);
      if (category !== undefined) updateData.category = category.trim();
      if (description !== undefined) updateData.description = description.trim();
      if (date !== undefined) updateData.date = new Date(date);
      if (location !== undefined) updateData.location = location?.trim();
      if (paymentMethod !== undefined) updateData.paymentMethod = paymentMethod;
      if (source !== undefined) updateData.source = source?.trim();

      console.log('[Income API] PUT - Update data:', updateData);

      const income = await Income.findOneAndUpdate(
        { _id: id, userId: user._id },
        updateData,
        { new: true }
      );

      if (!income) {
        console.log(`[Income API] PUT - Income not found: ${id}`);
        return res.status(404).json({ success: false, message: 'Bevétel nem található' });
      }

      console.log(`[Income API] PUT - Income updated successfully: ${income._id}`);
      return res.status(200).json({ success: true, data: income });
    } else if (req.method === 'DELETE') {
      const { id } = req.query;

      console.log(`[Income API] DELETE - Deleting income: ${id}`);

      if (!id) {
        console.log('[Income API] DELETE - Missing income ID');
        return res.status(400).json({ success: false, message: 'A bevétel azonosítója kötelező' });
      }

      const income = await Income.findOneAndDelete({
        _id: id,
        userId: user._id
      });

      if (!income) {
        console.log(`[Income API] DELETE - Income not found: ${id}`);
        return res.status(404).json({ success: false, message: 'Bevétel nem található' });
      }

      console.log(`[Income API] DELETE - Income deleted successfully: ${id}`);
      return res.status(200).json({ success: true, message: 'Bevétel sikeresen törölve' });
    } else {
      console.log(`[Income API] Method not allowed: ${req.method}`);
      return res.status(405).json({ success: false, message: 'A metódus nem engedélyezett' });
    }
  } catch (error) {
    console.error('[Income API] Error:', error);
    return res.status(500).json({ success: false, message: 'Szerver hiba történt' });
  }
}
