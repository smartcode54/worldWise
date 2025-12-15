/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect, useContext, useMemo, useCallback } from 'react';

const DATABASE_URL = 'http://localhost:8000';

const CitiesContext = createContext();

function CitiesProvider({ children }) {
  const [cities, setCities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCityId, setSelectedCityId] = useState(null);
  const [isLoadingCity, setIsLoadingCity] = useState(false);
    

  useEffect(() => {
    async function fetchCities() {
      try {
        setIsLoading(true);
        const res = await fetch(`${DATABASE_URL}/cities`);
        if (!res.ok) throw new Error('Failed to fetch cities');
        const data = await res.json();
        console.log('API Response:', data);
        // json-server returns array directly at /cities endpoint
        // If it returns { cities: [...] }, use: setCities(data.cities)
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

  // Moved createCity outside useEffect and use functional update
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
      const data = await res.json(); // Parse JSON once
      console.log('API Response:', data);
      // Use functional update to avoid dependency on cities
      setCities((c) => [...c, data]);
      return data;
    } catch (error) {
      console.error('Error creating city:', error);
      throw error;
    }
  }, []); // No dependencies needed since we use functional update

  // Delete city function
  const deleteCity = useCallback(async (id) => {
    try {
      const res = await fetch(`${DATABASE_URL}/cities/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete city');
      // Use functional update to avoid dependency on cities
      setCities((c) => c.filter((city) => city.id !== id));
    } catch (error) {
      console.error('Error deleting city:', error);
      throw error;
    }
  }, []); // No dependencies needed since we use functional update

  // Wrapped getCity in useCallback
  const getCity = useCallback((id) => {
    return cities.find(city => city.id === parseInt(id));
  }, [cities]);

  const handleCityClick = async (cityId) => {
    setSelectedCityId(cityId);
    setIsLoadingCity(true);
    // Simulate loading delay (you can remove this if not needed)
    setTimeout(() => {
      setIsLoadingCity(false);
    }, 1000);
  };

  const value = useMemo(
    () => ({
      cities,
      isLoading,
      getCity,
      selectedCityId,
      isLoadingCity,
      handleCityClick,
      setSelectedCityId,
      createCity,
      deleteCity, // Add deleteCity to context value
    }),
    [cities, isLoading, selectedCityId, isLoadingCity, getCity, createCity, deleteCity] // Include all dependencies
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