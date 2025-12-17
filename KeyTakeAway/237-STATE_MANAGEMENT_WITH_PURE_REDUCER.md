# 237 - State Management with Pure Reducer

## 📚 Overview

This guide explains how to combine React's **Context API** with the **useReducer** hook to build an advanced state management system. We'll refactor multiple `useState` hooks into a single reducer that manages cities, loading states, current city, and error state.

---

## 🎯 Learning Objectives

By the end of this guide, you will understand:

1. How to combine Context API with `useReducer`
2. How to refactor multiple `useState` hooks into a single reducer
3. Event-based action naming conventions
4. How to handle asynchronous operations outside the reducer
5. Best practices for state management in React

---

## 📋 Table of Contents

1. [Concepts Overview](#concepts-overview)
2. [Step-by-Step Implementation](#step-by-step-implementation)
3. [Understanding the Reducer](#understanding-the-reducer)
4. [Async Operations Pattern](#async-operations-pattern)
5. [Complete Code Breakdown](#complete-code-breakdown)
6. [Data Flow Diagram](#data-flow-diagram)
7. [Best Practices](#best-practices)
8. [Common Patterns](#common-patterns)

---

## 🧠 Concepts Overview

### What is a Reducer?

A **reducer** is a pure function that takes the current state and an action, then returns a new state:

```javascript
function reducer(state, action) {
  // Return new state based on action
  return newState;
}
```

**Key Characteristics:**
- ✅ **Pure function**: No side effects (no API calls, no mutations)
- ✅ **Predictable**: Same input always produces same output
- ✅ **Immutable**: Always returns a new state object
- ✅ **Testable**: Easy to test in isolation

### Why useReducer over useState?

| Multiple useState                     | Single useReducer              |
|---------------------------------------|--------------------------------|
| State scattered across multiple hooks | Single source of truth         |
| Hard to track related state changes   | All state changes in one place |
| Difficult to test                     | Easy to test reducer function  |
| Complex state updates                 | Predictable state updates      |

### Context API + useReducer Pattern

```
Context API (sharing) + useReducer (managing) = Powerful State Management
```

- **Context API**: Shares state across components without prop drilling
- **useReducer**: Manages complex state with a reducer function
- **Combined**: Reducer manages state, Context provides it to components

---

## 🛠️ Step-by-Step Implementation

### Step 1: Imports and Setup

```javascript
import { 
  createContext, 
  useReducer, 
  useEffect, 
  useContext, 
  useMemo, 
  useCallback 
} from 'react';

const DATABASE_URL = 'http://localhost:8000';
const CitiesContext = createContext();
```

**What each import does:**
- `createContext`: Creates the context object
- `useReducer`: Manages state with reducer function
- `useEffect`: Runs side effects (fetching data)
- `useContext`: Accesses context in components
- `useMemo`: Memoizes context value
- `useCallback`: Memoizes functions

---

### Step 2: Define Initial State

```javascript
const initialState = {
  cities: [],           // Array of city objects
  isLoading: true,     // Loading state for initial fetch
  currentCity: null,   // Currently selected city object
  isLoadingCity: false, // Loading state for city selection
  error: null,         // Error message if something goes wrong
};
```

**Why `isLoading: true`?**
- We fetch cities on component mount
- Starting as `true` shows spinner immediately
- Better UX than showing empty list first

---

### Step 3: Create the Reducer Function

```javascript
function citiesReducer(state, action) {
  switch (action.type) {
    // Cases handle different actions
  }
}
```

**Reducer Rules:**
1. Must be a pure function
2. No side effects (no API calls, no mutations)
3. Always return a new state object
4. Handle all possible action types

---

### Step 4: Action Naming Convention (Event-Based)

**✅ GOOD - Event-based (past tense):**
- `cities/loaded` - "Cities were loaded"
- `city/created` - "A city was created"
- `city/deleted` - "A city was deleted"
- `error/occurred` - "An error occurred"

**❌ BAD - Command-based (present tense):**
- `loadCities` - Sounds like a command
- `createCity` - Sounds like a command
- `setError` - Sounds like a command

**Why event-based?**
- Actions describe **what happened**, not what to do
- More intuitive and easier to debug
- Follows Redux conventions

---

### Step 5: Implement Reducer Cases

#### Case 1: Loading States

```javascript
case 'loading/started':
  return { ...state, isLoading: true, error: null };

case 'city/loading-started':
  return { ...state, isLoadingCity: true, error: null };
```

**Purpose:**
- Set loading flags to `true`
- Clear any previous errors
- Separate loading states for different operations

#### Case 2: Data Loaded

```javascript
case 'cities/loaded':
  return {
    ...state,
    cities: action.payload,  // New cities array
    isLoading: false,         // Stop loading
    error: null,             // Clear errors
  };
```

**What happens:**
- Updates cities array with fetched data
- Stops loading spinner
- Clears any errors

#### Case 3: City Created

```javascript
case 'city/created':
  return {
    ...state,
    cities: [...state.cities, action.payload], // Add new city
    error: null,
  };
```

**Immutable Update:**
- Spreads existing cities array
- Adds new city to the end
- Returns new array (doesn't mutate original)

#### Case 4: City Deleted

```javascript
case 'city/deleted':
  return {
    ...state,
    cities: state.cities.filter(city => city.id !== action.payload),
    currentCity: state.currentCity?.id === action.payload 
      ? null 
      : state.currentCity,
    error: null,
  };
```

**Smart Logic:**
- Filters out deleted city
- Clears `currentCity` if it was deleted
- Uses optional chaining (`?.`) for safety

#### Case 5: City Selected

```javascript
case 'city/selected':
  return {
    ...state,
    currentCity: action.payload,  // Full city object
    isLoadingCity: false,         // Stop loading
    error: null,
  };
```

**Note:** Stores full city object, not just ID

#### Case 6: Error Handling

```javascript
case 'error/occurred':
  return {
    ...state,
    error: action.payload,      // Error message
    isLoading: false,           // Stop all loading
    isLoadingCity: false,
  };
```

**Centralized Error Handling:**
- One place to handle all errors
- Stops all loading states
- Stores error message for display

#### Default Case

```javascript
default:
  throw new Error(`Unknown action type: ${action.type}`);
```

**Safety:**
- Catches typos in action types
- Helps debug during development

---

### Step 6: Create Provider Component

```javascript
function CitiesProvider({ children }) {
  const [state, dispatch] = useReducer(citiesReducer, initialState);
  const { cities, isLoading, currentCity, isLoadingCity, error } = state;
  
  // ... functions and effects
  
  return (
    <CitiesContext.Provider value={value}>
      {children}
    </CitiesContext.Provider>
  );
}
```

**useReducer returns:**
- `state`: Current state object
- `dispatch`: Function to send actions to reducer

---

### Step 7: Handle Async Operations (Outside Reducer)

**⚠️ CRITICAL RULE: Reducers must be pure!**

Async operations are **side effects**, so they must happen **outside** the reducer.

**Pattern:**
1. Async function performs side effect (API call)
2. On success: dispatch success action
3. On error: dispatch error action

#### Example: Fetch Cities

```javascript
const fetchCities = useCallback(async () => {
  try {
    // 1. Start loading
    dispatch({ type: 'loading/started' });
    
    // 2. Fetch data (ASYNC OPERATION)
    const res = await fetch(`${DATABASE_URL}/cities`);
    if (!res.ok) throw new Error('Failed to fetch cities');
    
    // 3. Parse response
    const data = await res.json();
    const citiesArray = Array.isArray(data) ? data : data.cities || [];
    
    // 4. Dispatch success action
    dispatch({ type: 'cities/loaded', payload: citiesArray });
  } catch (error) {
    // 5. Dispatch error action
    dispatch({ type: 'error/occurred', payload: error.message });
  }
}, []);
```

**Flow:**
1. Dispatch `loading/started` → Shows spinner
2. Fetch data → Async operation
3. Dispatch `cities/loaded` → Updates state
4. On error → Dispatch `error/occurred`

#### Example: Create City

```javascript
const createCity = useCallback(async (newCity) => {
  try {
    // 1. POST request (ASYNC)
    const res = await fetch(`${DATABASE_URL}/cities`, {
      method: 'POST',
      body: JSON.stringify(newCity),
      headers: { 'Content-Type': 'application/json' },
    });
    
    if (!res.ok) throw new Error('Failed to create city');
    
    // 2. Get created city from response
    const data = await res.json();
    
    // 3. Dispatch action to add to state
    dispatch({ type: 'city/created', payload: data });
    return data;
  } catch (error) {
    dispatch({ type: 'error/occurred', payload: error.message });
    throw error; // Re-throw for component to handle
  }
}, []);
```

**Note:** No `loading/started` here because:
- Create/delete operations are fast
- Only initial fetch needs full-page loading spinner

#### Example: Delete City

```javascript
const deleteCity = useCallback(async (id) => {
  try {
    const res = await fetch(`${DATABASE_URL}/cities/${id}`, {
      method: 'DELETE',
    });
    
    if (!res.ok) throw new Error('Failed to delete city');
    
    // Dispatch with just the ID (reducer filters it out)
    dispatch({ type: 'city/deleted', payload: id });
  } catch (error) {
    dispatch({ type: 'error/occurred', payload: error.message });
    throw error;
  }
}, []);
```

#### Example: Handle City Click

```javascript
const handleCityClick = useCallback(async (cityId) => {
  try {
    // 1. Start city loading
    dispatch({ type: 'city/loading-started' });
    
    // 2. Find city in current array
    const city = cities.find(c => c.id === parseInt(cityId));
    
    if (city) {
      // 3. Simulate async operation (could be API call)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 4. Dispatch selection
      dispatch({ type: 'city/selected', payload: city });
    } else {
      throw new Error('City not found');
    }
  } catch (error) {
    dispatch({ type: 'error/occurred', payload: error.message });
  }
}, [cities]);
```

**Uses separate loading state:**
- `isLoadingCity` (not `isLoading`)
- Doesn't affect main list loading

---

### Step 8: useEffect for Initial Fetch

```javascript
useEffect(() => {
  fetchCities();
}, [fetchCities]);
```

**Why this works:**
- Runs once on mount
- `fetchCities` is memoized with `useCallback`, so it's stable
- Empty dependency array would also work, but this is more explicit

---

### Step 9: Backward Compatibility

```javascript
// Derive selectedCityId from currentCity
const selectedCityId = currentCity?.id || null;

const setSelectedCityId = useCallback((id) => {
  if (id === null) {
    dispatch({ type: 'city/deselected' });
  } else {
    const city = cities.find(c => c.id === parseInt(id));
    if (city) {
      dispatch({ type: 'city/selected', payload: city });
    }
  }
}, [cities]);
```

**Why needed:**
- Existing components use `selectedCityId`
- Allows gradual migration
- Maintains API compatibility

---

### Step 10: Memoize Context Value

```javascript
const value = useMemo(
  () => ({
    // State
    cities,
    isLoading,
    currentCity,
    isLoadingCity,
    error,
    // Functions
    getCity,
    selectedCityId,
    handleCityClick,
    setSelectedCityId,
    createCity,
    deleteCity,
    fetchCities,
  }),
  [cities, isLoading, currentCity, isLoadingCity, error, 
   getCity, selectedCityId, handleCityClick, setSelectedCityId, 
   createCity, deleteCity, fetchCities]
);
```

**Why useMemo?**
- Prevents unnecessary re-renders
- Only recreates object when dependencies change
- All functions are memoized with `useCallback`

---

### Step 11: Custom Hook

```javascript
function useCities() {
  const context = useContext(CitiesContext);
  if (context === undefined) {
    throw new Error('useCities must be used within a CitiesProvider');
  }
  return context;
}
```

**Benefits:**
- Error handling if used outside provider
- Single import point
- Easier to refactor later

---

## 📊 Complete Code Breakdown

### Full Reducer Implementation

```javascript
function citiesReducer(state, action) {
  switch (action.type) {
    // Loading states
    case 'loading/started':
      return { ...state, isLoading: true, error: null };
    
    case 'loading/finished':
      return { ...state, isLoading: false };
    
    case 'city/loading-started':
      return { ...state, isLoadingCity: true, error: null };
    
    case 'city/loading-finished':
      return { ...state, isLoadingCity: false };
    
    // Data operations
    case 'cities/loaded':
      return {
        ...state,
        cities: action.payload,
        isLoading: false,
        error: null,
      };
    
    case 'city/created':
      return {
        ...state,
        cities: [...state.cities, action.payload],
        error: null,
      };
    
    case 'city/deleted':
      return {
        ...state,
        cities: state.cities.filter(city => city.id !== action.payload),
        currentCity: state.currentCity?.id === action.payload 
          ? null 
          : state.currentCity,
        error: null,
      };
    
    // Selection
    case 'city/selected':
      return {
        ...state,
        currentCity: action.payload,
        isLoadingCity: false,
        error: null,
      };
    
    case 'city/deselected':
      return {
        ...state,
        currentCity: null,
        error: null,
      };
    
    // Error handling
    case 'error/occurred':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
        isLoadingCity: false,
      };
    
    case 'error/cleared':
      return {
        ...state,
        error: null,
      };
    
    default:
      throw new Error(`Unknown action type: ${action.type}`);
  }
}
```

---

## 🔄 Data Flow Diagram

```
┌─────────────┐
│  Component │
│  calls     │
│ createCity()│
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│  createCity()   │
│  makes API call │
└──────┬──────────┘
       │
       ▼
┌─────────────────────────────┐
│  API returns new city       │
└──────┬──────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│ dispatch({                      │
│   type: 'city/created',         │
│   payload: newCity              │
│ })                              │
└──────┬───────────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│  Reducer receives action    │
└──────┬──────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│  Reducer returns new state:      │
│  {                              │
│    cities: [...oldCities, new]  │
│  }                              │
└──────┬───────────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│  useReducer updates state   │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│  Provider re-renders        │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│  Context value updates      │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│  All components using       │
│  useCities() re-render      │
│  with new data              │
└─────────────────────────────┘
```

---

## ✅ Best Practices Checklist

- [x] Reducer is pure (no side effects)
- [x] All state in one reducer object
- [x] Action types use event naming (`something/happened`)
- [x] Async operations happen outside reducer
- [x] Error state is handled
- [x] Loading states are managed
- [x] Default case throws error for unknown actions
- [x] State updates are immutable (spread operator)
- [x] Functions memoized with `useCallback`
- [x] Context value memoized with `useMemo`
- [x] Custom hook with error handling

---

## 🎓 Key Concepts Summary

### 1. Single Source of Truth
All state lives in one reducer, making it easier to:
- Debug issues
- Understand state changes
- Test state logic

### 2. Immutability
Always return new objects:
```javascript
// ✅ GOOD
return { ...state, cities: [...state.cities, newCity] };

// ❌ BAD
state.cities.push(newCity);
return state;
```

### 3. Pure Reducer
- No side effects inside reducer
- Async operations happen outside
- Then dispatch actions

### 4. Event-Based Actions
Actions describe what happened:
- `cities/loaded` ✅
- `loadCities` ❌

### 5. Separation of Concerns
- **Reducer**: State updates
- **Functions**: Side effects (API calls)
- **Components**: UI rendering

---

## 🔍 Common Patterns

### Pattern 1: Optimistic Updates

```javascript
// Update UI immediately, revert on error
case 'city/created':
  return {
    ...state,
    cities: [...state.cities, action.payload],
  };

case 'city/create-failed':
  // Revert optimistic update
  return {
    ...state,
    cities: state.cities.filter(c => c.id !== action.payload.id),
  };
```

### Pattern 2: Loading States

```javascript
// Separate loading states for different operations
case 'cities/loading-started':
  return { ...state, isLoadingCities: true };

case 'city/loading-started':
  return { ...state, isLoadingCity: true };
```

### Pattern 3: Error Recovery

```javascript
case 'error/occurred':
  return {
    ...state,
    error: action.payload,
    // Stop all loading
    isLoading: false,
    isLoadingCity: false,
  };

case 'error/cleared':
  return { ...state, error: null };
```

---

## 🚀 Learning Exercises

### Exercise 1: Add Update City Action

**Task:** Add ability to update a city's notes

1. Add `city/updated` case to reducer
2. Create `updateCity` function
3. Test updating a city's notes

**Solution:**
```javascript
// Reducer case
case 'city/updated':
  return {
    ...state,
    cities: state.cities.map(city =>
      city.id === action.payload.id
        ? { ...city, ...action.payload }
        : city
    ),
    currentCity: state.currentCity?.id === action.payload.id
      ? { ...state.currentCity, ...action.payload }
      : state.currentCity,
  };

// Function
const updateCity = useCallback(async (id, updates) => {
  try {
    const res = await fetch(`${DATABASE_URL}/cities/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
      headers: { 'Content-Type': 'application/json' },
    });
    
    if (!res.ok) throw new Error('Failed to update city');
    const data = await res.json();
    
    dispatch({ type: 'city/updated', payload: data });
    return data;
  } catch (error) {
    dispatch({ type: 'error/occurred', payload: error.message });
    throw error;
  }
}, []);
```

### Exercise 2: Add Optimistic Updates

**Task:** Update UI immediately, revert on error

1. Dispatch optimistic action immediately
2. Make API call
3. Revert if error occurs

### Exercise 3: Add Pagination

**Task:** Load cities in pages

1. Add `page` and `hasMore` to state
2. Create `loadMoreCities` function
3. Update reducer to handle pagination

### Exercise 4: Add Caching

**Task:** Skip fetch if data already loaded

1. Check if cities array has data
2. Only fetch if empty
3. Add `lastFetched` timestamp

---

## 📝 Summary

This pattern combines:
- **Context API** for sharing state
- **useReducer** for managing state
- **Pure reducer** for predictable updates
- **Async functions** for side effects

**Benefits:**
- ✅ Single source of truth
- ✅ Predictable state updates
- ✅ Easy to test
- ✅ Scalable pattern
- ✅ Better error handling

**When to use:**
- Complex state with multiple related values
- State shared across many components
- Need predictable state management
- Want to avoid prop drilling

---

## 🔗 Related Topics

- Context API Guide (229)
- React Hooks (useState, useEffect, useCallback, useMemo)
- Redux (similar patterns)
- State Management Patterns

---

## 📚 Additional Resources

- [React useReducer Hook](https://react.dev/reference/react/useReducer)
- [React Context API](https://react.dev/reference/react/createContext)
- [Redux Style Guide](https://redux.js.org/style-guide/)

---

**Next Steps:**
1. Practice with the exercises above
2. Try implementing optimistic updates
3. Add more features using the same pattern
4. Explore Redux for larger applications

