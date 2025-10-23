# Finance API Quick Reference

## 🔑 Authentication

All endpoints require authentication. Include JWT token in Authorization header:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

## 📍 Endpoints

### POST /api/expenses
Create a new expense (supports bill items)

**Request:**
```json
{
  "amount": 5000,                    // Required: positive number
  "category": "Élelmiszer",          // Required: non-empty string
  "description": "Bevásárlás",       // Required: non-empty string
  "date": "2025-10-15T10:00:00Z",   // Optional: ISO date (default: now)
  "location": "Tesco",               // Optional: string
  "paymentMethod": "card",           // Optional: "cash"|"card"|"transfer" (default: "cash")
  "billItems": [                     // Optional: array of items
    {
      "name": "Kenyér",              // Required: string
      "price": 500,                  // Required: positive number
      "quantity": 2                  // Optional: positive number (default: 1)
    }
  ],
  "isBill": true                     // Optional: boolean (default: false)
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "userId": "...",
    "amount": 1000,
    "category": "Élelmiszer",
    "description": "Bevásárlás",
    "date": "2025-10-15T10:00:00.000Z",
    "location": "Tesco",
    "paymentMethod": "card",
    "billItems": [...],
    "isBill": true,
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

### POST /api/income
Create a new income entry

**Request:**
```json
{
  "amount": 300000,                  // Required: positive number
  "category": "Fizetés",             // Required: non-empty string
  "description": "Havi fizetés",     // Required: non-empty string
  "date": "2025-10-01T08:00:00Z",   // Optional: ISO date (default: now)
  "location": "Cég",                 // Optional: string
  "paymentMethod": "transfer",       // Optional: "cash"|"card"|"transfer" (default: "cash")
  "source": "Munkaadó"              // Optional: string
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "userId": "...",
    "amount": 300000,
    "category": "Fizetés",
    "description": "Havi fizetés",
    "date": "2025-10-01T08:00:00.000Z",
    "location": "Cég",
    "paymentMethod": "transfer",
    "source": "Munkaadó",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

### GET /api/finance/summary
Get financial summary with charts data

**Query Parameters:**
- `period`: "week" | "month" | "year" (default: "month")
- `year`: number (required for specific periods)
- `month`: number 1-12 (required for month period)
- `week`: number (required for week period)

**Examples:**
```
GET /api/finance/summary?period=month&year=2025&month=10
GET /api/finance/summary?period=week&year=2025&week=42
GET /api/finance/summary?period=year&year=2025
GET /api/finance/summary (current month)
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalExpenses": 150000,
    "totalIncome": 300000,
    "balance": 150000,
    "expensesByCategory": {
      "Élelmiszer": 50000,
      "Közlekedés": 30000
    },
    "incomeByCategory": {
      "Fizetés": 300000
    },
    "monthlyTrend": [
      {
        "month": "Május",
        "year": 2025,
        "monthIndex": 4,
        "income": 280000,
        "expenses": 140000,
        "balance": 140000
      }
      // ... 5 more months
    ],
    "comparisonData": {
      "income": 300000,
      "expenses": 150000,
      "balance": 150000
    },
    "recentTransactions": [
      {
        "type": "expense",
        "id": "...",
        "amount": 5000,
        "category": "Élelmiszer",
        "description": "Bevásárlás",
        "date": "2025-10-15T10:00:00.000Z"
      }
      // ... up to 10 transactions
    ],
    "period": "month",
    "startDate": "2025-10-01T00:00:00.000Z",
    "endDate": "2025-10-31T23:59:59.999Z",
    "currentPeriod": {
      "year": 2025,
      "month": 10,
      "week": 42
    }
  }
}
```

### GET /api/expenses
Get user's expenses (up to 100, newest first)

**Query Parameters:**
- `startDate`: ISO date string (optional)
- `endDate`: ISO date string (optional)
- `category`: string (optional)

**Examples:**
```
GET /api/expenses
GET /api/expenses?startDate=2025-10-01&endDate=2025-10-15
GET /api/expenses?category=Élelmiszer
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "userId": "...",
      "amount": 5000,
      "category": "Élelmiszer",
      "description": "Bevásárlás",
      "date": "2025-10-15T10:00:00.000Z",
      "location": "Tesco",
      "paymentMethod": "card",
      "createdAt": "...",
      "updatedAt": "..."
    }
    // ... more expenses
  ]
}
```

### GET /api/income
Get user's income entries (up to 100, newest first)

**Query Parameters:**
- `startDate`: ISO date string (optional)
- `endDate`: ISO date string (optional)
- `category`: string (optional)

**Examples:**
```
GET /api/income
GET /api/income?startDate=2025-10-01&endDate=2025-10-15
GET /api/income?category=Fizetés
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "userId": "...",
      "amount": 300000,
      "category": "Fizetés",
      "description": "Havi fizetés",
      "date": "2025-10-01T08:00:00.000Z",
      "location": "Cég",
      "paymentMethod": "transfer",
      "source": "Munkaadó",
      "createdAt": "...",
      "updatedAt": "..."
    }
    // ... more income entries
  ]
}
```

### PUT /api/expenses?id={expenseId}
Update an expense

**Request:**
```json
{
  "amount": 6000,
  "billItems": [...]
}
```

**Response:**
```json
{
  "success": true,
  "data": { /* updated expense */ }
}
```

### DELETE /api/expenses?id={expenseId}
Delete an expense

**Response:**
```json
{
  "success": true,
  "message": "Kiadás sikeresen törölve"
}
```

### PUT /api/income?id={incomeId}
Update an income entry

**Request:**
```json
{
  "amount": 320000,
  "category": "Fizetés",
  "description": "Módosított fizetés",
  "date": "2025-10-01T08:00:00Z",
  "location": "Új cég",
  "paymentMethod": "transfer",
  "source": "Munkaadó"
}
```

**Response:**
```json
{
  "success": true,
  "data": { /* updated income */ }
}
```

### DELETE /api/income?id={incomeId}
Delete an income entry

**Response:**
```json
{
  "success": true,
  "message": "Bevétel sikeresen törölve"
}
```

## ⚠️ Error Responses

All errors follow this format:

```json
{
  "success": false,
  "message": "Hungarian error message"
}
```

### Common HTTP Status Codes:

| Code | Meaning | Example Message |
|------|---------|-----------------|
| 200 | Success | N/A |
| 201 | Created | N/A |
| 400 | Bad Request | "Az összegnek pozitív számnak kell lennie" |
| 401 | Unauthorized | "Nincs jogosultság" |
| 404 | Not Found | "Kiadás nem található" |
| 405 | Method Not Allowed | "A metódus nem engedélyezett" |
| 500 | Server Error | "Szerver hiba történt" |

### Validation Error Messages:

| Field | Error Message |
|-------|---------------|
| amount | "Az összegnek pozitív számnak kell lennie" |
| category | "A kategória mező kötelező" |
| description | "A leírás mező kötelező" |
| date | "Érvénytelen dátum formátum" |
| paymentMethod | "A fizetési mód csak 'cash', 'card', vagy 'transfer' lehet" |
| billItems | "A számlaelemeknek tömbnek kell lenniük" |
| billItems[i].name | "A számlaelem nevének kötelező (elem {i+1})" |
| billItems[i].price | "A számlaelem árának pozitív számnak kell lennie (elem {i+1})" |
| billItems[i].quantity | "A számlaelem mennyiségének pozitív számnak kell lennie (elem {i+1})" |

## 🔐 Security Notes

1. **Authentication:**
   - All endpoints require valid JWT token
   - Dual check: JWT token + NextAuth session
   - User validation against database

2. **Authorization:**
   - All queries automatically filtered by authenticated userId
   - Cannot access other users' data
   - Update/Delete operations verify ownership

3. **Data Validation:**
   - All inputs validated before database operations
   - Type checking (numbers, strings, dates, enums)
   - String trimming to prevent whitespace issues
   - Array validation for bill items

## 💡 Tips & Best Practices

### 1. Bill Items
When creating expenses with billItems, the total amount is automatically calculated:

```javascript
// Amount is calculated from billItems
{
  "amount": 0,  // Will be overridden
  "billItems": [
    { "name": "Item 1", "price": 500, "quantity": 2 },  // 1000
    { "name": "Item 2", "price": 300, "quantity": 1 }   // 300
  ]
  // Final amount will be 1300
}
```

### 2. Date Handling
- Always use ISO 8601 format: `"2025-10-15T10:00:00Z"`
- If omitted, current date/time is used
- Timezone is preserved

### 3. Payment Methods
Valid values: `"cash"`, `"card"`, `"transfer"`
- Default is `"cash"` if not specified
- Case-sensitive

### 4. Filtering by Date
```javascript
// Get expenses for specific month
GET /api/expenses?startDate=2025-10-01T00:00:00Z&endDate=2025-10-31T23:59:59Z

// Get income for last week
const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
const now = new Date().toISOString();
GET /api/income?startDate=${weekAgo}&endDate=${now}
```

### 5. Monthly Trend Data
The monthly trend includes:
- Last 6 months of data
- Hungarian month names ("Január", "Február", etc.)
- Income, expenses, and balance for each month
- Perfect for charts and graphs

### 6. Response Handling

```javascript
// Success response
const response = await fetch('/api/expenses');
const result = await response.json();

if (result.success) {
  const expenses = result.data;
  // Use expenses data
} else {
  // Show error message (in Hungarian)
  console.error(result.message);
}
```

### 7. Error Handling

```javascript
try {
  const response = await fetch('/api/expenses', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(expenseData)
  });
  
  const result = await response.json();
  
  if (!response.ok || !result.success) {
    // Show Hungarian error message to user
    showError(result.message);
    return;
  }
  
  // Success
  const expense = result.data;
  showSuccess('Kiadás sikeresen létrehozva!');
  
} catch (error) {
  console.error('Network error:', error);
  showError('Hálózati hiba történt');
}
```

## 📊 Chart Integration Example

```javascript
// Get summary data for chart
const response = await fetch('/api/finance/summary?period=month&year=2025&month=10');
const { success, data } = await response.json();

if (success) {
  // Expenses by category (Pie Chart)
  const categoryData = Object.entries(data.expensesByCategory).map(([category, amount]) => ({
    category,
    amount,
    percentage: (amount / data.totalExpenses) * 100
  }));
  
  // Monthly trend (Line Chart)
  const trendData = data.monthlyTrend.map(month => ({
    month: month.month,
    income: month.income,
    expenses: month.expenses,
    balance: month.balance
  }));
  
  // Comparison data (Bar Chart)
  const comparison = [
    { label: 'Bevétel', value: data.comparisonData.income },
    { label: 'Kiadás', value: data.comparisonData.expenses },
    { label: 'Egyenleg', value: data.comparisonData.balance }
  ];
}
```

## 🚀 TypeScript Types

```typescript
interface ExpenseRequest {
  amount: number;
  category: string;
  description: string;
  date?: string;
  location?: string;
  paymentMethod?: 'cash' | 'card' | 'transfer';
  billItems?: BillItem[];
  isBill?: boolean;
}

interface IncomeRequest {
  amount: number;
  category: string;
  description: string;
  date?: string;
  location?: string;
  paymentMethod?: 'cash' | 'card' | 'transfer';
  source?: string;
}

interface BillItem {
  name: string;
  price: number;
  quantity?: number;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

interface SummaryData {
  totalExpenses: number;
  totalIncome: number;
  balance: number;
  expensesByCategory: Record<string, number>;
  incomeByCategory: Record<string, number>;
  monthlyTrend: MonthlyTrendItem[];
  comparisonData: ComparisonData;
  recentTransactions: Transaction[];
  period: string;
  startDate: string;
  endDate: string;
  currentPeriod: {
    year: number;
    month: number;
    week: number;
  };
}

interface MonthlyTrendItem {
  month: string;
  year: number;
  monthIndex: number;
  income: number;
  expenses: number;
  balance: number;
}

interface ComparisonData {
  income: number;
  expenses: number;
  balance: number;
}

interface Transaction {
  type: 'expense' | 'income';
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
}
```

---

**Last Updated:** October 15, 2025  
**API Version:** 1.0.0


