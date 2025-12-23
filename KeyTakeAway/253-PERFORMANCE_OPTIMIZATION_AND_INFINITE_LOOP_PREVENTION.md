# 253 - Performance Optimization and Infinite Loop Prevention

## 📚 Overview

This guide documents the performance optimization work done on the WorldWise application, focusing on preventing infinite loops caused by function recreation in React components. We'll cover profiling techniques, the root cause of infinite HTTP request loops, and how to use `useCallback` to stabilize functions.

---

## 🎯 Learning Objectives

By the end of this guide, you will understand:

1. How to profile React applications for performance issues
2. Why functions recreated on every render cause infinite loops
3. How to use `useCallback` to memoize functions and prevent infinite loops
4. The importance of ESLint warnings for identifying potential bugs
5. Best practices for memoization in React Context

---

## 📋 Table of Contents

1. [Profiling Results](#profiling-results)
2. [The Infinite Loop Problem](#the-infinite-loop-problem)
3. [Root Cause Analysis](#root-cause-analysis)
4. [Solution: useCallback Hook](#solution-usecallback-hook)
5. [Implementation Details](#implementation-details)
6. [ESLint Warnings](#eslint-warnings)
7. [Best Practices](#best-practices)
8. [Complete Code Example](#complete-code-example)

---

## 🔍 Profiling Results

### Performance Analysis

After profiling the WorldWise application using React DevTools Profiler:

- ✅ **No significant performance bottlenecks found**
- ✅ **No unnecessary re-renders detected**
- ✅ **Component render times were optimal**

**Key Finding:** The main issue wasn't performance bottlenecks, but rather **infinite loops** caused by function recreation.

---

## ⚠️ The Infinite Loop Problem

### Symptoms

- Endless HTTP requests to the API
- Browser tab becomes unresponsive
- Network tab shows continuous API calls
- Console shows repeated function executions

### Example of the Problem

```javascript
// ❌ BAD: Function recreated on every render
function CitiesProvider({ children }) {
  const [cities, setCities] = useState([]);
  
  // This function is recreated on EVERY render
  const getCity = (id) => {
    return cities.find(city => city.id === parseInt(id));
  };
  
  return (
    <CitiesContext.Provider value={{ cities, getCity }}>
      {children}
    </CitiesContext.Provider>
  );
}
```

### What Happens in a Component

```javascript
// Component using getCity in useEffect
function CityComponent({ id }) {
  const { getCity } = useCities();
  
  useEffect(() => {
    const city = getCity(id);
    // Do something with city
  }, [id, getCity]); // ⚠️ getCity changes on every render!
  
  // This causes:
  // 1. Component renders
  // 2. getCity is recreated (new reference)
  // 3. useEffect sees getCity changed
  // 4. useEffect runs again
  // 5. Component re-renders
  // 6. Back to step 2 → INFINITE LOOP
}
```

---

## 🔬 Root Cause Analysis

### Why Functions Are Recreated

In JavaScript, functions are objects. When you define a function inside a component:

```javascript
const getCity = (id) => {
  return cities.find(city => city.id === parseInt(id));
};
```

**Every render creates a NEW function object**, even if the code is identical. React sees this as a different value because:

```javascript
const func1 = () => {};
const func2 = () => {};
console.log(func1 === func2); // false - different objects!
```

### The Dependency Array Problem

When a function is included in a `useEffect` dependency array:

```javascript
useEffect(() => {
  getCity(id);
}, [id, getCity]); // getCity is checked for changes
```

React uses **Object.is()** (similar to `===`) to compare dependencies. Since `getCity` is a new object on every render, React thinks it changed, triggering the effect again.

### The Cascade Effect

1. **Component renders** → `getCity` is recreated
2. **useEffect runs** → Sees `getCity` changed
3. **Effect executes** → May trigger state updates or API calls
4. **State updates** → Component re-renders
5. **Back to step 1** → Infinite loop!

---

## ✅ Solution: useCallback Hook

### What is useCallback?

`useCallback` is a React hook that **memoizes a function**, returning the same function reference unless its dependencies change.

```javascript
const memoizedFunction = useCallback(
  () => {
    // Function body
  },
  [dependencies] // Only recreate if these change
);
```

### How It Prevents Infinite Loops

```javascript
// ✅ GOOD: Function memoized with useCallback
const getCity = useCallback(
  (id) => {
    return cities.find(city => city.id === parseInt(id));
  },
  [cities] // Only recreate if cities array changes
);
```

**Now:**
- `getCity` has the **same reference** across renders (unless `cities` changes)
- `useEffect` sees no change → doesn't re-run
- **No infinite loop!**

---

## 🛠️ Implementation Details

### Step 1: Memoize All Context Functions

Every function passed through context should be memoized:

```javascript
function CitiesProvider({ children }) {
  const [state, dispatch] = useReducer(citiesReducer, initialState);
  const { cities } = state;

  // ✅ Memoize fetchCities
  const fetchCities = useCallback(async () => {
    // ... fetch logic
  }, []); // Empty deps - dispatch is stable

  // ✅ Memoize createCity
  const createCity = useCallback(async (newCity) => {
    // ... create logic
  }, []); // Empty deps - dispatch is stable

  // ✅ Memoize deleteCity
  const deleteCity = useCallback(async (id) => {
    // ... delete logic
  }, []); // Empty deps - dispatch is stable

  // ✅ CRITICAL: Memoize getCity with cities dependency
  const getCity = useCallback(
    (id) => {
      return cities.find(city => city.id === parseInt(id));
    },
    [cities] // Recreate only when cities changes
  );

  // ✅ Memoize handleCityClick
  const handleCityClick = useCallback(
    async (cityId) => {
      // ... click logic
    },
    [cities] // Recreate only when cities changes
  );

  // ✅ Memoize setSelectedCityId
  const setSelectedCityId = useCallback(
    (id) => {
      // ... selection logic
    },
    [cities] // Recreate only when cities changes
  );
}
```

### Step 2: Memoize Context Value

Prevent unnecessary re-renders of all consumers:

```javascript
// ✅ Memoize the entire context value
const value = useMemo(
  () => ({
    cities,
    isLoading,
    currentCity,
    isLoadingCity,
    error,
    getCity,
    selectedCityId,
    handleCityClick,
    setSelectedCityId,
    createCity,
    deleteCity,
    fetchCities,
  }),
  [
    cities,
    isLoading,
    currentCity,
    isLoadingCity,
    error,
    getCity,        // ✅ All functions are memoized
    selectedCityId,
    handleCityClick,
    setSelectedCityId,
    createCity,
    deleteCity,
    fetchCities,
  ]
);

return (
  <CitiesContext.Provider value={value}>
    {children}
  </CitiesContext.Provider>
);
```

### Step 3: Use Memoized Functions in Components

Components can safely use these functions in `useEffect`:

```javascript
function City() {
  const { id } = useParams();
  const { getCity, setSelectedCityId } = useCities();

  // ✅ Safe: setSelectedCityId is memoized, won't cause infinite loop
  useEffect(() => {
    if (id) {
      setSelectedCityId(parseInt(id));
    }
  }, [id, setSelectedCityId]); // Safe to include!
}
```

---

## 📝 ESLint Warnings

### Why ESLint Warnings Matter

ESLint's `react-hooks/exhaustive-deps` rule is **invaluable** for catching potential bugs:

```javascript
useEffect(() => {
  getCity(id);
}, [id]); // ⚠️ ESLint warning: getCity is missing from deps
```

**The warning tells you:**
- `getCity` is used but not in dependencies
- This could cause stale closures or missing updates
- If you add it without memoizing, you'll get an infinite loop

### ESLint Configuration

Ensure your ESLint config includes React Hooks rules:

```javascript
// eslint.config.js
import reactHooks from 'eslint-plugin-react-hooks';

export default {
  plugins: ['react-hooks'],
  rules: {
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn', // ⚠️ Important!
  },
};
```

### How to Address Warnings

1. **Read the warning carefully** - Understand what's missing
2. **Check if the function is memoized** - If not, memoize it first
3. **Add to dependencies** - Only after memoization
4. **Test thoroughly** - Verify no infinite loops

---

## 🎯 Best Practices

### 1. Always Memoize Context Functions

```javascript
// ✅ DO: Memoize all functions passed through context
const getCity = useCallback((id) => {
  return cities.find(city => city.id === parseInt(id));
}, [cities]);
```

```javascript
// ❌ DON'T: Create functions without memoization
const getCity = (id) => {
  return cities.find(city => city.id === parseInt(id));
};
```

### 2. Include Correct Dependencies

```javascript
// ✅ DO: Include all dependencies
const getCity = useCallback(
  (id) => {
    return cities.find(city => city.id === parseInt(id));
  },
  [cities] // ✅ cities is used in the function
);
```

```javascript
// ❌ DON'T: Forget dependencies or use wrong ones
const getCity = useCallback(
  (id) => {
    return cities.find(city => city.id === parseInt(id));
  },
  [] // ❌ Missing cities dependency - stale closure!
);
```

### 3. Memoize Context Value

```javascript
// ✅ DO: Memoize the entire context value
const value = useMemo(() => ({
  cities,
  getCity,
  // ... other values
}), [cities, getCity, /* ... */]);
```

### 4. When to Use useCallback

Use `useCallback` when a function is:
- ✅ Passed through Context
- ✅ Used in `useEffect` dependency arrays
- ✅ Passed as props to memoized components (`React.memo`)
- ✅ Used as a dependency in other hooks

**Don't use `useCallback` for:**
- ❌ Functions only used in event handlers (unless passed to memoized children)
- ❌ Functions that don't need referential equality
- ❌ Premature optimization without a clear need

### 5. Common Pitfalls

#### Pitfall 1: Wrong Dependency Array

```javascript
// ❌ WRONG: cities.items doesn't exist (cities is an array)
const handleCityClick = useCallback(
  async (cityId) => {
    const city = cities.find(c => c.id === parseInt(cityId));
    // ...
  },
  [cities.items] // ❌ Should be [cities]
);
```

```javascript
// ✅ CORRECT: Use the actual dependency
const handleCityClick = useCallback(
  async (cityId) => {
    const city = cities.find(c => c.id === parseInt(cityId));
    // ...
  },
  [cities] // ✅ Correct
);
```

#### Pitfall 2: Missing Dependencies

```javascript
// ❌ WRONG: Missing cities dependency
const getCity = useCallback(
  (id) => {
    return cities.find(city => city.id === parseInt(id));
  },
  [] // ❌ Will have stale cities reference
);
```

#### Pitfall 3: Over-Memoization

```javascript
// ❌ UNNECESSARY: Simple function that's not reused
const formatDate = useCallback((date) => {
  return new Date(date).toLocaleDateString();
}, []); // ❌ Not needed - only used locally
```

---

## 📄 Complete Code Example

### CitiesContext.jsx (Optimized)

```javascript
/**
 * CitiesContext - Performance Optimized
 * 
 * KEY PERFORMANCE OPTIMIZATIONS:
 * 1. All context functions are memoized with useCallback to prevent infinite loops
 * 2. Context value is memoized with useMemo to prevent unnecessary re-renders
 * 3. ESLint warnings are valuable - always address dependency array warnings
 */
import {
  createContext,
  useReducer,
  useEffect,
  useContext,
  useMemo,
  useCallback,
} from "react";

const CitiesContext = createContext();

function CitiesProvider({ children }) {
  const [state, dispatch] = useReducer(citiesReducer, initialState);
  const { cities, isLoading, currentCity, isLoadingCity, error } = state;

  // ✅ Memoized with useCallback to prevent infinite loops
  const fetchCities = useCallback(async () => {
    try {
      dispatch({ type: "loading/started" });
      const res = await fetch(`${DATABASE_URL}/cities`);
      if (!res.ok) throw new Error("Failed to fetch cities");
      const data = await res.json();
      const citiesArray = Array.isArray(data) ? data : data.cities || [];
      dispatch({ type: "cities/loaded", payload: citiesArray });
    } catch (error) {
      dispatch({ type: "error/occurred", payload: error.message });
    }
  }, []);

  // ✅ fetchCities is memoized, so this effect runs only once on mount
  useEffect(() => {
    fetchCities();
  }, [fetchCities]);

  // ✅ Memoized to maintain referential equality
  const createCity = useCallback(async (newCity) => {
    try {
      const res = await fetch(`${DATABASE_URL}/cities`, {
        method: "POST",
        body: JSON.stringify(newCity),
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Failed to create city");
      const data = await res.json();
      dispatch({ type: "city/created", payload: data });
      return data;
    } catch (error) {
      dispatch({ type: "error/occurred", payload: error.message });
      throw error;
    }
  }, []);

  // ✅ Memoized to maintain referential equality
  const deleteCity = useCallback(async (id) => {
    try {
      const res = await fetch(`${DATABASE_URL}/cities/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete city");
      dispatch({ type: "city/deleted", payload: id });
    } catch (error) {
      dispatch({ type: "error/occurred", payload: error.message });
      throw error;
    }
  }, []);

  // ✅ CRITICAL: Memoized with useCallback to prevent infinite loops
  // If getCity is recreated on every render and used in a useEffect dependency array,
  // it will cause the effect to run infinitely, triggering endless HTTP requests
  const getCity = useCallback(
    (id) => {
      return cities.find((city) => city.id === parseInt(id));
    },
    [cities] // Only recreate when cities array changes
  );

  // ✅ Memoized to prevent unnecessary re-renders
  const handleCityClick = useCallback(
    async (cityId) => {
      try {
        dispatch({ type: "city/loading-started" });
        const city = cities.find((c) => c.id === parseInt(cityId));
        if (city) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          dispatch({ type: "city/selected", payload: city });
        } else {
          throw new Error("City not found");
        }
      } catch (error) {
        dispatch({ type: "error/occurred", payload: error.message });
      }
    },
    [cities] // Only recreate when cities array changes
  );

  // ✅ Memoized to prevent unnecessary re-renders
  const setSelectedCityId = useCallback(
    (id) => {
      if (id === null) {
        dispatch({ type: "city/deselected" });
      } else {
        const city = cities.find((c) => c.id === parseInt(id));
        if (city) {
          dispatch({ type: "city/selected", payload: city });
        }
      }
    },
    [cities] // Only recreate when cities array changes
  );

  const selectedCityId = currentCity?.id || null;

  // ✅ Memoized context value to prevent unnecessary re-renders of all consumers
  const value = useMemo(
    () => ({
      cities,
      isLoading,
      currentCity,
      isLoadingCity,
      error,
      getCity,
      selectedCityId,
      handleCityClick,
      setSelectedCityId,
      createCity,
      deleteCity,
      fetchCities,
    }),
    [
      cities,
      isLoading,
      currentCity,
      isLoadingCity,
      error,
      getCity, // ✅ All functions are memoized
      selectedCityId,
      handleCityClick,
      setSelectedCityId,
      createCity,
      deleteCity,
      fetchCities,
    ]
  );

  return (
    <CitiesContext.Provider value={value}>
      {children}
    </CitiesContext.Provider>
  );
}

function useCities() {
  const context = useContext(CitiesContext);
  if (context === undefined) {
    throw new Error("useCities must be used within a CitiesProvider");
  }
  return context;
}

export { CitiesProvider, useCities };
```

### Component Using Memoized Functions

```javascript
function City() {
  const { id } = useParams();
  const { getCity, setSelectedCityId } = useCities();

  // ✅ Safe: setSelectedCityId is memoized, won't cause infinite loop
  useEffect(() => {
    if (id) {
      setSelectedCityId(parseInt(id));
    }
  }, [id, setSelectedCityId]); // ✅ Safe to include!

  const currentCity = getCity(id);

  // ... rest of component
}
```

---

## 📊 Summary

### Key Takeaways

1. **Profiling revealed no significant bottlenecks** - The main issue was infinite loops, not performance
2. **Functions recreated on every render cause infinite loops** - When used in `useEffect` dependency arrays
3. **`useCallback` stabilizes functions** - Prevents infinite loops by maintaining referential equality
4. **ESLint warnings are valuable** - They identify potential bugs and enforce best practices

### When to Memoize

✅ **Always memoize:**
- Functions passed through Context
- Functions used in `useEffect` dependency arrays
- Functions passed to memoized components

❌ **Don't over-memoize:**
- Simple local functions
- Functions not used as dependencies
- Premature optimization without clear need

### The Fix Checklist

- [ ] Identify functions passed through context
- [ ] Wrap all context functions with `useCallback`
- [ ] Include correct dependencies in `useCallback`
- [ ] Memoize the context value with `useMemo`
- [ ] Verify ESLint warnings are resolved
- [ ] Test for infinite loops
- [ ] Profile to confirm no performance issues

---

## 🔗 Related Topics

- [Context API Guide](./229-CONTEXT_API_GUIDE.md)
- [State Management with Pure Reducer](./237-STATE_MANAGEMENT_WITH_PURE_REDUCER.md)
- React Hooks Documentation: [useCallback](https://react.dev/reference/react/useCallback)
- React Hooks Documentation: [useMemo](https://react.dev/reference/react/useMemo)

---

## 🎓 Practice Exercise

1. **Identify the Problem**: Find a component that uses a context function in `useEffect`
2. **Check Memoization**: Verify the function is memoized with `useCallback`
3. **Fix if Needed**: Add `useCallback` if missing
4. **Test**: Verify no infinite loops occur
5. **Profile**: Use React DevTools to confirm optimal performance

---

**Remember:** Performance optimization is important, but preventing bugs (like infinite loops) is even more critical. Always memoize functions that are used as dependencies!

