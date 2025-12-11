import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Homepage from './pages/Homepage';
import Product from './pages/Product';
import Pricing from './pages/Pricing';
import AppLayout from './pages/AppLayout';
import PageNotFound from './pages/PageNotFound';
import Login from './pages/Login';
import CityList from './components/CityList';
import CountryList from './components/CountryList';
import City from './components/City';
import Form from './components/Form';

const DATABASE_URL = 'http://localhost:8000';

function App() {
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
        alert('Failed to fetch cities');
      } finally {
        setIsLoading(false);
      }
    }
    fetchCities();
  }, []);
  
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/product" element={<Product />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/app" element={<AppLayout />}>
          <Route index element= 
              {<CityList cities={cities} isLoading={isLoading} />} />
              <Route path="cities" element=
              {<CityList cities={cities} isLoading={isLoading} />} />
              <Route path="cities/:id" element={<City cities={cities} />} />
          <Route path="countries" element={<CountryList cities={cities} isLoading={isLoading} />} />
          <Route path="form" element={<Form />} />
        </Route>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;