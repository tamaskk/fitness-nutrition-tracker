import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import connectToDatabase from '@/lib/mongodb';
import Expense from '@/models/Expense';
import Income from '@/models/Income';

// Helper function to get week number
function getWeekNumber(date: Date): number {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    await connectToDatabase();

    if (req.method === 'GET') {
      const { period = 'month', year, month, week } = req.query;
      
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

      // Get expenses and income for the period
      const [expenses, income] = await Promise.all([
        Expense.find({
          userId: session.user.id,
          date: { $gte: startDate, $lte: endDate }
        }),
        Income.find({
          userId: session.user.id,
          date: { $gte: startDate, $lte: endDate }
        })
      ]);

      // Calculate totals
      const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
      const totalIncome = income.reduce((sum, inc) => sum + inc.amount, 0);
      const balance = totalIncome - totalExpenses;

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

      res.status(200).json({
        totalExpenses,
        totalIncome,
        balance,
        expensesByCategory,
        incomeByCategory,
        recentTransactions,
        period,
        startDate,
        endDate,
        currentPeriod: {
          year: year ? parseInt(year as string) : new Date().getFullYear(),
          month: month ? parseInt(month as string) : new Date().getMonth() + 1,
          week: week ? parseInt(week as string) : getWeekNumber(new Date()),
        },
      });
    } else {
      res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Finance summary API error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
