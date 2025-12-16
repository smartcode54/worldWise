# Step-by-Step Guide: Fetching City Data in the Form

## Overview
This guide explains how to fetch city data using reverse geocoding when a user clicks on the map. It covers reading coordinates from URL parameters, fetching city information from an external API, converting country codes to flag emojis, and properly formatting date/time inputs.

---

## STEP 1: Understanding the Requirements

### 1.1 What We Need to Build
- Read latitude and longitude from URL search parameters
- Fetch city data using reverse geocoding API when coordinates are available
- Convert country codes to flag emojis
- Format date/time properly for datetime-local input
- Handle loading and error states
- Auto-populate form fields with fetched data

### 1.2 Key Concepts
- **Reverse Geocoding**: Converting coordinates (lat/lng) to location data (city, country)
- **URL Parameters**: Reading data from URL query strings using React Router
- **Custom Hooks**: Reusable logic for reading URL position
- **Date Formatting**: Converting Date objects to HTML5 datetime-local format
- **Country Code to Emoji**: Converting ISO country codes to flag emojis

---

## STEP 2: Create the useUrlPosition Hook

### 2.1 Create the Hook File
Create a new file: `src/hooks/useUrlPosition.js`

### 2.2 Implement the Hook
import React from 'react'
import { useSearchParams } from 'react-router-dom';

function useUrlPosition() {
  const [searchParams] = useSearchParams();
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");
  
  return [lat, lng];
}

export default useUrlPosition### 2.3 Hook Breakdown
**Purpose:**
- Extracts latitude and longitude from URL search parameters
- Returns coordinates as an array `[lat, lng]`

**How it Works:**
- Uses `useSearchParams()` from React Router to access URL parameters
- Reads `lat` and `lng` from query string (e.g., `?lat=40.7128&lng=-74.0060`)
- Returns both values as an array

**Key Points:**
- Returns `null` if parameters don't exist
- Values are strings, may need conversion to numbers if needed
- Reusable across components that need map coordinates

---

## STEP 3: Set Up the Form Component Structure

### 3.1 Import Required Dependenciesscript
import { useState, useEffect } from "react";
import Button from "./Button";
import BackButton from "./BackButton";
import styles from "./Form.module.css";
import useUrlPosition from "../hooks/useUrlPosition";
import { convertToEmoji } from "../utils";
### 3.2 Define API Base URL
const BASE_URL = "https://api.geoapify.com/v1/geocode/reverse";
const API_KEY = "e55a183b7d8749748a1832193dd86c74";

**API Details:**
- **Endpoint**: Geoapify Reverse Geocoding API
- **Method**: GET
- **Parameters**: `apiKey`, `lat`, `lon`, `format=json`
- **Headers**: No special headers required
- **Returns**: Results array with location data including city, country name, country code, and other location details
- **Rate Limit**: Depends on API plan (free tier available)
- **API Key**: Required - must be included in request parameters

---

## STEP 4: Create Date Formatting Helper Function

### 4.1 Why We Need This
HTML5 `datetime-local` input requires a specific string format: `yyyy-MM-ddTHH:mm`
- Date objects cannot be directly used
- Must convert to string format
- Handle edge cases (null, already formatted strings)

### 4.2 Implement the Helper Function
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
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}### 4.3 Function Breakdown
**Input Handling:**
- Handles `null` or `undefined` by using current date
- Checks if input is already a formatted string
- Converts Date objects or date strings to Date instance

**Formatting:**
- Extracts year, month, day, hours, minutes
- Uses `padStart(2, '0')` to ensure two-digit format
- Combines into `yyyy-MM-ddTHH:mm` format

**Key Points:**
- Month is 0-indexed, so add 1
- Always returns a string in the correct format
- Prevents errors when Date object is passed to input

---

## STEP 5: Set Up Component State

### 5.1 Initialize State Variablespt
function Form() {  
  const [lat, lng] = useUrlPosition();
  
  const [cityName, setCityName] = useState("");
  const [emoji, setEmoji] = useState("");
  const [date, setDate] = useState(() => formatDateTimeLocal(new Date()));
  const [notes, setNotes] = useState("");
  const [isLoadingGeocoding, setIsLoadingGeocoding] = useState(false);### 5.2 State Breakdown
**Coordinates:**
- `lat, lng`: Retrieved from URL using `useUrlPosition()` hook

**Form Fields:**
- `cityName`: City name from API or user input
- `emoji`: Country flag emoji (converted from country code)
- `date`: Formatted date/time string for datetime-local input
- `notes`: User's trip notes

**UI State:**
- `isLoadingGeocoding`: Loading indicator during API fetch

**Key Points:**
- Date uses lazy initialization with function to format immediately
- Emoji starts empty, populated after API call
- City name can be edited by user after auto-population

---

## STEP 6: Implement City Data Fetching

### 6.1 Create the useEffect Hook
useEffect(function(){
  async function fetchCityData() {
    if (!lat || !lng) return;
    
    try {
      setIsLoadingGeocoding(true);
      const latNum = Number(lat);
      const lngNum = Number(lng);
      
      // Validate coordinates before making API call
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
      
      // Use URLSearchParams for proper URL encoding
      // Geoapify API format: apiKey, lat, lon, format=json
      const params = new URLSearchParams({
        apiKey: API_KEY,
        lat: latNum.toString(),
        lon: lngNum.toString(),
        format: 'json'
      });
      
      const res = await fetch(`${BASE_URL}?${params.toString()}`);
      
      if (!res.ok) {
        // Try to get error details from the response
        let errorMessage = `Failed to fetch city data (${res.status} ${res.statusText})`;
        try {
          const errorData = await res.json();
          errorMessage = errorData.error || errorMessage;
          console.error("API Error Response:", errorData);
        } catch {
          // If response is not JSON, use the status text
          console.error("API Error Status:", res.status, res.statusText);
        }
        throw new Error(errorMessage);
      }
      
      const data = await res.json();
      
      // Geoapify response structure - data is in results array
      if (!data || !data.results || !Array.isArray(data.results) || data.results.length === 0) {
        const errorMsg = `No location data found for coordinates: lat=${latNum}, lng=${lngNum}. Please try a different location.`;
        console.error(errorMsg);
        setError(errorMsg);
        return;
      }
      
      const result = data.results[0];
      // Extract city name from Geoapify response
      const city = result.city || 
                   result.town || 
                   result.village || 
                   result.municipality ||
                   result.county ||
                   result.suburb ||
                   "";
      
      const countryName = result.country || "";
      const countryCode = result.country_code?.toUpperCase() || "";
      
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
}, [lat, lng]);### 6.2 Implementation Breakdown
**Guard Clause:**
- Returns early if `lat` or `lng` is missing
- Prevents unnecessary API calls

**Coordinate Validation:**
- Validates that coordinates are valid numbers
- Checks latitude is between -90 and 90
- Checks longitude is between -180 and 180
- Sets error message if validation fails

**API Request:**
- Constructs URL with `apiKey`, `lat`, `lon`, and `format=json` parameters
- Uses `URLSearchParams` for proper URL encoding
- No special headers required
- Uses `fetch()` for HTTP request
- Checks response status with `res.ok`
- Attempts to extract error details from response if request fails

**Data Processing:**
- Parses JSON response
- Checks if `results` array exists and has at least one element
- Extracts first result from `results[0]`
- Extracts city name from result object (checks multiple fields: `city`, `town`, `village`, `municipality`, `county`, `suburb`)
- Extracts country name and country code from result
- Converts country code to uppercase and converts to emoji using utility function

**Error Handling:**
- Wraps in try-catch block
- Sets error state with descriptive messages
- Logs errors to console
- Always sets loading to false in `finally` block
- Displays error messages to user in the form

**Dependencies:**
- Effect runs when `lat` or `lng` changes
- Automatically fetches when user clicks map

### 6.3 API Response Structure
```json
{
  "results": [
    {
      "city": "Bangkok",
      "town": "...",           // Alternative if city not available
      "village": "...",        // Alternative if city/town not available
      "municipality": "...",   // Alternative
      "county": "...",         // Alternative
      "suburb": "Wang Thonglang District",  // Alternative
      "country": "Thailand",
      "country_code": "th",    // Lowercase, needs toUpperCase()
      "postcode": "10310",
      "street": "Soi Lat Phrao 91",
      "formatted": "Soi Lat Phrao 91, Wang Thonglang District, 10310, Thailand",
      // ... other fields
    }
  ],
  "query": {
    "lat": 13.786791066345813,
    "lon": 100.62043289671124
  }
}
```---

## STEP 7: Build the Form UI

### 7.1 Complete Form Componentipt
return (
  <form className={styles.form}>
    {isLoadingGeocoding && <p>Loading city data...</p>}
    
    <div className={styles.row}>
      <label htmlFor="cityName">City name</label>
      <input
        id="cityName"
        onChange={(e) => setCityName(e.target.value)}
        value={cityName}
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
      <Button type="primary">Add</Button>
      <BackButton type="back" />
    </div>
  </form>
);### 7.2 UI Features Breakdown
**Loading Indicator:**
- Shows "Loading city data..." while fetching
- Conditional rendering based on `isLoadingGeocoding`

**City Name Input:**
- Pre-filled with fetched city name
- Disabled during loading to prevent editing
- Editable after data loads
- Shows country flag emoji next to input

**Date Input:**
- Uses `datetime-local` type for date and time selection
- Properly formatted value from state
- Dynamic label includes city name

**Notes Textarea:**
- User can add trip notes
- Label dynamically includes city name

---

## STEP 8: Common Errors and Solutions

### 8.1 Error: "return outside of function"
**Problem:** Extra closing brace before return statementvascript
// ❌ Wrong
useEffect(() => {
  // ...
}, [lat, lng]);
}  // Extra brace

return (...)**Solution:** Remove extra closing braceipt
// ✅ Correct
useEffect(() => {
  // ...
}, [lat, lng]);

return (...)### 8.2 Error: Date format doesn't conform
**Problem:** Date object passed directly to input
// ❌ Wrong
const [date, setDate] = useState(new Date());**Solution:** Format date as stringascript
// ✅ Correct
const [date, setDate] = useState(() => formatDateTimeLocal(new Date()));### 8.3 Error: Undefined state variable
**Problem:** Using `setCountry` without declaring statet
// ❌ Wrong
setCountry(data.countryName);  // country state not declared**Solution:** Declare state or use correct variable
// ✅ Correct
const [emoji, setEmoji] = useState("");
if (data.countryCode) {
  setEmoji(convertToEmoji(data.countryCode));
}### 8.4 Error: ESLint unused variables
**Problem:** Variables declared but not usedavascript
// ❌ Wrong
const [country, setCountry] = useState("");  // Never used**Solution:** Use the variable or remove itpt
// ✅ Correct - Use it
{country && <span>{country}</span>}

// OR remove if not needed
---

## STEP 9: Complete Implementation

### 9.1 Full Form Component Codeript
// Using Geoapify API for reverse geocoding
// "https://api.geoapify.com/v1/geocode/reverse?lat=0&lon=0&format=json&apiKey=API_KEY"

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "./Button";
import BackButton from "./BackButton";
import Spinner from "./Spinner";
import styles from "./Form.module.css";
import useUrlPosition from "../hooks/useUrlPosition";
import { useCities } from "../contexts/CitiesContext";
import { convertToEmoji } from "../utils";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// Using Geoapify API
const BASE_URL = "https://api.geoapify.com/v1/geocode/reverse";
const API_KEY = "e55a183b7d8749748a1832193dd86c74";

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
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function Form() {  
  const [lat, lng] = useUrlPosition();
  const navigate = useNavigate();
  
  const [cityName, setCityName] = useState("");
  const [countryName, setCountryName] = useState("");
  const [emoji, setEmoji] = useState("");
  const [date, setDate] = useState(new Date()); // DatePicker expects Date object
  const [notes, setNotes] = useState("");
  const [isLoadingGeocoding, setIsLoadingGeocoding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const { createCity } = useCities();

  useEffect(function(){
    async function fetchCityData() {
      if (!lat || !lng) {
        // Clear form if no coordinates
        setCityName("");
        setCountryName("");
        setEmoji("");
        setError("");
        return;
      }
      
      // Reset form state when coordinates change
      setCityName("");
      setCountryName("");
      setEmoji("");
      setError("");
      
      // Validate coordinates before making API call
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
        // Geoapify API format: apiKey, lat, lon, format=json
        const params = new URLSearchParams({
          apiKey: API_KEY,
          lat: latNum.toString(),
          lon: lngNum.toString(),
          format: 'json'
        });
        const url = `${BASE_URL}?${params.toString()}`;
        console.log("Fetching from:", url);
        
        const res = await fetch(url);
        
        if (!res.ok) {
          // Try to get error details from the response
          let errorMessage = `Failed to fetch city data (${res.status} ${res.statusText})`;
          try {
            const errorData = await res.json();
            errorMessage = errorData.error || errorMessage;
            console.error("API Error Response:", errorData);
          } catch {
            // If response is not JSON, use the status text
            console.error("API Error Status:", res.status, res.statusText);
          }
          throw new Error(errorMessage);
        }
        
        const data = await res.json();
        console.log("Fetched city data:", data);
        
        // Geoapify response structure - data is in results array
        if (!data || !data.results || !Array.isArray(data.results) || data.results.length === 0) {
          const errorMsg = `No location data found for coordinates: lat=${latNum}, lng=${lngNum}. Please try a different location.`;
          console.error(errorMsg);
          setError(errorMsg);
          return;
        }
        
        const result = data.results[0];
        // Extract city name from Geoapify response
        const city = result.city || 
                     result.town || 
                     result.village || 
                     result.municipality ||
                     result.county ||
                     result.suburb ||
                     "";
        
        const countryName = result.country || "";
        const countryCode = result.country_code?.toUpperCase() || "";
        
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
  }, [lat, lng]);


  async function handleSubmit(e) {
    e.preventDefault();
    if (!cityName || !date) return;
    
    // Convert date to ISO string if it's a Date object
    const dateValue = date instanceof Date ? date.toISOString() : date;
    
    const newCity = {
      cityName,
      country: countryName,
      emoji,
      date: dateValue,
      notes,
      position: {
        lat: Number(lat),
        lng: Number(lng),
      },
    };
    
    try {
      setIsSubmitting(true);
      setError("");
      const createdCity = await createCity(newCity);
      
      // Navigate to the city detail page after successful creation
      if (createdCity && createdCity.id) {
        const latParam = createdCity.position?.lat || lat;
        const lngParam = createdCity.position?.lng || lng;
        navigate(`/app/cities/${createdCity.id}?lat=${latParam}&lng=${lngParam}`);
      }
    } catch (error) {
      console.error('Failed to create city:', error);
      setError(`Failed to add city: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      {isLoadingGeocoding && <Spinner />}
      {error && <p style={{ color: 'red', padding: '1rem', background: '#ffebee', borderRadius: '5px' }}>{error}</p>}
      
      <div className={styles.row}>
        <label htmlFor="cityName">City name</label>
        <input
          id="cityName"
          onChange={(e) => {
            const value = e.target.value;
            setCityName(value);
          }}
          value={isLoadingGeocoding ? "Loading..." : (cityName && countryName ? `${cityName}, ${countryName}` : cityName)}
          disabled={isLoadingGeocoding}
        />
        {emoji && <span className={styles.flag}>{emoji}</span>}
      </div>

      <div className={styles.row}>
        <label htmlFor="date">When did you go to {cityName || "this city"}?</label>
        <DatePicker
          id="date"
          onChange={(selectedDate) => setDate(selectedDate || new Date())}
          selected={date}
          dateFormat="dd/MM/yyyy"
          disabled={isLoadingGeocoding}
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
        <Button type="primary" onClick={handleSubmit} disabled={isSubmitting || isLoadingGeocoding}>
          {isSubmitting ? "Adding..." : "Add"}
        </Button>
        <BackButton type="back" />
      </div>
    </form>
  );
}

export default Form;---

## STEP 10: How It All Works Together

### 10.1 User Flow
1. **User clicks on map** → Map component navigates to `/app/form?lat=X&lng=Y`
2. **Form component mounts** → `useUrlPosition()` reads coordinates from URL
3. **useEffect triggers** → Detects `lat` and `lng` are available
4. **API request sent** → Fetches city data from reverse geocoding API
5. **Data received** → City name and country code extracted
6. **Form populated** → City name auto-filled, emoji displayed
7. **User completes form** → Adds date, notes, and submits

### 10.2 Data Flow
```
Map Click
  ↓
URL: /app/form?lat=40.7128&lng=-74.0060
  ↓
useUrlPosition() extracts [lat, lng]
  ↓
useEffect detects coordinates
  ↓
Coordinate validation (lat: -90 to 90, lng: -180 to 180)
  ↓
API Call: reverse?apiKey=API_KEY&lat=40.7128&lon=-74.0060&format=json
  ↓
Response: { results: [{ city: "New York", country: "United States", country_code: "us", ... }], ... }
  ↓
Extract first result: results[0]
  ↓
setCityName("New York")
setCountryName("United States")
setEmoji(convertToEmoji("US")) → "🇺🇸"  // Note: country_code converted to uppercase
  ↓
Form displays: "New York, United States 🇺🇸"
```

### 10.3 Key Integration Points
- **Map Component**: Navigates with coordinates in URL
- **useUrlPosition Hook**: Extracts coordinates from URL
- **Form Component**: Fetches and displays city data
- **convertToEmoji Utility**: Converts country codes to flags
- **formatDateTimeLocal**: Ensures proper date format

### 10.3.5 Fix: Form Not Updating When Coordinates Change

**Problem:** When lat/lng values change in the URL (e.g., clicking different locations on the map), the form's `useEffect` might not detect the change because React's dependency comparison for numbers can fail with floating-point values or when values transition between `null` and numbers.

**Solution:** Use a coordinate key string instead of individual lat/lng values in the dependency array:

```jsx
// Form.jsx
function Form() {
  const [lat, lng] = useUrlPosition();
  
  // Create a unique key from coordinates to ensure useEffect triggers on any change
  const coordKey = lat !== null && lng !== null ? `${lat},${lng}` : null;

  useEffect(function(){
    async function fetchCityData() {
      if (!lat || !lng) {
        // Clear form if no coordinates
        setCityName("");
        setCountryName("");
        setEmoji("");
        setError("");
        return;
      }
      
      // Reset form state when coordinates change
      setCityName("");
      setCountryName("");
      setEmoji("");
      setError("");
      
      // ... validation and API call ...
    }
    fetchCityData();
  }, [coordKey]); // ✅ Use coordKey instead of [lat, lng]
}
```

**Why This Works:**
- String comparison is more reliable than number comparison for detecting changes
- Any coordinate change produces a new string, ensuring React detects the update
- Handles `null` values correctly (returns `null` when coordinates are missing)
- Guarantees the effect runs whenever coordinates change, even slightly

**Alternative Solution:** Keep `useUrlPosition` returning strings instead of numbers:
```jsx
// useUrlPosition.js
function useUrlPosition() {
  const [searchParams] = useSearchParams();
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");
  return [lat, lng]; // Return strings, convert to numbers when needed
}
```

### 10.4 Preventing Geolocation from Overwriting Map Clicks

**Problem:** When clicking "Get Current Location" and then clicking another location on the map, the geolocation position would overwrite the clicked coordinates, preventing the form from updating.

**Solution:**
1. Use a ref (not state) to track when geolocation is explicitly requested:
   ```jsx
   const geoRequestedRef = useRef(false);
   ```

2. Only seed URL params from geolocation when:
   - User explicitly clicks "Get Current Location" button, OR
   - There are no coordinates in URL yet (initial state)
   - AND only on the form page

3. Keep the "Get Current Location" button always visible so users can re-trigger geolocation anytime.

4. When user explicitly requests geolocation, also navigate to form page immediately:
   ```jsx
   useEffect(() => {
     const onFormPage = pathname === "/app/form";
     if (onFormPage && geolocationPosition && (geoRequestedRef.current || (!maplat && !maplng))) {
       setSearchParams({
         lat: geolocationPosition.lat,
         lng: geolocationPosition.lng,
       });
       // If user explicitly requested, navigate to form so data loads immediately
       if (geoRequestedRef.current) {
         navigate(`form?lat=${geolocationPosition.lat}&lng=${geolocationPosition.lng}`);
       }
       geoRequestedRef.current = false; // reset flag after use
     }
   }, [geolocationPosition, maplat, maplng, pathname, setSearchParams, navigate]);
   ```

5. Button onClick handler:
   ```jsx
   <Button
     type="position"
     onClick={() => {
       geoRequestedRef.current = true;
       getPosition();
     }}
     disabled={isLoadingPosition}
   >
     {isLoadingPosition ? "Loading..." : "Get Current Location"}
   </Button>
   ```

**Key Points:**
- Using `useRef` instead of `useState` prevents React lint warnings about setState in effects
- The ref flag ensures geolocation only overwrites URL params when explicitly requested
- Map clicks now properly update the form without being overwritten

### 10.5 Resetting Map Center When Clicking Back Button

**Problem:** When clicking the Back button from the form, the URL params (`?lat=...&lng=...`) would persist, keeping the map centered on the previous location instead of resetting to the default center `[40, 0]`.

**Solution:**

1. **BackButton Component** - Clear URL params before navigating:
   ```jsx
   import { useNavigate, useSearchParams } from 'react-router-dom';

   export default function BackButton({ type = "back" }) {
     const navigate = useNavigate();
     const [, setSearchParams] = useSearchParams();
     
     const handleClick = (e) => {
       e.preventDefault();
       e.stopPropagation();
       // Clear all URL params first to reset map to default center [40, 0]
       setSearchParams({}, { replace: true });
       // Then navigate to cities page
       navigate('/app/cities', { replace: true });
     };
     // ...
   }
   ```

2. **Map Component** - Update mapPosition logic to prioritize default center on cities page:
   ```jsx
   const mapPosition = useMemo(() => {
     // Priority: URL params > default (on cities page) > geolocation (only on form page)
     if (maplat && maplng) {
       return [Number(maplat), Number(maplng)];
     }
     // On cities page without URL params, use default center
     // On form page, use geolocation if available, otherwise default
     if (pathname === "/app/cities") {
       return [40, 0]; // Default center for cities page
     }
     if (geolocationPosition) {
       return [geolocationPosition.lat, geolocationPosition.lng];
     }
     return [40, 0];
   }, [maplat, maplng, geolocationPosition, pathname]);
   ```

**Why This Works:**
- When Back button is clicked, URL params are cleared first
- Navigation goes to `/app/cities` without any query parameters
- Map component detects it's on cities page with no URL params
- Falls back to default center `[40, 0]` instead of using geolocation position
- Map resets to default view

**Key Points:**
- Always clear search params before navigating back to prevent stale coordinates
- Check `pathname` in mapPosition logic to handle different pages appropriately
- On cities page, prioritize default center over geolocation to ensure clean reset

---

## Summary

This guide covered:
- ✅ Creating `useUrlPosition` hook to read URL parameters
- ✅ Fetching city data using Geoapify reverse geocoding API
- ✅ Validating coordinates before making API calls
- ✅ Converting country codes to flag emojis
- ✅ Handling loading and error states with proper error messages
- ✅ Auto-populating form fields with API data (city name, country name, emoji)
- ✅ Preventing geolocation from overwriting map clicks
- ✅ Resetting map center when navigating back
- ✅ Using coordinate keys to ensure form updates when coordinates change
- ✅ Common errors and their solutions

**API Used:** Geoapify Reverse Geocoding API
- **Endpoint**: `https://api.geoapify.com/v1/geocode/reverse`
- **Response Format**: Results array with location data
- **Key Features**: Requires API key, returns structured location data including city, country, and country code

The form now automatically fetches and displays city information when users click on the map, providing a seamless user experience. The map properly handles geolocation requests, map clicks, and navigation, ensuring data always updates correctly and the map resets to default center when needed.
