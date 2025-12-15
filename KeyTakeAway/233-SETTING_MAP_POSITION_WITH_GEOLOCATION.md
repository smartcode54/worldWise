# Step-by-Step Guide: Setting Map Position with Geolocation

## Overview
This guide explains how to implement geolocation functionality to retrieve the user's current position and dynamically update the map. It covers creating a reusable custom hook, synchronizing map position with geolocation data using React effects, and implementing conditional rendering for the geolocation button.

---

## STEP 1: Understanding the Requirements

### 1.1 What We Need to Build
- A reusable custom geolocation hook to retrieve and use the user's position
- Synchronization of the map's position with geolocation data using React effects
- Conditional rendering for the geolocation button based on whether a position has been received
- Dynamic map updates based on user location and interaction

### 1.2 Key Concepts
- **Custom Hooks**: Reusable logic that can be shared across components
- **Browser Geolocation API**: `navigator.geolocation.getCurrentPosition()`
- **React Effects**: `useEffect` for side effects like updating URL params
- **Conditional Rendering**: Showing/hiding UI elements based on state

---

## STEP 2: Create the Custom Geolocation Hook

### 2.1 Create the Hook File
Create a new file: `src/hooks/useGeolocation.js`

### 2.2 Implement the Hook
```javascript
import { useState } from "react";

function useGeolocation(defaultPosition = null) {
  const [isLoading, setIsLoading] = useState(false);
  const [position, setPosition] = useState(defaultPosition);
  const [error, setError] = useState(null);

  function getPosition() {
    if (!navigator.geolocation)
      return setError("Your browser does not support geolocation");

    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        });
        setIsLoading(false);
      },
      (error) => {
        setError(error.message);
        setIsLoading(false);
      }
    );
  }

  return { isLoading, position, error, getPosition };
}

export default useGeolocation;
```

### 2.3 Hook Breakdown
**State Management:**
- `isLoading`: Tracks whether geolocation request is in progress
- `position`: Stores the retrieved coordinates `{ lat, lng }`
- `error`: Stores any error messages

**Function:**
- `getPosition()`: Triggers the browser's geolocation API
  - Checks if geolocation is supported
  - Sets loading state
  - Handles success and error callbacks

**Return Value:**
- Returns an object with `isLoading`, `position`, `error`, and `getPosition`

**Key Points:**
- Hook is reusable across any component
- Handles browser compatibility
- Provides loading and error states
- Position is stored as an object with `lat` and `lng` properties

---

## STEP 3: Integrate the Hook into Map Component

### 3.1 Import the Hook
```javascript
import useGeolocation from '../hooks/useGeolocation';
import Button from './Button';
import { useMemo, useEffect } from 'react';
```

### 3.2 Use the Hook
```javascript
function Map() {
  const { 
    isLoading: isLoadingPosition,
    position: geolocationPosition, 
    getPosition 
  } = useGeolocation();

  // ... rest of component
}
```

**What happens:**
- `isLoadingPosition`: Renamed for clarity (loading state)
- `geolocationPosition`: The user's current position (null initially)
- `getPosition`: Function to trigger geolocation request

---

## STEP 4: Update Map Position Logic

### 4.1 Priority System for Map Position
The map position should follow this priority:
1. **URL parameters** (if present) - highest priority
2. **Geolocation position** (if retrieved)
3. **Default position** [40, 0] - fallback

### 4.2 Update useMemo for mapPosition
```javascript
const [searchParams, setSearchParams] = useSearchParams();
const maplat = searchParams.get("lat");
const maplng = searchParams.get("lng");

const mapPosition = useMemo(() => {
  // Priority: URL params > geolocation > default
  if (maplat && maplng) {
    return [Number(maplat), Number(maplng)];
  }
  if (geolocationPosition) {
    return [geolocationPosition.lat, geolocationPosition.lng];
  }
  return [40, 0];
}, [maplat, maplng, geolocationPosition]);
```

**Key points:**
- URL params take precedence (user may have clicked on map)
- If no URL params, use geolocation position
- Default to [40, 0] if neither is available
- `geolocationPosition` is added to dependency array

---

## STEP 5: Synchronize Geolocation with URL Params

### 5.1 Why Synchronize?
When geolocation position is retrieved, we want to:
- Update the URL to reflect the current position
- Allow users to share/bookmark the location
- Maintain consistency between geolocation and URL state

### 5.2 Implement useEffect for Synchronization
```javascript
// Synchronize map position with geolocation data using React effects
useEffect(() => {
  if (geolocationPosition) {
    setSearchParams({
      lat: geolocationPosition.lat,
      lng: geolocationPosition.lng,
    });
  }
}, [geolocationPosition, setSearchParams]);
```

**How it works:**
1. Effect runs when `geolocationPosition` changes
2. If position exists, updates URL search params
3. This triggers `mapPosition` to recalculate (via useMemo)
4. Map automatically updates to new position

**Important:**
- Only updates URL if `geolocationPosition` is truthy
- `setSearchParams` is included in dependency array (required by React)

---

## STEP 6: Implement Conditional Button Rendering

### 6.1 When to Show the Button
The geolocation button should:
- **Show**: When no position has been retrieved yet
- **Hide**: Once position is successfully retrieved
- **Show loading state**: While request is in progress

### 6.2 Conditional Rendering
```javascript
return (
  <div className={styles.mapContainer}>
    {/* Conditionally render geolocation button based on whether position has been received */}
    {!geolocationPosition && (
      <Button type="position" onClick={getPosition}>
        {isLoadingPosition ? "Loading..." : "Get Current Location"}
      </Button>
    )}

    <MapContainer className={styles.map} center={mapPosition} zoom={13} scrollWheelZoom={true}>
      {/* ... map content ... */}
    </MapContainer>
  </div>
);
```

**Logic:**
- `{!geolocationPosition && ...}`: Only renders if position is null/undefined
- Button disappears once position is received
- Shows "Loading..." text while `isLoadingPosition` is true
- Calls `getPosition` when clicked

---

## STEP 7: Complete Implementation

### 7.1 Full Map Component
```javascript
import { useMemo, useEffect } from 'react';
import styles from './Map.module.css';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import { useCities } from '../contexts/CitiesContext';
import useGeolocation from '../hooks/useGeolocation';
import Button from './Button';

function Map() {
  const { 
    isLoading: isLoadingPosition,
    position: geolocationPosition, 
    getPosition 
  } = useGeolocation();

  const {cities} = useCities();
  const [searchParams, setSearchParams] = useSearchParams();
  const maplat = searchParams.get("lat");
  const maplng = searchParams.get("lng");
  
  //use memo to memoize the map position is right way to do it because it will not re-render the map position when the map lat and lng change
  const mapPosition = useMemo(() => {
    // Priority: URL params > geolocation > default
    if (maplat && maplng) {
      return [Number(maplat), Number(maplng)];
    }
    if (geolocationPosition) {
      return [geolocationPosition.lat, geolocationPosition.lng];
    }
    return [40, 0];
  }, [maplat, maplng, geolocationPosition]);

  // Synchronize map position with geolocation data using React effects
  useEffect(() => {
    if (geolocationPosition) {
      setSearchParams({
        lat: geolocationPosition.lat,
        lng: geolocationPosition.lng,
      });
    }
  }, [geolocationPosition, setSearchParams]);

  return (
    <div className={styles.mapContainer}>
      {/* Conditionally render geolocation button based on whether position has been received */}
      {!geolocationPosition && (
        <Button type="position" onClick={getPosition}>
          {isLoadingPosition ? "Loading..." : "Get Current Location"}
        </Button>
      )}

      <MapContainer className={styles.map} center={mapPosition} zoom={13} scrollWheelZoom={true}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> smartCode54'
          url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
        />
        {cities.map((city)=> (
          <Marker key={city.id} position={[city.position.lat, city.position.lng]}>
          <Popup>
            <span >{city.emoji}</span> <span>{city.cityName}</span>
          </Popup>
        </Marker>))}
        <ChangeCenter position={mapPosition} />
        <DetectClick />
      </MapContainer>
    </div>
  );
}

function ChangeCenter({position}) {
  const map = useMap();
  map.setView(position, 6);
  return null;
}

function DetectClick() {
  const navigate = useNavigate();

  useMapEvents ({
    click: (e) => {
      console.log(e);
      navigate(`form?lat=${e.latlng.lat}&lng=${e.latlng.lng}`);
    }
  });
}

export default Map;
```

---

## STEP 8: How It All Works Together

### 8.1 User Flow
1. **Initial Load**: Map shows default position [40, 0], button is visible
2. **User Clicks Button**: `getPosition()` is called
3. **Loading State**: Button shows "Loading..." text
4. **Position Retrieved**: 
   - `geolocationPosition` is set with coordinates
   - `useEffect` updates URL params
   - `mapPosition` recalculates (via useMemo)
   - `ChangeCenter` component updates map view
   - Button disappears (conditional rendering)
5. **User Clicks Map**: URL params update, geolocation position is ignored (URL has priority)

### 8.2 Data Flow
```
User clicks button
  ↓
getPosition() called
  ↓
navigator.geolocation.getCurrentPosition()
  ↓
geolocationPosition state updated
  ↓
useEffect triggers → updates URL params
  ↓
mapPosition recalculates (useMemo)
  ↓
ChangeCenter component updates map
  ↓
Button disappears (!geolocationPosition = false)
```

---

## STEP 9: Key Takeaways

### 9.1 Custom Hooks
- **Reusability**: Hook can be used in any component
- **Encapsulation**: All geolocation logic in one place
- **State Management**: Hook manages its own state

### 9.2 React Effects
- **Side Effects**: `useEffect` handles URL synchronization
- **Dependencies**: Always include all dependencies in array
- **Timing**: Effect runs after render, when dependencies change

### 9.3 Conditional Rendering
- **User Experience**: Button appears/disappears based on state
- **Loading States**: Show feedback during async operations
- **Clean UI**: Hide elements when not needed

### 9.4 Position Priority
- **URL Params**: Highest priority (user interaction)
- **Geolocation**: Second priority (automatic)
- **Default**: Fallback when nothing else available

---

## STEP 10: Common Issues and Solutions

### 10.1 Geolocation Permission Denied
**Problem:** User denies location permission

**Solution:** Error is caught and stored in `error` state
```javascript
// In hook:
(error) => {
  setError(error.message); // "User denied Geolocation"
  setIsLoading(false);
}
```

**Display error to user:**
```javascript
{error && <p>Error: {error}</p>}
```

### 10.2 Browser Doesn't Support Geolocation
**Problem:** Older browsers don't have `navigator.geolocation`

**Solution:** Check before using
```javascript
if (!navigator.geolocation)
  return setError("Your browser does not support geolocation");
```

### 10.3 Position Not Updating Map
**Problem:** Map doesn't move when geolocation position is retrieved

**Solution:** Ensure `geolocationPosition` is in `useMemo` dependencies
```javascript
const mapPosition = useMemo(() => {
  // ... logic
}, [maplat, maplng, geolocationPosition]); // ✅ Include geolocationPosition
```

### 10.4 Infinite Loop in useEffect
**Problem:** `useEffect` keeps running repeatedly

**Solution:** Ensure `setSearchParams` is stable (React Router provides stable function)
```javascript
useEffect(() => {
  if (geolocationPosition) {
    setSearchParams({
      lat: geolocationPosition.lat,
      lng: geolocationPosition.lng,
    });
  }
}, [geolocationPosition, setSearchParams]); // ✅ Include both dependencies
```

### 10.5 Button Always Visible
**Problem:** Button doesn't disappear after getting position

**Solution:** Check conditional rendering logic
```javascript
{!geolocationPosition && ( // ✅ Only show when position is null/undefined
  <Button>...</Button>
)}
```

### 10.6 Position Format Mismatch
**Problem:** Map expects array `[lat, lng]` but geolocation returns object

**Solution:** Convert in useMemo
```javascript
if (geolocationPosition) {
  return [geolocationPosition.lat, geolocationPosition.lng]; // ✅ Convert to array
}
```

---

## STEP 11: Best Practices

### 11.1 Error Handling
- Always handle geolocation errors
- Provide user feedback for errors
- Gracefully degrade when geolocation unavailable

### 11.2 Loading States
- Show loading indicator during request
- Disable button while loading (optional)
- Provide clear feedback to user

### 11.3 Performance
- Use `useMemo` for position calculation
- Avoid unnecessary re-renders
- Only update URL when position actually changes

### 11.4 User Experience
- Button disappears once position is received
- Map smoothly transitions to user location
- URL reflects current position for sharing

### 11.5 Code Organization
- Keep hook logic separate from component
- Use descriptive variable names
- Add comments for complex logic

---

## Summary

This guide demonstrated:
1. ✅ Creating a reusable custom geolocation hook
2. ✅ Integrating the hook into the Map component
3. ✅ Synchronizing map position with geolocation using React effects
4. ✅ Implementing conditional rendering for the geolocation button
5. ✅ Dynamic map updates based on user location

The implementation provides a seamless user experience where:
- Users can click a button to get their current location
- The map automatically centers on their position
- The URL updates to reflect the current location
- The button disappears once position is retrieved
- The system gracefully handles errors and edge cases
