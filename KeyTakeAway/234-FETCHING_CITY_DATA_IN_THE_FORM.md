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
const BASE_URL = "https://api.bigdatacloud.net/data/reverse-geocode-client";**API Details:**
- **Endpoint**: BigDataCloud Reverse Geocoding API
- **Method**: GET
- **Parameters**: `latitude` and `longitude`
- **Returns**: City name, country name, country code, and other location data

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
      const res = await fetch(`${BASE_URL}?latitude=${lat}&longitude=${lng}`);
      if (!res.ok) throw new Error("Failed to fetch city data");
      
      const data = await res.json();
      setCityName(data.city || data.locality || "");
      
      if (data.countryCode) {
        setEmoji(convertToEmoji(data.countryCode));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingGeocoding(false);
    }
  }
  
  fetchCityData();
}, [lat, lng]);### 6.2 Implementation Breakdown
**Guard Clause:**
- Returns early if `lat` or `lng` is missing
- Prevents unnecessary API calls

**API Request:**
- Constructs URL with latitude and longitude parameters
- Uses `fetch()` for HTTP request
- Checks response status with `res.ok`

**Data Processing:**
- Parses JSON response
- Extracts city name (falls back to `locality` if `city` unavailable)
- Converts country code to emoji using utility function

**Error Handling:**
- Wraps in try-catch block
- Logs errors to console
- Always sets loading to false in `finally` block

**Dependencies:**
- Effect runs when `lat` or `lng` changes
- Automatically fetches when user clicks map

### 6.3 API Response Structureript
{
  city: "New York",
  locality: "Manhattan",
  countryName: "United States",
  countryCode: "US",
  // ... other fields
}---

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
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function Form() {  
  const [lat, lng] = useUrlPosition();
  
  const [cityName, setCityName] = useState("");
  const [emoji, setEmoji] = useState("");
  const [date, setDate] = useState(() => formatDateTimeLocal(new Date()));
  const [notes, setNotes] = useState("");
  const [isLoadingGeocoding, setIsLoadingGeocoding] = useState(false);
  

  useEffect(function(){
    async function fetchCityData() {
      if (!lat || !lng) return;
      try {
        setIsLoadingGeocoding(true);
        const res = await fetch(`${BASE_URL}?latitude=${lat}&longitude=${lng}`);
        if (!res.ok) throw new Error("Failed to fetch city data");
        const data = await res.json();
        setCityName(data.city || data.locality || "");
        if (data.countryCode) {
          setEmoji(convertToEmoji(data.countryCode));
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoadingGeocoding(false);
      }
    }
    fetchCityData();
  }, [lat, lng]);


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
API Call: reverse-geocode-client?latitude=40.7128&longitude=-74.0060
  ↓
Response: { city: "New York", countryCode: "US", ... }
  ↓
setCityName("New York")
setEmoji(convertToEmoji("US")) → "🇺🇸"
  ↓
Form displays: "New York 🇺🇸"
```

### 10.3 Key Integration Points
- **Map Component**: Navigates with coordinates in URL
- **useUrlPosition Hook**: Extracts coordinates from URL
- **Form Component**: Fetches and displays city data
- **convertToEmoji Utility**: Converts country codes to flags
- **formatDateTimeLocal**: Ensures proper date format

### 10.4 Preventing Geolocation from Overwriting Map Clicks
- Only seed URL params from geolocation when there are no coords **or** when the user explicitly clicks “Get Current Location”.
- Keep the button always visible so it can be re-used.
- Use a ref (not state) for the “geo requested” flag to avoid setState in `useEffect`:
  - `const geoRequestedRef = useRef(false);`
  - In effect: `if (geolocationPosition && (geoRequestedRef.current || (!maplat && !maplng))) { setSearchParams(...); geoRequestedRef.current = false; }`
  - Button onClick: `geoRequestedRef.current = true; getPosition();`

---

## Summary

This guide covered:
- ✅ Creating `useUrlPosition` hook to read URL parameters
- ✅ Fetching city data using reverse geocoding API
- ✅ Converting country codes to flag emojis
- ✅ Formatting dates for datetime-local inputs
- ✅ Handling loading and error states
- ✅ Auto-populating form fields with API data
- ✅ Common errors and their solutions

The form now automatically fetches and displays city information when users click on the map, providing a seamless user experience.
