# Step-by-Step Guide: Displaying City Markers on Map

## Overview
This guide explains how to display multiple city markers on a Leaflet map using React-Leaflet, including how to fetch cities from context, render markers dynamically, and style popups with emoji flags.

---

## STEP 1: Prerequisites

### 1.1 Required Setup
Before displaying city markers, ensure you have:
- ✅ React-Leaflet installed (`leaflet` and `react-leaflet` packages)
- ✅ Leaflet CSS imported in your main stylesheet
- ✅ Cities data available (from Context API, API, or local data)
- ✅ City objects with `position` property containing `lat` and `lng`

### 1.2 City Data Structure
Your city objects should have this structure:
```javascript
{
  id: 73930385,
  cityName: "Lisbon",
  country: "Portugal",
  emoji: "🇵🇹",
  position: {
    lat: 38.727881642324164,
    lng: -9.140900099907554
  }
}
```

---

## STEP 2: Import Required Components and Hooks

### 2.1 Import React-Leaflet Components
```javascript
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
```

**Component breakdown:**
- `MapContainer`: Root component that wraps the entire map
- `TileLayer`: Displays the map background
- `Marker`: Places a marker pin at a specific location
- `Popup`: Shows information when marker is clicked

### 2.2 Import Context Hook (if using Context API)
```javascript
import { useCities } from '../contexts/CitiesContext';
```

### 2.3 Import React Hooks
```javascript
import { useMemo } from 'react';
```

---

## STEP 3: Create Map Component with City Markers

### 3.1 Basic Component Structure
```javascript
import { useMemo } from 'react';
import styles from './Map.module.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useCities } from '../contexts/CitiesContext';

function Map() {
  const { cities } = useCities();
  
  return (
    <div className={styles.mapContainer}>
      <MapContainer 
        className={styles.map} 
        center={[40, 0]} 
        zoom={13} 
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
        />
        {/* Markers will go here */}
      </MapContainer>
    </div>
  );
}

export default Map;
```

---

## STEP 4: Render City Markers Dynamically

### 4.1 Map Over Cities Array
Use the `.map()` method to iterate over cities and create a marker for each:

```javascript
{cities.map((city) => (
  <Marker key={city.id} position={[city.position.lat, city.position.lng]}>
    <Popup>
      <span>{city.emoji}</span> <span>{city.cityName}</span>
    </Popup>
  </Marker>
))}
```

**Key points:**
- `key={city.id}`: Required unique key for React list rendering
- `position={[city.position.lat, city.position.lng]}`: Marker location as `[latitude, longitude]` array
- Each city gets its own `<Marker>` and `<Popup>` component

### 4.2 Complete Component with Markers
```javascript
function Map() {
  const { cities } = useCities();
  
  return (
    <div className={styles.mapContainer}>
      <MapContainer 
        className={styles.map} 
        center={[40, 0]} 
        zoom={13} 
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
        />
        {cities.map((city) => (
          <Marker key={city.id} position={[city.position.lat, city.position.lng]}>
            <Popup>
              <span>{city.emoji}</span> <span>{city.cityName}</span>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
```

---

## STEP 5: Handle Empty or Loading States

### 5.1 Add Safety Check
Prevent errors when `cities` is undefined or empty:

```javascript
{cities && cities.map((city) => (
  <Marker key={city.id} position={[city.position.lat, city.position.lng]}>
    <Popup>
      <span>{city.emoji}</span> <span>{city.cityName}</span>
    </Popup>
  </Marker>
))}
```

### 5.2 Handle Loading State
```javascript
const { cities, isLoading } = useCities();

if (isLoading) {
  return <div>Loading map...</div>;
}

return (
  <div className={styles.mapContainer}>
    <MapContainer className={styles.map} center={[40, 0]} zoom={13}>
      <TileLayer url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png" />
      {cities && cities.length > 0 && cities.map((city) => (
        <Marker key={city.id} position={[city.position.lat, city.position.lng]}>
          <Popup>
            <span>{city.emoji}</span> <span>{city.cityName}</span>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  </div>
);
```

---

## STEP 6: Style the Map Container

### 6.1 CSS Module for Map Container
Create `Map.module.css`:

```css
.mapContainer {
  flex: 1;
  height: 100%;
  background-color: var(--color-dark--2);
  position: relative;
}

.map {
  height: 100%;
}

/* Critical: Leaflet container must have explicit height */
:global(.leaflet-container) {
  height: 100%;
  width: 100%;
}
```

**Why this is necessary:**
- Leaflet requires explicit height to render properly
- Without `height: 100%`, the map won't display
- `:global()` is needed because Leaflet adds its own classes

---

## STEP 7: Style Popup with Emoji Flags

### 7.1 Popup Styling
Add global styles for Leaflet popups:

```css
/* Popup wrapper styling */
:global(.leaflet-popup .leaflet-popup-content-wrapper) {
  background-color: var(--color-dark--1);
  color: var(--color-light--2);
  border-radius: 5px;
  padding-right: 0.6rem;
}

/* Popup content layout */
:global(.leaflet-popup .leaflet-popup-content) {
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

/* Emoji flag styling (first span) */
:global(.leaflet-popup .leaflet-popup-content span:first-child) {
  font-size: 2.6rem;
  line-height: 1;
  font-family: "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", 
               "EmojiOne Color", "Twemoji Mozilla", "Segoe UI Symbol", sans-serif;
  display: inline-block;
}

/* Popup tip styling */
:global(.leaflet-popup .leaflet-popup-tip) {
  background-color: var(--color-dark--1);
}

/* Popup border accent */
:global(.leaflet-popup-content-wrapper) {
  border-left: 5px solid var(--color-brand--2);
}
```

**Key styling points:**
- `font-size: 2.6rem` for emoji to match CityItem styling
- `font-family` with emoji fonts ensures flags render correctly
- `display: flex` with `gap` for proper spacing
- `:global()` is required because Leaflet classes are added dynamically

---

## STEP 8: Dynamic Map Center Based on URL Parameters

### 8.1 Get Coordinates from URL
```javascript
import { useSearchParams } from 'react-router-dom';

function Map() {
  const { cities } = useCities();
  const [searchParams] = useSearchParams();
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");
  
  // ... rest of component
}
```

### 8.2 Calculate Map Position with useMemo
```javascript
import { useMemo } from 'react';

const mapPosition = useMemo(() => {
  if (lat && lng) {
    return [Number(lat), Number(lng)];
  }
  return [40, 0]; // Default position
}, [lat, lng]);
```

**Why use `useMemo`:**
- Prevents unnecessary recalculations
- Converts string coordinates to numbers
- Provides fallback default position

### 8.3 Use Dynamic Position in MapContainer
```javascript
<MapContainer 
  className={styles.map} 
  center={mapPosition}  // Use dynamic position
  zoom={13} 
  scrollWheelZoom={true}
>
```

---

## STEP 9: Complete Example

### 9.1 Full Map Component
```javascript
import { useMemo } from 'react';
import styles from './Map.module.css';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useCities } from '../contexts/CitiesContext';

function Map() {
  const navigate = useNavigate();
  const { cities } = useCities();
  const [searchParams] = useSearchParams();
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");
  
  const mapPosition = useMemo(() => {
    if (lat && lng) {
      return [Number(lat), Number(lng)];
    }
    return [40, 0];
  }, [lat, lng]);

  return (
    <div className={styles.mapContainer} onClick={() => navigate('/app/form')}>
      <MapContainer 
        className={styles.map} 
        center={mapPosition} 
        zoom={13} 
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> smartCode54'
          url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
        />
        {cities && cities.map((city) => (
          <Marker key={city.id} position={[city.position.lat, city.position.lng]}>
            <Popup>
              <span>{city.emoji}</span> <span>{city.cityName}</span>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

export default Map;
```

### 9.2 Complete CSS File
```css
.mapContainer {
  flex: 1;
  height: 100%;
  background-color: var(--color-dark--2);
  position: relative;
}

.map {
  height: 100%;
}

/* Ensure Leaflet container has proper height */
:global(.leaflet-container) {
  height: 100%;
  width: 100%;
}

/* Popup wrapper styling */
:global(.leaflet-popup .leaflet-popup-content-wrapper) {
  background-color: var(--color-dark--1);
  color: var(--color-light--2);
  border-radius: 5px;
  padding-right: 0.6rem;
}

/* Popup content layout */
:global(.leaflet-popup .leaflet-popup-content) {
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

/* Emoji flag styling */
:global(.leaflet-popup .leaflet-popup-content span:first-child) {
  font-size: 2.6rem;
  line-height: 1;
  font-family: "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", 
               "EmojiOne Color", "Twemoji Mozilla", "Segoe UI Symbol", sans-serif;
  display: inline-block;
}

/* Popup tip styling */
:global(.leaflet-popup .leaflet-popup-tip) {
  background-color: var(--color-dark--1);
}

/* Popup border accent */
:global(.leaflet-popup-content-wrapper) {
  border-left: 5px solid var(--color-brand--2);
}
```

---

## STEP 10: Common Issues & Solutions

### 10.1 Markers Not Showing
**Problem:** Markers don't appear on the map

**Solutions:**
1. ✅ Check that `cities` array has data: `console.log(cities)`
2. ✅ Verify city objects have `position.lat` and `position.lng`
3. ✅ Ensure coordinates are numbers, not strings
4. ✅ Check browser console for errors

### 10.2 Map Not Rendering
**Problem:** Map appears blank

**Solutions:**
1. ✅ Ensure Leaflet CSS is imported in `index.css`
2. ✅ Add `:global(.leaflet-container)` with `height: 100%`
3. ✅ Verify map container has defined height
4. ✅ Check that `MapContainer` has valid `center` and `zoom` props

### 10.3 Emoji Flags Not Displaying
**Problem:** Flags show as boxes or don't render

**Solutions:**
1. ✅ Add emoji font-family to CSS:
   ```css
   font-family: "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", 
                "EmojiOne Color", "Twemoji Mozilla", "Segoe UI Symbol", sans-serif;
   ```
2. ✅ Ensure emoji is in the data: `console.log(city.emoji)`
3. ✅ Set `display: inline-block` for emoji span
4. ✅ Match font-size with other components (2.6rem)

### 10.4 "Cannot read properties of undefined (reading 'map')" Error
**Problem:** Error when trying to map over cities

**Solution:**
Add safety check:
```javascript
{cities && cities.map((city) => (
  // ... marker code
))}
```

Or use optional chaining:
```javascript
{cities?.map((city) => (
  // ... marker code
))}
```

### 10.5 Popup Styling Not Applying
**Problem:** CSS styles don't affect popup

**Solution:**
- Use `:global()` for all Leaflet classes
- Leaflet adds classes dynamically, so CSS Modules won't work without `:global()`
- Ensure styles are in the correct CSS file

### 10.6 Map Position Not Updating
**Problem:** Map doesn't move when URL params change

**Solutions:**
- Use `useMemo` to recalculate position when `lat`/`lng` change
- Ensure `MapContainer` receives updated `center` prop
- Consider using `key` prop to force remount if needed

---

## Summary Checklist

✅ Import `MapContainer`, `TileLayer`, `Marker`, and `Popup` from `react-leaflet`  
✅ Get cities data from Context API or props  
✅ Use `.map()` to iterate over cities array  
✅ Add `key={city.id}` to each Marker  
✅ Set `position={[city.position.lat, city.position.lng]}`  
✅ Add safety check: `{cities && cities.map(...)}`  
✅ Style map container with explicit height  
✅ Add `:global(.leaflet-container)` with `height: 100%`  
✅ Style popups with `:global()` for Leaflet classes  
✅ Add emoji font-family for proper flag rendering  
✅ Use `useMemo` for dynamic map positions  
✅ Handle loading and empty states  

---

## Key Takeaways

1. **Always use `key` prop** - Required for React list rendering
2. **Coordinates must be numbers** - Convert strings with `Number()`
3. **Leaflet needs explicit height** - Add `:global(.leaflet-container)` with `height: 100%`
4. **Use `:global()` for Leaflet styles** - Leaflet classes are added dynamically
5. **Emoji fonts matter** - Add font-family for proper flag emoji rendering
6. **Safety checks prevent errors** - Always check if array exists before mapping
7. **useMemo for positions** - Prevents unnecessary recalculations
8. **Popup styling requires global CSS** - Leaflet popups need `:global()` selectors

---

## Additional Resources

- [React-Leaflet Documentation](https://react-leaflet.js.org/)
- [Leaflet Marker Documentation](https://leafletjs.com/reference.html#marker)
- [Leaflet Popup Documentation](https://leafletjs.com/reference.html#popup)
- [React List Rendering](https://react.dev/learn/rendering-lists)
