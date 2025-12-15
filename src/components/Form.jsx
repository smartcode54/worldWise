// "https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=0&longitude=0"

import { useState, useEffect } from "react";
import Button from "./Button";
import BackButton from "./BackButton";
import styles from "./Form.module.css";
import useUrlPosition from "../hooks/useUrlPosition";
import { convertToEmoji } from "../utils";

const BASE_URL = "https://api.bigdatacloud.net/data/reverse-geocode-client";

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
  
  // ✅ Create a unique key from coordinates to ensure useEffect triggers on any change
  const coordKey = lat !== null && lng !== null ? `${lat},${lng}` : null;

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
        const res = await fetch(`${BASE_URL}?latitude=${latNum}&longitude=${lngNum}`);
        if (!res.ok) throw new Error("Failed to fetch city data");
        const data = await res.json();
        if (!data.city) {
          const errorMsg = `No city found for coordinates: lat=${latNum}, lng=${lngNum} please try again`;
          console.error(errorMsg);
          setError(errorMsg);
          return;
        }
        console.log("Fetched city data:", data);
        setCityName(data.city || data.locality || "");
        setCountryName(data.countryName || "");  // ✅ Store countryName
        setEmoji(convertToEmoji(data.countryCode || ""));
      } catch (error) {
        console.error(error);
        setError(`Failed to fetch city data: ${error.message}`);
      } finally {
        setIsLoadingGeocoding(false);
      }
    }
    fetchCityData();
  }, [coordKey]);  // ✅ Use coordKey instead of [lat, lng] to ensure proper change detection

 

  return (
    <form className={styles.form}>
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
        <Button type ="primary">Add</Button>
        <BackButton type="back" />
      </div>
    </form>
  );
}

export default Form;
