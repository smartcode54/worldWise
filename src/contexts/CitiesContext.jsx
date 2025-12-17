/* eslint-disable react-refresh/only-export-components */
import { createContext, useReducer, useEffect, useContext, useMemo, useCallback } from 'react';

const DATABASE_URL = 'http://localhost:8000';

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
    case 'loading/started':
      return { ...state, isLoading: true, error: null };

    case 'loading/finished':
      return { ...state, isLoading: false };

    case 'city/loading-started':
      return { ...state, isLoadingCity: true, error: null };

    case 'city/loading-finished':
      return { ...state, isLoadingCity: false };
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

function CitiesProvider({ children }) {
  const [state, dispatch] = useReducer(citiesReducer, initialState);
  const { cities, isLoading, currentCity, isLoadingCity, error } = state;

  const fetchCities = useCallback(async () => {
    try {
      dispatch({ type: 'loading/started' });

      const res = await fetch(`${DATABASE_URL}/cities`);
      if (!res.ok) throw new Error('Failed to fetch cities');

      const data = await res.json();
      console.log('API Response:', data);
      const citiesArray = Array.isArray(data) ? data : data.cities || [];

      dispatch({ type: 'cities/loaded', payload: citiesArray });
    } catch (error) {
      console.error('Error fetching cities:', error);
      dispatch({ type: 'error/occurred', payload: error.message });
    }
  }, []);

  useEffect(() => {
    fetchCities();
  }, [fetchCities]);

  const createCity = useCallback(async (newCity) => {
    try {
      const res = await fetch(`${DATABASE_URL}/cities`, {
        method: 'POST',
        body: JSON.stringify(newCity),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) throw new Error('Failed to create city');

      const data = await res.json();
      console.log('API Response:', data);

      dispatch({ type: 'city/created', payload: data });
      return data;
    } catch (error) {
      console.error('Error creating city:', error);
      dispatch({ type: 'error/occurred', payload: error.message });
      throw error;
    }
  }, []);

  const deleteCity = useCallback(async (id) => {
    try {
      const res = await fetch(`${DATABASE_URL}/cities/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete city');

      dispatch({ type: 'city/deleted', payload: id });
    } catch (error) {
      console.error('Error deleting city:', error);
      dispatch({ type: 'error/occurred', payload: error.message });
      throw error;
    }
  }, []);

  const getCity = useCallback((id) => {
    return cities.find(city => city.id === parseInt(id));
  }, [cities]);

  const handleCityClick = useCallback(async (cityId) => {
    try {
      dispatch({ type: 'city/loading-started' });

      const city = cities.find(c => c.id === parseInt(cityId));

      if (city) {
        // Simulate loading delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        dispatch({ type: 'city/selected', payload: city });
      } else {
        throw new Error('City not found');
      }
    } catch (error) {
      console.error('Error selecting city:', error);
      dispatch({ type: 'error/occurred', payload: error.message });
    }
  }, [cities]);

  // Backward compatibility: derive selectedCityId from currentCity
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
    [cities, isLoading, currentCity, isLoadingCity, error, getCity, selectedCityId, handleCityClick, setSelectedCityId, createCity, deleteCity, fetchCities]
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
    throw new Error('useCities must be used within a CitiesProvider');
  }
  return context;
}

export { CitiesProvider, useCities };