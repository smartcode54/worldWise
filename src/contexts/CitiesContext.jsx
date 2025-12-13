/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect, useContext, useMemo } from 'react';

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

  const getCity = (id) => {
    return cities.find(city => city.id === parseInt(id));
  };

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
    }),
    [cities, isLoading, selectedCityId, isLoadingCity]
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