import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth/[...nextauth]';
import connectToDatabase from '@/lib/mongodb';
import Expense from '@/models/Expense';
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

const validateBillItems = (items: any[]): { valid: boolean; error?: string } => {
  if (!Array.isArray(items)) {
    return { valid: false, error: 'A számlaelemeknek tömbnek kell lenniük' };
  }
  
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (!item.name || typeof item.name !== 'string' || item.name.trim() === '') {
      return { valid: false, error: `A számlaelem nevének kötelező (elem ${i + 1})` };
    }
    const price = parseFloat(item.price);
    if (isNaN(price) || price < 0) {
      return { valid: false, error: `A számlaelem árának pozitív számnak kell lennie (elem ${i + 1})` };
    }
    if (item.quantity !== undefined) {
      const quantity = parseFloat(item.quantity);
      if (isNaN(quantity) || quantity <= 0) {
        return { valid: false, error: `A számlaelem mennyiségének pozitív számnak kell lennie (elem ${i + 1})` };
      }
    }
  }
  return { valid: true };
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    console.log(`[Expenses API] ${req.method} request received`);
    
    // Connect to database first
    await connectToDatabase();
    
    const tokenUser = getUserFromToken(req);
    const session = await getServerSession(req, res, authOptions);
    
    const userEmail = tokenUser?.email || session?.user?.email;
    
    if (!userEmail) {
      console.log('[Expenses API] Unauthorized: No user email found');
      return res.status(401).json({ success: false, message: 'Nincs jogosultság' });
    }

    const user = await User.findOne({ email: userEmail });
    if (!user) {
      console.log(`[Expenses API] User not found: ${userEmail}`);
      return res.status(404).json({ success: false, message: 'Felhasználó nem található' });
    }

    console.log(`[Expenses API] User authenticated: ${user.email} (${user._id})`);

    if (req.method === 'GET') {
      const { startDate, endDate, category } = req.query;
      console.log('[Expenses API] GET - Query params:', { startDate, endDate, category });
      
      let query: any = { userId: user._id };
      
      if (startDate || endDate) {
        query.date = {};
        if (startDate) query.date.$gte = new Date(startDate as string);
        if (endDate) query.date.$lte = new Date(endDate as string);
      }
      
      if (category) {
        query.category = category;
      }

      const expenses = await Expense.find(query)
        .sort({ date: -1, createdAt: -1 })
        .limit(100);

      console.log(`[Expenses API] GET - Found ${expenses.length} expenses`);
      return res.status(200).json({ success: true, data: expenses });
    } else if (req.method === 'POST') {
      const { 
        amount, 
        category, 
        description, 
        date, 
        billImageUrl, 
        extractedItems, 
        billItems,
        isBill,
        location, 
        paymentMethod 
      } = req.body;

      console.log('[Expenses API] POST - Creating expense:', { 
        amount, 
        category, 
        description, 
        isBill, 
        billItemsCount: billItems?.length || 0 
      });

      // Comprehensive validation
      const amountValidation = validateAmount(amount);
      if (!amountValidation.valid) {
        console.log('[Expenses API] POST - Validation failed: amount');
        return res.status(400).json({ success: false, message: amountValidation.error });
      }

      const categoryValidation = validateRequiredString(category, 'kategória');
      if (!categoryValidation.valid) {
        console.log('[Expenses API] POST - Validation failed: category');
        return res.status(400).json({ success: false, message: categoryValidation.error });
      }

      const descriptionValidation = validateRequiredString(description, 'leírás');
      if (!descriptionValidation.valid) {
        console.log('[Expenses API] POST - Validation failed: description');
        return res.status(400).json({ success: false, message: descriptionValidation.error });
      }

      const dateValidation = validateDate(date);
      if (!dateValidation.valid) {
        console.log('[Expenses API] POST - Validation failed: date');
        return res.status(400).json({ success: false, message: dateValidation.error });
      }

      const paymentMethodValidation = validatePaymentMethod(paymentMethod);
      if (!paymentMethodValidation.valid) {
        console.log('[Expenses API] POST - Validation failed: paymentMethod');
        return res.status(400).json({ success: false, message: paymentMethodValidation.error });
      }

      // Validate bill items if provided
      if (billItems && billItems.length > 0) {
        const billItemsValidation = validateBillItems(billItems);
        if (!billItemsValidation.valid) {
          console.log('[Expenses API] POST - Validation failed: billItems');
          return res.status(400).json({ success: false, message: billItemsValidation.error });
        }
      }

      // Calculate total amount from billItems if provided
      let finalAmount = parseFloat(amount);
      if (billItems && billItems.length > 0) {
        finalAmount = billItems.reduce((sum: number, item: any) => {
          return sum + (parseFloat(item.price) * (item.quantity || 1));
        }, 0);
        console.log(`[Expenses API] POST - Calculated amount from billItems: ${finalAmount}`);
      }

      const expenseData = {
        userId: user._id,
        amount: finalAmount,
        category: category.trim(),
        description: description.trim(),
        date: date ? new Date(date) : new Date(),
        billImageUrl,
        extractedItems,
        billItems,
        isBill: isBill || false,
        location: location?.trim(),
        paymentMethod: paymentMethod || 'cash',
      };
      
      const expense = await Expense.create(expenseData);
      console.log(`[Expenses API] POST - Expense created successfully: ${expense._id}`);

      return res.status(201).json({ success: true, data: expense });
    } else if (req.method === 'PUT') {
      const { id } = req.query;
      const { amount, billItems } = req.body;

      console.log(`[Expenses API] PUT - Updating expense: ${id}`);

      if (!id) {
        console.log('[Expenses API] PUT - Missing expense ID');
        return res.status(400).json({ success: false, message: 'A kiadás azonosítója kötelező' });
      }

      const updateData: any = {};
      if (amount !== undefined) updateData.amount = parseFloat(amount);
      if (billItems !== undefined) updateData.billItems = billItems;

      console.log('[Expenses API] PUT - Update data:', updateData);

      const expense = await Expense.findOneAndUpdate(
        { _id: id, userId: user._id },
        updateData,
        { new: true }
      );

      if (!expense) {
        console.log(`[Expenses API] PUT - Expense not found: ${id}`);
        return res.status(404).json({ success: false, message: 'Kiadás nem található' });
      }

      console.log(`[Expenses API] PUT - Expense updated successfully: ${expense._id}`);
      return res.status(200).json({ success: true, data: expense });
    } else if (req.method === 'DELETE') {
      const { id } = req.query;

      console.log(`[Expenses API] DELETE - Deleting expense: ${id}`);

      if (!id) {
        console.log('[Expenses API] DELETE - Missing expense ID');
        return res.status(400).json({ success: false, message: 'A kiadás azonosítója kötelező' });
      }

      const expense = await Expense.findOneAndDelete({
        _id: id,
        userId: user._id
      });

      if (!expense) {
        console.log(`[Expenses API] DELETE - Expense not found: ${id}`);
        return res.status(404).json({ success: false, message: 'Kiadás nem található' });
      }

      console.log(`[Expenses API] DELETE - Expense deleted successfully: ${id}`);
      return res.status(200).json({ success: true, message: 'Kiadás sikeresen törölve' });
    } else {
      console.log(`[Expenses API] Method not allowed: ${req.method}`);
      return res.status(405).json({ success: false, message: 'A metódus nem engedélyezett' });
    }
  } catch (error) {
    console.error('[Expenses API] Error:', error);
    return res.status(500).json({ success: false, message: 'Szerver hiba történt' });
  }
}
