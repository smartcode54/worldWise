// Using OpenStreetMap Nominatim API - free, no API key required
// "https://nominatim.openstreetmap.org/reverse?lat=0&lon=0&format=json"

import { useState, useEffect } from "react";
import Button from "./Button";
import BackButton from "./BackButton";
import styles from "./Form.module.css";
import useUrlPosition from "../hooks/useUrlPosition";
import { convertToEmoji } from "../utils";

// Using OpenStreetMap Nominatim - free, no API key required, no IP bans
const BASE_URL = "https://nominatim.openstreetmap.org/reverse";

// Helper function to format date to datetime-local format
function formatDateTimeLocal(date) {
  if (!date) {
    const now = new Date();
    date = now;
  }
  
  // If date is already a string in correct format, return it
  if (typeof date === 'string' && date.includes('T')) {
    return date;
  }
  
  // Convert Date object to string
  const d = date instanceof Date ? date : new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;  // ✅ Removed seconds
}

function Form() {  
  const [lat, lng] = useUrlPosition();
  
  const [cityName, setCityName] = useState("");
  const [countryName, setCountryName] = useState("");  // ✅ Add countryName state
  const [emoji, setEmoji] = useState("");
  const [date, setDate] = useState(() => formatDateTimeLocal(new Date()));
  const [notes, setNotes] = useState("");
  const [isLoadingGeocoding, setIsLoadingGeocoding] = useState(false);
  const [error, setError] = useState("");  // ✅ Add error state

  useEffect(function(){
    async function fetchCityData() {
      if (!lat || !lng) {
        // ✅ Clear form if no coordinates
        setCityName("");
        setCountryName("");
        setEmoji("");
        setError("");
        return;
      }
      
      // ✅ RESET FORM STATE when coordinates change
      setCityName("");
      setCountryName("");
      setEmoji("");
      setError("");
      
      // ✅ Validate coordinates before making API call
      const latNum = Number(lat);
      const lngNum = Number(lng);
      
      if (isNaN(latNum) || isNaN(lngNum)) {
        const errorMsg = `Invalid coordinates: lat=${lat}, lng=${lng}`;
        console.error(errorMsg);
        setError(errorMsg);
        return;
      }
      
      if (latNum < -90 || latNum > 90) {
        const errorMsg = `Latitude out of range: ${latNum}. Must be between -90 and 90.`;
        console.error(errorMsg);
        setError(errorMsg);
        return;
      }
      
      if (lngNum < -180 || lngNum > 180) {
        const errorMsg = `Longitude out of range: ${lngNum}. Must be between -180 and 180.`;
        console.error(errorMsg);
        setError(errorMsg);
        return;
      }

      
      try {
        setIsLoadingGeocoding(true);
        // Use URLSearchParams for proper URL encoding
        // Nominatim API format: lat, lon, format=json
        const params = new URLSearchParams({
          lat: latNum.toString(),
          lon: lngNum.toString(),
          format: 'json',
          addressdetails: '1',
          'accept-language': 'en'
        });
        const url = `${BASE_URL}?${params.toString()}`;
        console.log("Fetching from:", url);
        
        // Nominatim requires a User-Agent header
        const res = await fetch(url, {
          headers: {
            'User-Agent': 'WorldWiseApp/1.0' // Required by Nominatim
          }
        });
        
        if (!res.ok) {
          // Try to get error details from the response
          let errorMessage = `Failed to fetch city data (${res.status} ${res.statusText})`;
          try {
            const errorData = await res.json();
            errorMessage = errorData.error?.message || errorMessage;
            console.error("API Error Response:", errorData);
          } catch {
            // If response is not JSON, use the status text
            console.error("API Error Status:", res.status, res.statusText);            
          }
          throw new Error(errorMessage);
        }
        
        const data = await res.json();
        console.log("Fetched city data:", data);
        
        // Nominatim response structure is different
        if (!data || !data.address) {
          const errorMsg = `No location data found for coordinates: lat=${latNum}, lng=${lngNum}. Please try a different location.`;
          console.error(errorMsg);
          setError(errorMsg);
          return;
        }
        
        const address = data.address;
        // Extract city name from various possible fields in Nominatim response
        const city = address.city || 
                     address.town || 
                     address.village || 
                     address.municipality ||
                     address.county ||
                     address.state_district ||
                     "";
        
        const countryName = address.country || "";
        const countryCode = address.country_code?.toUpperCase() || "";
        
        if (!city && !countryName) {
          const errorMsg = `No location data found for coordinates: lat=${latNum}, lng=${lngNum}. Please try a different location.`;
          console.error(errorMsg);
          setError(errorMsg);
          return;
        }
        
        setCityName(city);
        setCountryName(countryName);
        setEmoji(convertToEmoji(countryCode));
      } catch (error) {
        console.error(error);
        setError(`Failed to fetch city data: ${error.message}`);
      } finally {
        setIsLoadingGeocoding(false);
      }
    }
    fetchCityData();
  }, [lat, lng]);  // ✅ Dependencies: lat and lng trigger effect when coordinates change

  function handleSubmit(e) {
    e.preventDefault();
    console.log(cityName, date, notes);
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      {isLoadingGeocoding && <p>Loading city data...</p>}
      {error && <p style={{ color: 'red', padding: '1rem', background: '#ffebee', borderRadius: '5px' }}>{error}</p>}  {/* ✅ Display error */}
      
      <div className={styles.row}>
        <label htmlFor="cityName">City name</label>
        <input
          id="cityName"
          onChange={(e) => {
            // ✅ Handle input change - extract cityName if user edits
            const value = e.target.value;
            setCityName(value);
          }}
          value={cityName && countryName ? `${cityName}, ${countryName}` : cityName}  // ✅ Display both separated by comma
          disabled={isLoadingGeocoding}
        />
        {emoji && <span className={styles.flag}>{emoji}</span>}
      </div>

      <div className={styles.row}>
        <label htmlFor="date">When did you go to {cityName || "this city"}?</label>
        <input
          id="date"
          type="datetime-local"
          onChange={(e) => setDate(e.target.value)}
          value={date}
        />
      </div>

      <div className={styles.row}>
        <label htmlFor="notes">Notes about your trip to {cityName || "this city"}</label>
        <textarea
          id="notes"
          onChange={(e) => setNotes(e.target.value)}
          value={notes}
        />
      </div>

      <div className={styles.buttons}>
        <Button type ="primary" onClick={handleSubmit}>Add</Button>
        <BackButton type="back" />
      </div>
    </form>
  );
}

export default Form;
