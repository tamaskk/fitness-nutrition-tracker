import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import connectToDatabase from '@/lib/mongodb';
import Expense from '@/models/Expense';
import Income from '@/models/Income';
import User from '@/models/User';
import { getUserFromToken } from '@/utils/auth';

// Helper function to get week number
function getWeekNumber(date: Date): number {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

// Helper function to get month name in Hungarian
function getMonthName(monthIndex: number): string {
  const monthNames = [
    'Január', 'Február', 'Március', 'Április', 'Május', 'Június',
    'Július', 'Augusztus', 'Szeptember', 'Október', 'November', 'December'
  ];
  return monthNames[monthIndex];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    console.log(`[Finance Summary API] ${req.method} request received`);
    
    // Connect to database first
    await connectToDatabase();
    
    const tokenUser = getUserFromToken(req);
    const session = await getServerSession(req, res, authOptions);
    
    const userEmail = tokenUser?.email || session?.user?.email;
    
    if (!userEmail) {
      console.log('[Finance Summary API] Unauthorized: No user email found');
      return res.status(401).json({ success: false, message: 'Nincs jogosultság' });
    }

    const user = await User.findOne({ email: userEmail });
    if (!user) {
      console.log(`[Finance Summary API] User not found: ${userEmail}`);
      return res.status(404).json({ success: false, message: 'Felhasználó nem található' });
    }

    console.log(`[Finance Summary API] User authenticated: ${user.email} (${user._id})`);

    if (req.method === 'GET') {
      const { period = 'month', year, month, week } = req.query;
      console.log('[Finance Summary API] GET - Query params:', { period, year, month, week });
      
      // Calculate date range based on period and specific date
      let startDate: Date;
      let endDate: Date;
      
      if (year && month && period === 'month') {
        // Specific month
        const targetYear = parseInt(year as string);
        const targetMonth = parseInt(month as string) - 1; // JavaScript months are 0-indexed
        startDate = new Date(targetYear, targetMonth, 1);
        endDate = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59, 999);
      } else if (year && week && period === 'week') {
        // Specific week
        const targetYear = parseInt(year as string);
        const targetWeek = parseInt(week as string);
        const firstDayOfYear = new Date(targetYear, 0, 1);
        const daysToAdd = (targetWeek - 1) * 7;
        startDate = new Date(firstDayOfYear.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
        endDate = new Date(startDate.getTime() + 6 * 24 * 60 * 60 * 1000 + 23 * 60 * 60 * 1000 + 59 * 60 * 1000 + 59 * 1000 + 999);
      } else if (year && period === 'year') {
        // Specific year
        const targetYear = parseInt(year as string);
        startDate = new Date(targetYear, 0, 1);
        endDate = new Date(targetYear, 11, 31, 23, 59, 59, 999);
      } else {
        // Current period (default behavior)
        const now = new Date();
        switch (period) {
          case 'week':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            endDate = now;
            break;
          case 'month':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            endDate = now;
            break;
          case 'year':
            startDate = new Date(now.getFullYear(), 0, 1);
            endDate = now;
            break;
          default:
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            endDate = now;
        }
      }

      console.log(`[Finance Summary API] Date range: ${startDate.toISOString()} to ${endDate.toISOString()}`);

      // Get expenses and income for the period
      const [expenses, income] = await Promise.all([
        Expense.find({
          userId: user._id,
          date: { $gte: startDate, $lte: endDate }
        }),
        Income.find({
          userId: user._id,
          date: { $gte: startDate, $lte: endDate }
        })
      ]);

      console.log(`[Finance Summary API] Found ${expenses.length} expenses and ${income.length} income entries for period`);

      // Calculate totals
      const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
      const totalIncome = income.reduce((sum, inc) => sum + inc.amount, 0);
      const balance = totalIncome - totalExpenses;

      console.log(`[Finance Summary API] Totals - Income: ${totalIncome}, Expenses: ${totalExpenses}, Balance: ${balance}`);

      // Group by category
      const expensesByCategory = expenses.reduce((acc, expense) => {
        acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
        return acc;
      }, {} as Record<string, number>);

      const incomeByCategory = income.reduce((acc, inc) => {
        acc[inc.category] = (acc[inc.category] || 0) + inc.amount;
        return acc;
      }, {} as Record<string, number>);

      // Get recent transactions
      const recentTransactions = [
        ...expenses.map(expense => ({
          type: 'expense',
          id: expense._id,
          amount: expense.amount,
          category: expense.category,
          description: expense.description,
          date: expense.date,
        })),
        ...income.map(inc => ({
          type: 'income',
          id: inc._id,
          amount: inc.amount,
          category: inc.category,
          description: inc.description,
          date: inc.date,
        }))
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);

      // Calculate monthly trend for the last 6 months
      console.log('[Finance Summary API] Calculating monthly trend for last 6 months...');
      const monthlyTrend = [];
      const now = new Date();
      
      for (let i = 5; i >= 0; i--) {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
        const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0, 23, 59, 59, 999);
        
        const [monthExpenses, monthIncome] = await Promise.all([
          Expense.find({
            userId: user._id,
            date: { $gte: monthStart, $lte: monthEnd }
          }),
          Income.find({
            userId: user._id,
            date: { $gte: monthStart, $lte: monthEnd }
          })
        ]);
        
        const expenseTotal = monthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
        const incomeTotal = monthIncome.reduce((sum, inc) => sum + inc.amount, 0);
        
        monthlyTrend.push({
          month: getMonthName(monthDate.getMonth()),
          year: monthDate.getFullYear(),
          monthIndex: monthDate.getMonth(),
          income: incomeTotal,
          expenses: expenseTotal,
          balance: incomeTotal - expenseTotal,
        });
      }

      console.log(`[Finance Summary API] Monthly trend calculated: ${monthlyTrend.length} months`);

      // Prepare comparison data
      const comparisonData = {
        income: totalIncome,
        expenses: totalExpenses,
        balance: balance,
      };

      console.log('[Finance Summary API] Sending summary response');
      return res.status(200).json({
        success: true,
        data: {
          totalExpenses,
          totalIncome,
          balance,
          expensesByCategory,
          incomeByCategory,
          monthlyTrend,
          comparisonData,
          recentTransactions,
          period,
          startDate,
          endDate,
          currentPeriod: {
            year: year ? parseInt(year as string) : new Date().getFullYear(),
            month: month ? parseInt(month as string) : new Date().getMonth() + 1,
            week: week ? parseInt(week as string) : getWeekNumber(new Date()),
          },
        },
      });
    } else {
      console.log(`[Finance Summary API] Method not allowed: ${req.method}`);
      return res.status(405).json({ success: false, message: 'A metódus nem engedélyezett' });
    }
  } catch (error) {
    console.error('[Finance Summary API] Error:', error);
    return res.status(500).json({ success: false, message: 'Szerver hiba történt' });
  }
}
