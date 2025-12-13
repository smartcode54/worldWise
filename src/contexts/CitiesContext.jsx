/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect, useContext, useMemo } from 'react';

const DATABASE_URL = 'http://localhost:8000';

const CitiesContext = createContext();

function CitiesProvider({ children }) {
  const [cities, setCities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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

  const value = useMemo(
    () => ({
      cities,
      isLoading,
    }),
    [cities, isLoading]
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