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
        setExpenses(expensesData);
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
      setShowAddForm(false);
      resetForm();
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
    try {
      const formData = new FormData();
      formData.append('billImage', billImage);

      const response = await fetch('/api/finance/upload-bill', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      setOcrData(result.ocrData);
      
      // Pre-fill form with OCR data
      setFormData(prev => ({
        ...prev,
        amount: result.ocrData.totalAmount.toString(),
        description: `${result.ocrData.merchant} - Sml számla`,
        location: result.ocrData.merchant,
        category: 'Élelmiszer',
      }));
      
      toast.success('Számla feltöltve és elemzve!');
      setShowBillUpload(false);
      setShowAddForm(true);
    } catch (error) {
      console.error('Error uploading bill:', error);
      toast.error('Nem sikerült a számla feltöltése');
    } finally {
      setUploading(false);
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Pénzügyek</h1>
            <p className="text-gray-600">Kövesd a kiadásaidat és bevételeidet</p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            {/* Period Navigation */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-3">
              <div className="flex items-center space-x-3">
                <button
                  onClick={goToPreviousPeriod}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                  title="Előző időszak"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                
                <div className="flex flex-col items-center min-w-[140px]">
                  <div className="text-lg font-semibold text-gray-900 mb-1">
                    {getPeriodDisplay()}
                  </div>
                  <select
                    value={period}
                    onChange={(e) => setPeriod(e.target.value as 'week' | 'month' | 'year')}
                    className="text-sm text-gray-600 bg-transparent border-0 focus:outline-none focus:ring-0 cursor-pointer"
                  >
                    <option value="week">Heti</option>
                    <option value="month">Havi</option>
                    <option value="year">Éves</option>
                  </select>
                </div>
                
                <button
                  onClick={goToNextPeriod}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                  title="Következő időszak"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                
                <div className="w-px h-8 bg-gray-200"></div>
                
                <button
                  onClick={goToCurrentPeriod}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                  title="Jelenlegi időszak"
                >
                  <Home className="w-5 h-5" />
                </button>
              </div>
            </div>
            <button 
              onClick={() => setShowBillUpload(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
            >
              <Camera className="w-4 h-4 mr-2" />
              Számla fotó
            </button>
            <button 
              onClick={() => handleAddClick('expense')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Kiadás
            </button>
            <button 
              onClick={() => handleAddClick('income')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Bevétel
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <TrendingDown className="w-5 h-5 text-red-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Összes kiadás</p>
                  <p className="text-2xl font-bold text-gray-900">{summary.totalExpenses.toLocaleString()} Ft</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Összes bevétel</p>
                  <p className="text-2xl font-bold text-gray-900">{summary.totalIncome.toLocaleString()} Ft</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    summary.balance >= 0 ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    <DollarSign className={`w-5 h-5 ${
                      summary.balance >= 0 ? 'text-green-600' : 'text-red-600'
                    }`} />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Egyenleg</p>
                  <p className={`text-2xl font-bold ${
                    summary.balance >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {summary.balance.toLocaleString()} Ft
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Időszak</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {getPeriodDisplay()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            {[
              { key: 'overview', label: 'Áttekintés', icon: BarChart3 },
              { key: 'expenses', label: 'Kiadások', icon: TrendingDown },
              { key: 'income', label: 'Bevételek', icon: TrendingUp },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && summary && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Expenses by Category */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Kiadások kategóriánként</h3>
              <ResponsiveContainer width="100%" height={300}>
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
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Bevételek kategóriánként</h3>
              <ResponsiveContainer width="100%" height={300}>
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

        {/* Bill Upload Modal */}
        {showBillUpload && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4">
              <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setShowBillUpload(false)} />
              
              <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Számla fotó feltöltése</h3>
                  <form onSubmit={handleBillUpload} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Válassz számla képet
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                      {billImage && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-600">Kiválasztott fájl: {billImage.name}</p>
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
                      <div className="bg-gray-50 p-4 rounded-md">
                        <h4 className="font-medium text-gray-900 mb-2">Elemzés eredménye:</h4>
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
                              <p><strong>Tételek:</strong></p>
                              <ul className="list-disc list-inside ml-2">
                                {ocrData.items.map((item: any, index: number) => (
                                  <li key={index}>{item.name} - {item.price} {ocrData.currency || 'HUF'}</li>
                                ))}
                              </ul>
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
                        }}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                      >
                        Mégse
                      </button>
                      <button
                        type="submit"
                        disabled={!billImage || uploading}
                        className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {uploading ? 'Feldolgozás...' : 'Elemzés'}
                      </button>
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
              
              <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    {formType === 'expense' ? 'Új kiadás' : 'Új bevétel'}
                  </h3>
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
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
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    )}
                    <div className="flex gap-2 pt-4">
                      <button
                        type="button"
                        onClick={() => setShowAddForm(false)}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
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
      </div>
    </Layout>
  );
};

export default FinancePage;
