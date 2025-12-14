# Step-by-Step Guide: React Context API Flow

## Overview
This guide explains how the Context API works in this project, from creating the context to consuming it in components.

---

## STEP 1: Create the Context (`CitiesContext.jsx`)

### 1.1 Import Required React Hooks
```javascript
import { createContext, useState, useEffect, useContext, useMemo } from 'react';
```
- `createContext`: Creates a new context object
- `useState`: Manages component state
- `useEffect`: Handles side effects (API calls)
- `useContext`: Consumes context in components
- `useMemo`: Optimizes context value to prevent unnecessary re-renders

### 1.2 Create the Context Object
```javascript
const CitiesContext = createContext();
```
- Creates an empty context container
- This will hold our shared state (cities and isLoading)

### 1.3 Create the Provider Component
```javascript
function CitiesProvider({ children }) {
  // State management
  const [cities, setCities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // ... rest of the component
}
```
- `CitiesProvider` is a component that wraps other components
- `children` prop receives all components that need access to the context
- Manages the state that will be shared across components

### 1.4 Fetch Data with useEffect
```javascript
useEffect(() => {
  async function fetchCities() {
    try {
      setIsLoading(true);
      const res = await fetch(`${DATABASE_URL}/cities`);
      if (!res.ok) throw new Error('Failed to fetch cities');
      const data = await res.json();
      setCities(Array.isArray(data) ? data : data.cities || []);
    } catch (error) {
      console.error('Error fetching cities:', error);
      setCities([]);
    } finally {
      setIsLoading(false);
    }
  }
  fetchCities();
}, []);
```
- Runs once when component mounts (empty dependency array `[]`)
- Fetches cities from API
- Updates `cities` and `isLoading` state

### 1.5 Memoize the Context Value
```javascript
const value = useMemo(
  () => ({
    cities,
    isLoading,
  }),
  [cities, isLoading]
);
```
- Creates a memoized object containing shared data
- Only recreates when `cities` or `isLoading` changes
- Prevents unnecessary re-renders of consuming components

### 1.6 Return the Provider with Value
```javascript
return (
  <CitiesContext.Provider value={value}>
    {children}
  </CitiesContext.Provider>
);
```
- `CitiesContext.Provider` makes the context value available to all children
- `value={value}` passes the shared state down
- `{children}` renders all wrapped components

### 1.7 Create Custom Hook for Consumption
```javascript
function useCities() {
  const context = useContext(CitiesContext);
  if (context === undefined) {
    throw new Error('useCities must be used within a CitiesProvider');
  }
  return context;
}
```
- Custom hook that uses `useContext` internally
- Provides error checking to ensure it's used within a Provider
- Returns the context value (cities and isLoading)

### 1.8 Export Provider and Hook
```javascript
export { CitiesProvider, useCities };
```
- Exports both the Provider component and the custom hook
- Other files can import and use them

---

## STEP 2: Wrap App with Provider (`App.jsx`)

### 2.1 Import the Provider
```javascript
import { CitiesProvider } from './contexts/CitiesContext';
```

### 2.2 Wrap the Application
```javascript
function App() {
  return (
    <CitiesProvider>
      <BrowserRouter>
        <Routes>
          {/* All routes here */}
        </Routes>
      </BrowserRouter>
    </CitiesProvider>
  );
}
```
- `CitiesProvider` wraps the entire app
- All components inside can now access the context
- Must be at the top level to provide context to all routes

**Visual Flow:**
```
App
└── CitiesProvider (provides context)
    └── BrowserRouter
        └── Routes
            ├── CityList (can access context)
            ├── CountryList (can access context)
            └── City (can access context)
```

---

## STEP 3: Consume Context in CityList Component

### 3.1 Import the Custom Hook
```javascript
import { useCities } from '../contexts/CitiesContext';
```

### 3.2 Use the Hook to Get Context Data
```javascript
function CityList() {
  const { cities, isLoading } = useCities();
  // cities: array of city objects
  // isLoading: boolean indicating loading state
}
```
- `useCities()` returns the context value
- Destructure to get `cities` and `isLoading`
- These are the same values managed in `CitiesProvider`

### 3.3 Handle Loading State
```javascript
if (isLoading) return <Spinner />;
```
- Shows spinner while data is being fetched
- Prevents rendering before data is ready

### 3.4 Handle Empty State
```javascript
if (cities.length === 0) return <Message message="Add your first city..." />;
```
- Shows message when no cities exist
- Better UX than showing empty list

### 3.5 Render the City List
```javascript
return (
  <ul className={styles.cityList}>
    {cities.map((city) => (
      <CityItem key={city.id} city={city} />
    ))}
  </ul>
);
```
- Maps over `cities` array from context
- Renders `CityItem` for each city
- Uses `city.id` as unique key

**Complete CityList Component:**
```javascript
function CityList() {
  const { cities, isLoading } = useCities();

  if (isLoading) return <Spinner />;
  if (cities.length === 0) return <Message message="Add your first city..." />;
  
  return (
    <ul className={styles.cityList}>
      {cities.map((city) => (
        <CityItem key={city.id} city={city} />
      ))}
    </ul>
  );
}
```

---

## STEP 4: Consume Context in CountryList Component

### 4.1 Import the Custom Hook
```javascript
import { useCities } from '../contexts/CitiesContext';
```

### 4.2 Use the Hook to Get Context Data
```javascript
function CountryList() {
  const { cities, isLoading } = useCities();
}
```
- Same hook, same context data
- Both components share the same data source

### 4.3 Handle Loading State
```javascript
if (isLoading) return <Spinner />;
```

### 4.4 Transform Cities to Countries
```javascript
const countries = cities.reduce((acc, city) => {
  const existingCountry = acc.find(c => c.country === city.country);
  if (!existingCountry) {
    acc.push({
      country: city.country,
      emoji: city.emoji
    });
  }
  return acc;
}, []);
```
- Takes `cities` from context
- Reduces to unique countries
- Creates array of country objects with country name and emoji

### 4.5 Handle Empty State
```javascript
if (countries.length === 0) {
  return <Message message="No countries found..." />;
}
```

### 4.6 Render the Country List
```javascript
return (
  <ul className={styles.countryList}>
    {countries.map((country, index) => (
      <CountryItem key={`${country.country}-${index}`} country={country} />
    ))}
  </ul>
);
```

**Complete CountryList Component:**
```javascript
function CountryList() {
  const { cities, isLoading } = useCities();
  
  if (isLoading) return <Spinner />;
  
  const countries = cities.reduce((acc, city) => {
    const existingCountry = acc.find(c => c.country === city.country);
    if (!existingCountry) {
      acc.push({
        country: city.country,
        emoji: city.emoji
      });
    }
    return acc;
  }, []);
  
  if (countries.length === 0) {
    return <Message message="No countries found..." />;
  }
  
  return (
    <ul className={styles.countryList}>
      {countries.map((country, index) => (
        <CountryItem key={`${country.country}-${index}`} country={country} />
      ))}
    </ul>
  );
}
```

---

## Complete Data Flow Diagram

```
┌─────────────────────────────────────┐
│  1. CitiesContext.jsx               │
│  - createContext()                  │
│  - CitiesProvider component         │
│  - useCities() hook                 │
└──────────────┬──────────────────────┘
               │ exports
               ▼
┌─────────────────────────────────────┐
│  2. App.jsx                         │
│  - Import CitiesProvider            │
│  - Wrap app: <CitiesProvider>      │
│  - Provides context to all children │
└──────────────┬──────────────────────┘
               │ context flows down
               ▼
┌─────────────────────────────────────┐
│  3. CityList.jsx                    │
│  - Import useCities                 │
│  - const { cities, isLoading } =    │
│      useCities()                    │
│  - Render cities list               │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  4. CountryList.jsx                 │
│  - Import useCities                 │
│  - const { cities, isLoading } =    │
│      useCities()                    │
│  - Transform cities to countries    │
│  - Render countries list            │
└─────────────────────────────────────┘
```

---

## Key Benefits of This Pattern

1. **Single Source of Truth**: All components use the same data
2. **No Prop Drilling**: Don't need to pass props through multiple levels
3. **Automatic Updates**: When context updates, all consumers re-render
4. **Clean Code**: Components are simpler, focused on rendering
5. **Reusable**: Any component can access context with `useCities()`

---

## Important Notes

- ✅ Context Provider must wrap components that need access
- ✅ Custom hook (`useCities`) provides error checking
- ✅ `useMemo` prevents unnecessary re-renders
- ✅ Always check `isLoading` before using data
- ✅ Handle empty states for better UX
