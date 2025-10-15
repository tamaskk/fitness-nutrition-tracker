import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { Expense, Income } from '@/types';
import { 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar,
  Upload,
  Camera,
  PieChart,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Home
} from 'lucide-react';
import toast from 'react-hot-toast';
import { 
  PieChart as RechartsPieChart, 
  Pie,
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';

const FinancePage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'expenses' | 'income'>('overview');
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<any>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [income, setIncome] = useState<Income[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formType, setFormType] = useState<'expense' | 'income'>('expense');
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');
  const [currentDate, setCurrentDate] = useState(new Date());

  // Form states
  const [formData, setFormData] = useState({
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    location: '',
    paymentMethod: 'cash' as 'cash' | 'card' | 'transfer',
    source: '',
  });
  const [showBillUpload, setShowBillUpload] = useState(false);
  const [billImage, setBillImage] = useState<File | null>(null);
  const [ocrData, setOcrData] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [showBillItems, setShowBillItems] = useState(false);
  const [billItems, setBillItems] = useState<any[]>([]);
  const [expandedExpenses, setExpandedExpenses] = useState<Set<number>>(new Set());
  const [editingExpense, setEditingExpense] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItems, setEditingItems] = useState<any[]>([]);
  const [editingIncome, setEditingIncome] = useState<any>(null);
  const [showIncomeEditModal, setShowIncomeEditModal] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/login');
      return;
    }

    fetchData();
  }, [session, status, router, period, currentDate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Build query parameters for specific date
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      const week = getWeekNumber(currentDate);
      
      let summaryUrl = `/api/finance/summary?period=${period}&year=${year}`;
      if (period === 'month') {
        summaryUrl += `&month=${month}`;
      } else if (period === 'week') {
        summaryUrl += `&week=${week}`;
      }

      const [summaryRes, expensesRes, incomeRes] = await Promise.all([
        fetch(summaryUrl),
        fetch('/api/expenses'),
        fetch('/api/income')
      ]);

      if (summaryRes.ok) {
        const summaryData = await summaryRes.json();
        setSummary(summaryData);
      }

      if (expensesRes.ok) {
        const expensesData = await expensesRes.json();
        // Sort expenses by creation date (newest first)
        const sortedExpenses = expensesData.sort((a: any, b: any) => {
          const dateA = new Date(a.createdAt || a.date);
          const dateB = new Date(b.createdAt || b.date);
          return dateB.getTime() - dateA.getTime();
        });
        setExpenses(sortedExpenses);
      }

      if (incomeRes.ok) {
        const incomeData = await incomeRes.json();
        setIncome(incomeData);
      }
    } catch (error) {
      console.error('Error fetching finance data:', error);
      toast.error('Nem sikerült az adatok betöltése');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.amount || !formData.category || !formData.description) {
      toast.error('Minden mező kitöltése kötelező');
      return;
    }

    try {
      const endpoint = formType === 'expense' ? '/api/expenses' : '/api/income';
      
      // If we have bill items and this is an expense, save as one grouped expense
      if (billItems.length > 0 && formType === 'expense') {
        const itemsTotal = billItems.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: itemsTotal || formData.amount,
            category: formData.category,
            description: formData.description,
            date: formData.date,
            location: formData.location,
            paymentMethod: formData.paymentMethod,
            billItems: billItems, // Include bill items in the expense
            isBill: true, // Mark as bill expense
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to save bill expense');
        }

        toast.success(`Számla mentve (${billItems.length} tétel)!`);
      } else {
        // Save single expense/income
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          throw new Error('Failed to save');
        }

        toast.success(`${formType === 'expense' ? 'Kiadás' : 'Bevétel'} hozzáadva!`);
      }

      setShowAddForm(false);
      resetForm();
      setBillItems([]);
      setOcrData(null);
      fetchData();
    } catch (error) {
      console.error('Error saving:', error);
      toast.error('Nem sikerült a mentés');
    }
  };

  const resetForm = () => {
    setFormData({
      amount: '',
      category: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      location: '',
      paymentMethod: 'cash',
      source: '',
    });
    setBillItems([]);
    setOcrData(null);
    setShowBillItems(false);
  };

  // Add-form bill item helpers
  const addBillItem = () => {
    setBillItems([...billItems, { name: '', price: 0, quantity: 1 }]);
  };

  const updateBillItem = (index: number, field: string, value: any) => {
    const newItems = [...billItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setBillItems(newItems);
  };

  const deleteBillItem = (index: number) => {
    const newItems = billItems.filter((_, i) => i !== index);
    setBillItems(newItems);
  };

  const toggleExpenseExpansion = (index: number) => {
    const newExpanded = new Set(expandedExpenses);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedExpenses(newExpanded);
  };

  const handleEditExpense = (expense: any) => {
    setEditingExpense(expense);
    setEditingItems(expense.billItems ? [...expense.billItems] : []);
    setShowEditModal(true);
  };

  const handleDeleteExpense = async (expenseId: string) => {
    if (!confirm('Biztosan törölni szeretnéd ezt a kiadást?')) {
      return;
    }

    try {
      const response = await fetch(`/api/expenses?id=${expenseId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete expense');
      }

      toast.success('Kiadás törölve!');
      fetchData();
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast.error('Nem sikerült a törlés');
    }
  };

  const handleSaveEditedExpense = async () => {
    if (!editingExpense) return;

    try {
      // Calculate new total from items
      const newTotal = editingItems.reduce((sum, item) => sum + (item.price || 0), 0);

      const response = await fetch(`/api/expenses?id=${editingExpense._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: newTotal,
          billItems: editingItems,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update expense');
      }

      toast.success('Kiadás frissítve!');
      setShowEditModal(false);
      setEditingExpense(null);
      setEditingItems([]);
      fetchData();
    } catch (error) {
      console.error('Error updating expense:', error);
      toast.error('Nem sikerült a frissítés');
    }
  };

  const handleDeleteItem = (itemIndex: number) => {
    const newItems = editingItems.filter((_, index) => index !== itemIndex);
    setEditingItems(newItems);
  };

  const handleUpdateItem = (itemIndex: number, field: string, value: any) => {
    const newItems = [...editingItems];
    newItems[itemIndex] = { ...newItems[itemIndex], [field]: value };
    setEditingItems(newItems);
  };

  const handleEditIncome = (income: any) => {
    setEditingIncome(income);
    setShowIncomeEditModal(true);
  };

  const handleDeleteIncome = async (incomeId: string) => {
    if (!confirm('Biztosan törölni szeretnéd ezt a bevételeket?')) {
      return;
    }

    try {
      const response = await fetch(`/api/income?id=${incomeId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete income');
      }

      toast.success('Bevétel törölve!');
      fetchData();
    } catch (error) {
      console.error('Error deleting income:', error);
      toast.error('Nem sikerült a törlés');
    }
  };

  const handleSaveEditedIncome = async () => {
    if (!editingIncome) return;

    try {
      const response = await fetch(`/api/income?id=${editingIncome._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: editingIncome.amount,
          category: editingIncome.category,
          description: editingIncome.description,
          date: editingIncome.date,
          source: editingIncome.source,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update income');
      }

      toast.success('Bevétel frissítve!');
      setShowIncomeEditModal(false);
      setEditingIncome(null);
      fetchData();
    } catch (error) {
      console.error('Error updating income:', error);
      toast.error('Nem sikerült a frissítés');
    }
  };

  const handleAddClick = (type: 'expense' | 'income') => {
    setFormType(type);
    setShowAddForm(true);
  };

  const handleBillUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!billImage) {
      toast.error('Kérlek válassz ki egy képet');
      return;
    }

    setUploading(true);
    setOcrProgress(0);
    try {
      const formData = new FormData();
      formData.append('billImage', billImage);

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setOcrProgress(prev => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 10;
        });
      }, 500);

      const response = await fetch('/api/finance/upload-bill', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setOcrProgress(100);

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      setOcrData(result.ocrData);
      
      // Set bill items for individual saving
      if (result.ocrData.items && result.ocrData.items.length > 0) {
        setBillItems(result.ocrData.items);
      }
      
      // Pre-fill form with OCR data
      setFormData(prev => ({
        ...prev,
        amount: result.ocrData.totalAmount.toString(),
        description: `${result.ocrData.merchant} - Sml számla`,
        location: result.ocrData.merchant,
        category: 'Élelmiszer',
      }));
      
      toast.success('Számla feltöltve és elemzve!');
      // Don't close the modal immediately - let user see the results
      // setShowBillUpload(false);
      // setShowAddForm(true);
    } catch (error) {
      console.error('Error uploading bill:', error);
      toast.error('Nem sikerült a számla feltöltése');
    } finally {
      setUploading(false);
      setOcrProgress(0);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBillImage(file);
    }
  };

  // Helper function to get week number
  const getWeekNumber = (date: Date): number => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  // Navigation functions
  const goToPreviousPeriod = () => {
    const newDate = new Date(currentDate);
    switch (period) {
      case 'week':
        newDate.setDate(newDate.getDate() - 7);
        break;
      case 'month':
        newDate.setMonth(newDate.getMonth() - 1);
        break;
      case 'year':
        newDate.setFullYear(newDate.getFullYear() - 1);
        break;
    }
    setCurrentDate(newDate);
  };

  const goToNextPeriod = () => {
    const newDate = new Date(currentDate);
    switch (period) {
      case 'week':
        newDate.setDate(newDate.getDate() + 7);
        break;
      case 'month':
        newDate.setMonth(newDate.getMonth() + 1);
        break;
      case 'year':
        newDate.setFullYear(newDate.getFullYear() + 1);
        break;
    }
    setCurrentDate(newDate);
  };

  const goToCurrentPeriod = () => {
    setCurrentDate(new Date());
  };

  // Format period display
  const getPeriodDisplay = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    const week = getWeekNumber(currentDate);
    
    switch (period) {
      case 'week':
        return `${year}. ${week}. hét`;
      case 'month':
        const monthNames = [
          'Január', 'Február', 'Március', 'Április', 'Május', 'Június',
          'Július', 'Augusztus', 'Szeptember', 'Október', 'November', 'December'
        ];
        return `${year}. ${monthNames[month - 1]}`;
      case 'year':
        return `${year}. év`;
      default:
        return '';
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  if (status === 'loading' || loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  if (!session) return null;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pénzügyek</h1>
            <p className="text-gray-600 dark:text-gray-400">Kövesd a kiadásaidat és bevételeidet</p>
          </div>
          
          {/* Period Navigation */}
          <div className="bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg shadow-sm dark:shadow-none p-3">
            <div className="flex items-center justify-between">
              <button
                onClick={goToPreviousPeriod}
                className="p-2 text-gray-500 dark:text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-zinc-900 rounded-md transition-colors"
                title="Előző időszak"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <div className="flex flex-col items-center flex-1 mx-4">
                <div className="text-lg font-semibold text-gray-900 dark:text-white mb-1 text-center">
                  {getPeriodDisplay()}
                </div>
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value as 'week' | 'month' | 'year')}
                  className="text-sm text-gray-600 dark:text-gray-400 bg-transparent border-0 focus:outline-none focus:ring-0 cursor-pointer"
                >
                  <option value="week">Heti</option>
                  <option value="month">Havi</option>
                  <option value="year">Éves</option>
                </select>
              </div>
              
              <div className="flex items-center space-x-1">
                <button
                  onClick={goToNextPeriod}
                  className="p-2 text-gray-500 dark:text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-zinc-900 rounded-md transition-colors"
                  title="Következő időszak"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                
                <button
                  onClick={goToCurrentPeriod}
                  className="p-2 text-gray-500 dark:text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-zinc-900 rounded-md transition-colors"
                  title="Jelenlegi időszak"
                >
                  <Home className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button 
              onClick={() => setShowBillUpload(true)}
              className="inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
            >
              <Camera className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Számla fotó</span>
              <span className="sm:hidden">Számla</span>
            </button>
            <button 
              onClick={() => handleAddClick('expense')}
              className="inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
            >
              <Plus className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Kiadás</span>
              <span className="sm:hidden">Kiadás</span>
            </button>
            <button 
              onClick={() => handleAddClick('income')}
              className="inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
            >
              <Plus className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Bevétel</span>
              <span className="sm:hidden">Bevétel</span>
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            <div className="bg-white dark:bg-zinc-950 rounded-lg shadow dark:shadow-none dark:border dark:border-zinc-900 p-4 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <TrendingDown className="w-3 h-3 sm:w-5 sm:h-5 text-red-600" />
                  </div>
                </div>
                <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 truncate">Összes kiadás</p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white truncate">{summary.totalExpenses.toLocaleString()} Ft</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-zinc-950 rounded-lg shadow dark:shadow-none dark:border dark:border-zinc-900 p-4 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-3 h-3 sm:w-5 sm:h-5 text-green-600" />
                  </div>
                </div>
                <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 truncate">Összes bevétel</p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white truncate">{summary.totalIncome.toLocaleString()} Ft</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-zinc-950 rounded-lg shadow dark:shadow-none dark:border dark:border-zinc-900 p-4 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ${
                    summary.balance >= 0 ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    <DollarSign className={`w-3 h-3 sm:w-5 sm:h-5 ${
                      summary.balance >= 0 ? 'text-green-600' : 'text-red-600'
                    }`} />
                  </div>
                </div>
                <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 truncate">Egyenleg</p>
                  <p className={`text-lg sm:text-2xl font-bold truncate ${
                    summary.balance >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {summary.balance.toLocaleString()} Ft
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-zinc-950 rounded-lg shadow dark:shadow-none dark:border dark:border-zinc-900 p-4 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Calendar className="w-3 h-3 sm:w-5 sm:h-5 text-blue-600" />
                  </div>
                </div>
                <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 truncate">Időszak</p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white truncate">
                    {getPeriodDisplay()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-zinc-800">
          <nav className="flex space-x-2 sm:space-x-8 overflow-x-auto">
            {[
              { key: 'overview', label: 'Áttekintés', icon: BarChart3 },
              { key: 'expenses', label: 'Kiadások', icon: TrendingDown },
              { key: 'income', label: 'Bevételek', icon: TrendingUp },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-1 sm:gap-2 whitespace-nowrap ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 dark:text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && summary && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Expenses by Category */}
            <div className="bg-white dark:bg-zinc-950 rounded-lg shadow dark:shadow-none dark:border dark:border-zinc-900 p-4 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Kiadások kategóriánként</h3>
              <ResponsiveContainer width="100%" height={250}>
                <RechartsPieChart>
                  <Pie
                    data={Object.entries(summary.expensesByCategory).map(([category, amount]) => ({
                      name: category,
                      value: amount
                    }))}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {Object.entries(summary.expensesByCategory).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} Ft`, 'Összeg']} />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>

            {/* Income by Category */}
            <div className="bg-white dark:bg-zinc-950 rounded-lg shadow dark:shadow-none dark:border dark:border-zinc-900 p-4 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Bevételek kategóriánként</h3>
              <ResponsiveContainer width="100%" height={250}>
                <RechartsPieChart>
                  <Pie
                    data={Object.entries(summary.incomeByCategory).map(([category, amount]) => ({
                      name: category,
                      value: amount
                    }))}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {Object.entries(summary.incomeByCategory).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} Ft`, 'Összeg']} />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Expenses Tab Content */}
        {activeTab === 'expenses' && (
          <div className="space-y-4">
            <div className="bg-white dark:bg-zinc-950 rounded-lg shadow dark:shadow-none dark:border dark:border-zinc-900 p-4 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Kiadások</h3>
              {expenses.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-500 text-center py-8">Nincsenek kiadások</p>
              ) : (
                <div className="space-y-3">
                  {expenses.map((expense, index) => (
                    <div key={index} className="bg-gray-50 dark:bg-black rounded-lg">
                      <div className="flex items-center justify-between p-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-gray-900 dark:text-white">{expense.description}</p>
                            {((expense as any).isBill || expense.description.includes('Sml számla') || expense.description.includes('számla')) && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                Számla
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{expense.category} • {expense.location}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-500">{new Date(expense.date).toLocaleDateString('hu-HU')}</p>
                        </div>
                        <div className="text-right flex items-center gap-2">
                          <div>
                            <p className="font-bold text-red-600">{expense.amount.toLocaleString()} Ft</p>
                            <p className="text-xs text-gray-500 dark:text-gray-500">{expense.paymentMethod}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            {(((expense as any).isBill && (expense as any).billItems && (expense as any).billItems.length > 0) || 
                             (expense.description.includes('Sml számla') || expense.description.includes('számla'))) && (
                              <button
                                onClick={() => toggleExpenseExpansion(index)}
                                className="p-1 text-gray-500 dark:text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded"
                                title={expandedExpenses.has(index) ? 'Összezár' : 'Részletek'}
                              >
                                {expandedExpenses.has(index) ? (
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                  </svg>
                                ) : (
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                  </svg>
                                )}
                              </button>
                            )}
                            <button
                              onClick={() => handleEditExpense(expense)}
                              className="p-1 text-blue-500 hover:text-blue-700 hover:bg-blue-100 rounded"
                              title="Szerkesztés"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => expense._id && handleDeleteExpense(expense._id)}
                              className="p-1 text-red-500 hover:text-red-700 hover:bg-red-100 rounded"
                              title="Törlés"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                      {(((expense as any).isBill && (expense as any).billItems && (expense as any).billItems.length > 0) || 
                        (expense.description.includes('Sml számla') || expense.description.includes('számla'))) && expandedExpenses.has(index) && (
                        <div className="px-3 pb-3 border-t border-gray-200 dark:border-zinc-800">
                          <div className="mt-3 bg-white dark:bg-zinc-950 p-3 rounded border dark:border-zinc-900">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                              Számla tételek ({(expense as any).billItems ? (expense as any).billItems.length : 0} db)
                            </h4>
                            <div className="space-y-1 max-h-32 overflow-y-auto">
                              {(expense as any).billItems && (expense as any).billItems.length > 0 ? (
                                (expense as any).billItems.map((item: any, itemIndex: number) => (
                                  <div key={itemIndex} className="flex justify-between text-xs py-1">
                                    <span className="flex-1 truncate">{item.name}</span>
                                    <span className="ml-2 font-medium">{item.price} Ft</span>
                                  </div>
                                ))
                              ) : (
                                <div className="text-xs text-gray-500 dark:text-gray-500 py-2">
                                  Ez a számla a régi formátumban van mentve. Az egyes tételek nem érhetők el.
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Income Tab Content */}
        {activeTab === 'income' && (
          <div className="space-y-4">
            <div className="bg-white dark:bg-zinc-950 rounded-lg shadow dark:shadow-none dark:border dark:border-zinc-900 p-4 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Bevételek</h3>
              {income.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-500 text-center py-8">Nincsenek bevételek</p>
              ) : (
                <div className="space-y-3">
                  {income.map((incomeItem, index) => (
                    <div key={index} className="bg-gray-50 dark:bg-black rounded-lg">
                      <div className="flex items-center justify-between p-3">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 dark:text-white">{incomeItem.description}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{incomeItem.category} • {incomeItem.source}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-500">{new Date(incomeItem.date).toLocaleDateString('hu-HU')}</p>
                        </div>
                        <div className="text-right flex items-center gap-2">
                          <div>
                            <p className="font-bold text-green-600">{incomeItem.amount.toLocaleString()} Ft</p>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleEditIncome(incomeItem)}
                              className="p-1 text-blue-500 hover:text-blue-700 hover:bg-blue-100 rounded"
                              title="Szerkesztés"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => incomeItem._id && handleDeleteIncome(incomeItem._id)}
                              className="p-1 text-red-500 hover:text-red-700 hover:bg-red-100 rounded"
                              title="Törlés"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Bill Upload Modal */}
        {showBillUpload && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4">
              <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setShowBillUpload(false)} />
              
              <div className="relative bg-white dark:bg-zinc-950 rounded-lg shadow-xl dark:shadow-none dark:border dark:border-zinc-900 max-w-md w-full mx-4">
                <div className="p-4 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Számla fotó feltöltése</h3>
                  <form onSubmit={handleBillUpload} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Válassz számla képet
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                      {billImage && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-600 dark:text-gray-400">Kiválasztott fájl: {billImage.name}</p>
                          <div className="mt-2">
                            <img
                              src={URL.createObjectURL(billImage)}
                              alt="Bill preview"
                              className="max-w-full h-32 object-cover rounded-md"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {ocrData && (
                      <div className="bg-gray-50 dark:bg-black p-4 rounded-md">
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">Elemzés eredménye:</h4>
                        {ocrData.note && (
                          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-3 py-2 rounded mb-3">
                            <p className="text-sm">{ocrData.note}</p>
                          </div>
                        )}
                        <div className="space-y-1 text-sm">
                          <p><strong>Összeg:</strong> {ocrData.totalAmount} {ocrData.currency || 'HUF'}</p>
                          <p><strong>Üzlet:</strong> {ocrData.merchant}</p>
                          <p><strong>Dátum:</strong> {ocrData.date}</p>
                          <p><strong>Bizalmi szint:</strong> {Math.round(ocrData.confidence * 100)}%</p>
                          {ocrData.items && ocrData.items.length > 0 && (
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <p><strong>Tételek ({ocrData.items.length} db):</strong></p>
                                <button
                                  type="button"
                                  onClick={() => setShowBillItems(!showBillItems)}
                                  className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                                >
                                  {showBillItems ? 'Összezár' : 'Részletek'}
                                </button>
                              </div>
                              {showBillItems && (
                                <div className="bg-white dark:bg-zinc-950 p-3 rounded border dark:border-zinc-900 max-h-40 overflow-y-auto">
                                  <ul className="space-y-1">
                                    {ocrData.items.map((item: any, index: number) => (
                                      <li key={index} className="flex justify-between text-xs">
                                        <span className="flex-1 truncate">{item.name}</span>
                                        <span className="ml-2 font-medium">{item.price} {ocrData.currency || 'HUF'}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex gap-2 pt-4">
                      <button
                        type="button"
                        onClick={() => {
                          setShowBillUpload(false);
                          setBillImage(null);
                          setOcrData(null);
                          setBillItems([]);
                          setShowBillItems(false);
                        }}
                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-zinc-700 text-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-zinc-900 dark:bg-black"
                      >
                        Mégse
                      </button>
                      {ocrData ? (
                        <button
                          type="button"
                          onClick={() => {
                            setShowBillUpload(false);
                            setShowAddForm(true);
                          }}
                          className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                        >
                          Folytatás
                        </button>
                      ) : (
                        <button
                          type="submit"
                          disabled={!billImage || uploading}
                          className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {uploading ? (
                            <div className="flex items-center justify-center">
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                              {ocrProgress < 50 ? 'OCR elemzés...' : 'GPT elemzés...'} {Math.round(ocrProgress)}%
                            </div>
                          ) : (
                            'Elemzés'
                          )}
                        </button>
                      )}
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Form Modal */}
        {showAddForm && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4">
              <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setShowAddForm(false)} />
              
              <div className="relative bg-white dark:bg-zinc-950 rounded-lg shadow-xl dark:shadow-none dark:border dark:border-zinc-900 max-w-md w-full mx-4">
                <div className="p-4 sm:p-6">
                  <div className="mb-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {formType === 'expense' ? 'Új kiadás' : 'Új bevétel'}
                    </h3>
                    {billItems.length > 0 && formType === 'expense' && (
                      <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
                        <p className="text-sm text-blue-800">
                          <strong>{billItems.length} tétel</strong> kerül mentésre a számláról
                        </p>
                      </div>
                    )}
                  </div>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Összeg (Ft) *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Kategória *
                      </label>
                      <input
                        type="text"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        placeholder="pl. Élelmiszer, Szórakozás, Fizetés"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Leírás *
                      </label>
                      <input
                        type="text"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Rövid leírás"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Dátum
                      </label>
                      <input
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    {formType === 'expense' && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Fizetési mód
                          </label>
                          <select
                            value={formData.paymentMethod}
                            onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as any })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="cash">Készpénz</option>
                            <option value="card">Bankkártya</option>
                            <option value="transfer">Átutalás</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Helyszín
                          </label>
                          <input
                            type="text"
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            placeholder="pl. Tesco, KFC"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                      {/* Manual bill items editor */}
                      <div className="pt-2">
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Tételek
                          </label>
                          <button
                            type="button"
                            onClick={addBillItem}
                            className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                          >
                            Tétel hozzáadása
                          </button>
                        </div>
                        {billItems.length > 0 && (
                          <div className="space-y-2 max-h-64 overflow-y-auto border rounded-md p-2">
                            {/* Add here a header to know that name price and quantity are editable */}
                            <div className="flex items-center justify-start gap-2 p-2 bg-gray-50 dark:bg-black rounded w-[100%]">
                              <span className="text-sm font-medium mr-40 text-gray-900 dark:text-white">Név</span>
                              <span className="text-sm font-medium mr-20 text-gray-900 dark:text-white">Ár</span>
                              <span className="text-sm font-medium text-gray-900 dark:text-white">Db</span>
                            </div>
                            {billItems.map((item, index) => (
                              <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-black rounded">
                                <input
                                  type="text"
                                  value={item.name}
                                  onChange={(e) => updateBillItem(index, 'name', e.target.value)}
                                  className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-zinc-700 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  placeholder="Tétel neve"
                                />
                                <input
                                  type="number"
                                  value={item.price}
                                  onChange={(e) => updateBillItem(index, 'price', parseFloat(e.target.value) || 0)}
                                  className="w-20 px-2 py-1 ml-4 text-sm border border-gray-300 dark:border-zinc-700 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  placeholder="Ár"
                                />
                                <span className="text-sm text-gray-600 dark:text-gray-400">Ft</span>
                                <input
                                  type="number"
                                  value={item.quantity}
                                  onChange={(e) => updateBillItem(index, 'quantity', parseInt(e.target.value) || 1)}
                                  className="w-16 px-2 py-1 text-sm border border-gray-300 dark:border-zinc-700 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  placeholder="Db"
                                />
                                <button
                                  type="button"
                                  onClick={() => deleteBillItem(index)}
                                  className="p-1 text-red-500 hover:text-red-700 hover:bg-red-100 rounded"
                                  title="Tétel törlése"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                        {billItems.length > 0 && (
                          <div className="mt-2 bg-blue-50 p-2 rounded-md flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-900 dark:text-white">Tételek összege:</span>
                            <span className="text-sm font-bold text-blue-600">
                              {billItems.reduce((sum, item) => sum + (Number(item.price) || 0), 0).toLocaleString()} Ft
                            </span>
                          </div>
                        )}
                      </div>
                      </>
                    )}
                    {formType === 'income' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Forrás
                        </label>
                        <input
                          type="text"
                          value={formData.source}
                          onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                          placeholder="pl. Munkahely, Freelance"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    )}
                    <div className="flex gap-2 pt-4">
                      <button
                        type="button"
                        onClick={() => setShowAddForm(false)}
                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-zinc-700 text-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-zinc-900 dark:bg-black"
                      >
                        Mégse
                      </button>
                      <button
                        type="submit"
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        Mentés
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Bill Modal */}
        {showEditModal && editingExpense && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4">
              <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setShowEditModal(false)} />
              
              <div className="relative bg-white dark:bg-zinc-950 rounded-lg shadow-xl dark:shadow-none dark:border dark:border-zinc-900 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="p-4 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Számla szerkesztése: {editingExpense.description}
                  </h3>
                  
                  <div className="space-y-4">
                    {/* Bill Items */}
                    <div>
                      <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">
                        Számla tételek ({editingItems.length} db)
                      </h4>
                      <div className="space-y-2 max-h-96 overflow-y-auto border rounded-md p-3">
                        {editingItems.map((item, index) => (
                          <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-black rounded">
                            <input
                              type="text"
                              value={item.name}
                              onChange={(e) => handleUpdateItem(index, 'name', e.target.value)}
                              className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-zinc-700 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                              placeholder="Tétel neve"
                            />
                            <input
                              type="number"
                              value={item.price}
                              onChange={(e) => handleUpdateItem(index, 'price', parseFloat(e.target.value) || 0)}
                              className="w-20 px-2 py-1 text-sm border border-gray-300 dark:border-zinc-700 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                              placeholder="Ár"
                            />
                            <span className="text-sm text-gray-600 dark:text-gray-400">Ft</span>
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => handleUpdateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                              className="w-16 px-2 py-1 text-sm border border-gray-300 dark:border-zinc-700 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                              placeholder="Db"
                            />
                            <button
                              onClick={() => handleDeleteItem(index)}
                              className="p-1 text-red-500 hover:text-red-700 hover:bg-red-100 rounded"
                              title="Tétel törlése"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Total Calculation */}
                    <div className="bg-blue-50 p-3 rounded-md">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-900 dark:text-white">Új összeg:</span>
                        <span className="font-bold text-lg text-blue-600">
                          {editingItems.reduce((sum, item) => sum + (item.price || 0), 0).toLocaleString()} Ft
                        </span>
                      </div>
                      {editingExpense.amount !== editingItems.reduce((sum, item) => sum + (item.price || 0), 0) && (
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Eredeti összeg: {editingExpense.amount.toLocaleString()} Ft
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowEditModal(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-zinc-700 text-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-zinc-900 dark:bg-black"
                    >
                      Mégse
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveEditedExpense}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Mentés
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Income Modal */}
        {showIncomeEditModal && editingIncome && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4">
              <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setShowIncomeEditModal(false)} />
              
              <div className="relative bg-white dark:bg-zinc-950 rounded-lg shadow-xl dark:shadow-none dark:border dark:border-zinc-900 max-w-md w-full mx-4">
                <div className="p-4 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Bevétel szerkesztése
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Összeg (Ft) *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={editingIncome.amount}
                        onChange={(e) => setEditingIncome({ ...editingIncome, amount: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Kategória *
                      </label>
                      <input
                        type="text"
                        value={editingIncome.category}
                        onChange={(e) => setEditingIncome({ ...editingIncome, category: e.target.value })}
                        placeholder="pl. Fizetés, Freelance, Befektetés"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Leírás *
                      </label>
                      <input
                        type="text"
                        value={editingIncome.description}
                        onChange={(e) => setEditingIncome({ ...editingIncome, description: e.target.value })}
                        placeholder="Rövid leírás"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Dátum
                      </label>
                      <input
                        type="date"
                        value={new Date(editingIncome.date).toISOString().split('T')[0]}
                        onChange={(e) => setEditingIncome({ ...editingIncome, date: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Forrás
                      </label>
                      <input
                        type="text"
                        value={editingIncome.source || ''}
                        onChange={(e) => setEditingIncome({ ...editingIncome, source: e.target.value })}
                        placeholder="pl. Munkahely, Freelance"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-2 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowIncomeEditModal(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-zinc-700 text-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-zinc-900 dark:bg-black"
                    >
                      Mégse
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveEditedIncome}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      Mentés
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default FinancePage;
