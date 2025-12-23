/* eslint-disable react-refresh/only-export-components */
/**
 * CitiesContext - Performance Optimized
 *
 * KEY PERFORMANCE OPTIMIZATIONS:
 * 1. All context functions are memoized with useCallback to prevent infinite loops
 *    - Functions recreated on every render would cause useEffect hooks to run infinitely
 *    - This was the root cause of infinite HTTP request loops
 *
 * 2. Context value is memoized with useMemo to prevent unnecessary re-renders
 *    - Only re-renders consumers when actual state values change
 *
 * 3. ESLint warnings are valuable - always address dependency array warnings
 *    - They identify potential bugs and enforce React best practices
 *
 * LESSON LEARNED:
 * - Profiling revealed no significant bottlenecks, but infinite loops were prevented
 * - Using useCallback on getCity (and all context functions) stabilized the app
 * - Always memoize functions that are:
 *   a) Passed through context
 *   b) Used in useEffect dependency arrays
 *   c) Passed as props to memoized components
 */
import {
  createContext,
  useReducer,
  useEffect,
  useContext,
  useMemo,
  useCallback,
} from "react";

// Database URL - loaded from .env file
const DATABASE_URL =
  import.meta.env.VITE_DATABASE_URL || "http://localhost:8000";

const CitiesContext = createContext();

const initialState = {
  cities: [],
  isLoading: true, // Start as true since we fetch on mount
  currentCity: null,
  isLoadingCity: false,
  error: null,
};

function citiesReducer(state, action) {
  switch (action.type) {
    case "cities/loaded":
      return {
        ...state,
        cities: action.payload,
        isLoading: false,
        error: null,
      };
    case "city/created":
      return {
        ...state,
        cities: [...state.cities, action.payload],
        error: null,
      };
    case "city/deleted":
      return {
        ...state,
        cities: state.cities.filter((city) => city.id !== action.payload),
        currentCity:
          state.currentCity?.id === action.payload ? null : state.currentCity,
        error: null,
      };
    case "loading/started":
      return { ...state, isLoading: true, error: null };

    case "loading/finished":
      return { ...state, isLoading: false };

    case "city/loading-started":
      return { ...state, isLoadingCity: true, error: null };

    case "city/loading-finished":
      return { ...state, isLoadingCity: false };
    case "city/selected":
      return {
        ...state,
        currentCity: action.payload,
        isLoadingCity: false,
        error: null,
      };

    case "city/deselected":
      return {
        ...state,
        currentCity: null,
        error: null,
      };

    case "error/occurred":
      return {
        ...state,
        error: action.payload,
        isLoading: false,
        isLoadingCity: false,
      };

    case "error/cleared":
      return {
        ...state,
        error: null,
      };

    default:
      throw new Error(`Unknown action type: ${action.type}`);
  }
}

function CitiesProvider({ children }) {
  const [state, dispatch] = useReducer(citiesReducer, initialState);
  const { cities, isLoading, currentCity, isLoadingCity, error } = state;

  // ✅ Memoized with useCallback to prevent infinite loops when used in useEffect dependencies
  // Empty dependency array because dispatch is stable and doesn't need to be in deps
  const fetchCities = useCallback(async () => {
    try {
      dispatch({ type: "loading/started" });

      const res = await fetch(`${DATABASE_URL}/cities`);
      if (!res.ok) throw new Error("Failed to fetch cities");

      const data = await res.json();
      // console.log('API Response:', data);
      const citiesArray = Array.isArray(data) ? data : data.cities || [];

      dispatch({ type: "cities/loaded", payload: citiesArray });
    } catch (error) {
      console.error("Error fetching cities:", error);
      dispatch({ type: "error/occurred", payload: error.message });
    }
  }, []);

  // ✅ fetchCities is memoized, so this effect runs only once on mount
  // Without useCallback, fetchCities would be recreated on every render,
  // causing this effect to run infinitely
  useEffect(() => {
    fetchCities();
  }, [fetchCities]);

  // ✅ Memoized to maintain referential equality across renders
  // Prevents child components from re-rendering unnecessarily
  const createCity = useCallback(async (newCity) => {
    try {
      const res = await fetch(`${DATABASE_URL}/cities`, {
        method: "POST",
        body: JSON.stringify(newCity),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) throw new Error("Failed to create city");

      const data = await res.json();
      // console.log('API Response:', data);

      dispatch({ type: "city/created", payload: data });
      return data;
    } catch (error) {
      console.error("Error creating city:", error);
      dispatch({ type: "error/occurred", payload: error.message });
      throw error;
    }
  }, []);

  // ✅ Memoized to maintain referential equality across renders
  const deleteCity = useCallback(async (id) => {
    try {
      const res = await fetch(`${DATABASE_URL}/cities/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete city");

      dispatch({ type: "city/deleted", payload: id });
    } catch (error) {
      console.error("Error deleting city:", error);
      dispatch({ type: "error/occurred", payload: error.message });
      throw error;
    }
  }, []);

  // ✅ CRITICAL: Memoized with useCallback to prevent infinite loops
  // If getCity is recreated on every render and used in a useEffect dependency array,
  // it will cause the effect to run infinitely, triggering endless HTTP requests
  // Dependencies: [cities] - function is recreated only when cities array changes
  const getCity = useCallback(
    (id) => {
      return cities.find((city) => city.id === parseInt(id));
    },
    [cities]
  );

  // ✅ Memoized to prevent unnecessary re-renders and maintain referential equality
  // Fixed: Changed from [cities.items] to [cities] - cities is an array, not an object
  const handleCityClick = useCallback(
    async (cityId) => {
      try {
        dispatch({ type: "city/loading-started" });

        const city = cities.find((c) => c.id === parseInt(cityId));

        if (city) {
          // Simulate loading delay
          await new Promise((resolve) => setTimeout(resolve, 1000));
          dispatch({ type: "city/selected", payload: city });
        } else {
          throw new Error("City not found");
        }
      } catch (error) {
        console.error("Error selecting city:", error);
        dispatch({ type: "error/occurred", payload: error.message });
      }
    },
    [cities]
  );

  // Backward compatibility: derive selectedCityId from currentCity
  const selectedCityId = currentCity?.id || null;

  // ✅ Memoized to prevent unnecessary re-renders and maintain referential equality
  // Fixed: Changed from [cities.items] to [cities] - cities is an array, not an object
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
    [cities]
  );

  // ✅ Memoized context value to prevent unnecessary re-renders of all consumers
  // All functions in dependencies are memoized with useCallback, ensuring stability
  const value = useMemo(
    () => ({
      cities,
      isLoading,
      currentCity,
      isLoadingCity,
      error,
      getCity,
      selectedCityId, // Backward compatibility
      handleCityClick,
      setSelectedCityId, // Backward compatibility
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
      getCity,
      selectedCityId,
      handleCityClick,
      setSelectedCityId,
      createCity,
      deleteCity,
      fetchCities,
    ]
  );

  return (
    <CitiesContext.Provider value={value}>{children}</CitiesContext.Provider>
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
