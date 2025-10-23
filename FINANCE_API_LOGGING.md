# Finance API Logging Documentation

## Overview
Comprehensive console logging has been added to all Finance API endpoints to facilitate debugging, monitoring, and troubleshooting in production and development environments.

## 📋 Logging Structure

All logs follow a consistent format:
```
[API Name] METHOD - Action: Details
```

### Log Levels:
- **Info logs**: `console.log()` - General operations, successful actions
- **Error logs**: `console.error()` - Errors and exceptions

## 🔍 Expenses API Logging (`/api/expenses`)

### Authentication & Setup
```javascript
[Expenses API] GET request received
[Expenses API] POST request received
[Expenses API] PUT request received
[Expenses API] DELETE request received

[Expenses API] User authenticated: user@example.com (userId)
[Expenses API] Unauthorized: No user email found
[Expenses API] User not found: user@example.com
```

### GET Method
```javascript
[Expenses API] GET - Query params: { startDate, endDate, category }
[Expenses API] GET - Found 15 expenses
```

### POST Method
```javascript
[Expenses API] POST - Creating expense: { 
  amount: 5000, 
  category: 'Élelmiszer', 
  description: 'Bevásárlás', 
  isBill: true, 
  billItemsCount: 3 
}

// Validation logs
[Expenses API] POST - Validation failed: amount
[Expenses API] POST - Validation failed: category
[Expenses API] POST - Validation failed: description
[Expenses API] POST - Validation failed: date
[Expenses API] POST - Validation failed: paymentMethod
[Expenses API] POST - Validation failed: billItems

// Bill items calculation
[Expenses API] POST - Calculated amount from billItems: 2200

// Success
[Expenses API] POST - Expense created successfully: expenseId
```

### PUT Method
```javascript
[Expenses API] PUT - Updating expense: expenseId
[Expenses API] PUT - Missing expense ID
[Expenses API] PUT - Update data: { amount: 6000, billItems: [...] }
[Expenses API] PUT - Expense not found: expenseId
[Expenses API] PUT - Expense updated successfully: expenseId
```

### DELETE Method
```javascript
[Expenses API] DELETE - Deleting expense: expenseId
[Expenses API] DELETE - Missing expense ID
[Expenses API] DELETE - Expense not found: expenseId
[Expenses API] DELETE - Expense deleted successfully: expenseId
```

### Error Handling
```javascript
[Expenses API] Method not allowed: PATCH
[Expenses API] Error: { error details }
```

## 💰 Income API Logging (`/api/income`)

### Authentication & Setup
```javascript
[Income API] GET request received
[Income API] POST request received
[Income API] PUT request received
[Income API] DELETE request received

[Income API] User authenticated: user@example.com (userId)
[Income API] Unauthorized: No user email found
[Income API] User not found: user@example.com
```

### GET Method
```javascript
[Income API] GET - Query params: { startDate, endDate, category }
[Income API] GET - Found 8 income entries
```

### POST Method
```javascript
[Income API] POST - Creating income: { 
  amount: 300000, 
  category: 'Fizetés', 
  description: 'Havi fizetés', 
  paymentMethod: 'transfer' 
}

// Validation logs
[Income API] POST - Validation failed: amount
[Income API] POST - Validation failed: category
[Income API] POST - Validation failed: description
[Income API] POST - Validation failed: date
[Income API] POST - Validation failed: paymentMethod

// Success
[Income API] POST - Income created successfully: incomeId
```

### PUT Method
```javascript
[Income API] PUT - Updating income: incomeId
[Income API] PUT - Missing income ID
[Income API] PUT - Update data: { amount: 320000, category: 'Fizetés', ... }
[Income API] PUT - Income not found: incomeId
[Income API] PUT - Income updated successfully: incomeId
```

### DELETE Method
```javascript
[Income API] DELETE - Deleting income: incomeId
[Income API] DELETE - Missing income ID
[Income API] DELETE - Income not found: incomeId
[Income API] DELETE - Income deleted successfully: incomeId
```

### Error Handling
```javascript
[Income API] Method not allowed: PATCH
[Income API] Error: { error details }
```

## 📊 Finance Summary API Logging (`/api/finance/summary`)

### Authentication & Setup
```javascript
[Finance Summary API] GET request received

[Finance Summary API] User authenticated: user@example.com (userId)
[Finance Summary API] Unauthorized: No user email found
[Finance Summary API] User not found: user@example.com
```

### GET Method - Main Flow
```javascript
[Finance Summary API] GET - Query params: { 
  period: 'month', 
  year: 2025, 
  month: 10, 
  week: undefined 
}

[Finance Summary API] Date range: 2025-10-01T00:00:00.000Z to 2025-10-31T23:59:59.999Z

[Finance Summary API] Found 45 expenses and 12 income entries for period

[Finance Summary API] Totals - Income: 450000, Expenses: 250000, Balance: 200000
```

### Monthly Trend Calculation
```javascript
[Finance Summary API] Calculating monthly trend for last 6 months...
[Finance Summary API] Monthly trend calculated: 6 months
```

### Response
```javascript
[Finance Summary API] Sending summary response
```

### Error Handling
```javascript
[Finance Summary API] Method not allowed: POST
[Finance Summary API] Error: { error details }
```

## 🎯 Log Usage Examples

### Monitoring API Usage
```bash
# Watch all finance API requests
tail -f logs/api.log | grep "Finance\|Expenses\|Income"

# Monitor specific operations
tail -f logs/api.log | grep "POST - Creating"
tail -f logs/api.log | grep "Validation failed"
```

### Debugging Issues

#### Track a specific user's requests
```bash
grep "user@example.com" logs/api.log
```

#### Find validation errors
```bash
grep "Validation failed" logs/api.log
```

#### Track successful operations
```bash
grep "successfully" logs/api.log
```

#### Monitor bill items calculation
```bash
grep "Calculated amount from billItems" logs/api.log
```

### Performance Monitoring

#### Track monthly trend calculations
```bash
grep "Monthly trend" logs/api.log
```

#### Monitor data retrieval
```bash
grep "Found.*expenses\|Found.*income" logs/api.log
```

## 📈 Log Analysis Patterns

### 1. Request Flow Pattern
```
[API] METHOD request received
  ↓
[API] User authenticated: email (userId)
  ↓
[API] METHOD - Action details
  ↓
[API] METHOD - Operation successful
```

### 2. Validation Error Pattern
```
[API] POST request received
  ↓
[API] User authenticated
  ↓
[API] POST - Creating resource
  ↓
[API] POST - Validation failed: field
```

### 3. Authorization Error Pattern
```
[API] METHOD request received
  ↓
[API] Unauthorized: No user email found
```

### 4. Not Found Pattern
```
[API] METHOD request received
  ↓
[API] User authenticated
  ↓
[API] METHOD - Resource not found: id
```

## 🔧 Debug Scenarios

### Scenario 1: User can't create expense
**Look for:**
1. `[Expenses API] POST request received` - Request arrived?
2. `[Expenses API] User authenticated` - Auth successful?
3. `[Expenses API] POST - Creating expense` - Data received?
4. `[Expenses API] POST - Validation failed` - Which field failed?
5. `[Expenses API] POST - Expense created successfully` - Success?

### Scenario 2: Bill items amount calculation issues
**Look for:**
```
[Expenses API] POST - Creating expense: { billItemsCount: X }
[Expenses API] POST - Calculated amount from billItems: YYYY
```

### Scenario 3: Summary showing wrong totals
**Look for:**
```
[Finance Summary API] Found X expenses and Y income entries for period
[Finance Summary API] Totals - Income: XXXX, Expenses: YYYY, Balance: ZZZZ
[Finance Summary API] Monthly trend calculated: 6 months
```

### Scenario 4: Authentication issues
**Look for:**
```
[API] Unauthorized: No user email found
[API] User not found: email
```

## 📝 Log Data Privacy

### What's Logged:
✅ Request methods (GET, POST, PUT, DELETE)
✅ User email addresses
✅ User IDs (MongoDB ObjectId)
✅ Resource IDs
✅ Numeric values (amounts)
✅ Category names
✅ Operation results (success/failure)
✅ Validation error messages

### What's NOT Logged:
❌ JWT tokens
❌ Full request bodies (only summaries)
❌ Sensitive personal data beyond email
❌ Password or authentication credentials
❌ Raw error stack traces (only in error logs)

## 🚀 Production Considerations

### Log Levels by Environment

**Development:**
- All logs active
- Detailed request/response data
- Validation details

**Staging:**
- All logs active
- Performance metrics
- Error tracking

**Production:**
- Essential logs only
- Error tracking
- Performance monitoring
- Consider log aggregation service

### Log Aggregation

Recommended tools:
- **Vercel Logs** (if deployed on Vercel)
- **Datadog**
- **LogRocket**
- **Sentry** (for error tracking)
- **CloudWatch** (if on AWS)

### Performance Impact

Console logging has minimal performance impact:
- Synchronous operation
- Negligible overhead
- Can be disabled in production if needed

### Disabling Logs in Production (Optional)

```javascript
const DEBUG = process.env.NODE_ENV !== 'production';

if (DEBUG) {
  console.log('[Expenses API] Debug info');
}
```

## 🎨 Log Formatting Best Practices

### Consistent Prefixes
- Use `[API Name]` prefix for easy filtering
- Include METHOD for context
- Add action description

### Structured Data
```javascript
// Good
console.log('[Expenses API] POST - Creating expense:', { 
  amount, 
  category, 
  description 
});

// Avoid
console.log('Creating expense with amount', amount);
```

### Error Context
```javascript
// Good
console.error('[Expenses API] Error:', error);

// Better
console.error('[Expenses API] Error creating expense:', {
  error: error.message,
  userId: user._id,
  data: sanitizedData
});
```

## 📊 Monitoring Queries

### Count requests per endpoint
```bash
grep "request received" logs/api.log | sort | uniq -c
```

### Find all validation errors
```bash
grep "Validation failed" logs/api.log | cut -d: -f2 | sort | uniq -c
```

### Track successful operations
```bash
grep "successfully" logs/api.log | wc -l
```

### Find authentication issues
```bash
grep "Unauthorized\|not found" logs/api.log
```

## ✅ Summary

All Finance APIs now include comprehensive logging for:
- ✅ Request tracking
- ✅ Authentication flow
- ✅ Data validation
- ✅ CRUD operations
- ✅ Error handling
- ✅ Performance monitoring (monthly trends)
- ✅ Bill items calculations

This logging infrastructure provides:
- **Debugging capability** - Track issues from request to response
- **Monitoring** - Understand API usage patterns
- **Audit trail** - Know who did what and when
- **Performance insights** - Identify bottlenecks
- **Security tracking** - Monitor authentication attempts

---

**Last Updated:** October 15, 2025  
**Version:** 1.0.0  
**Status:** ✅ Complete


