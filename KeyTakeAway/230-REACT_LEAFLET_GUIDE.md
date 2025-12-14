# Step-by-Step Guide: React-Leaflet Integration

## Overview
This guide explains how to integrate and use Leaflet maps in React applications using the `react-leaflet` library. Leaflet is a popular open-source JavaScript library for mobile-friendly interactive maps.

---

## STEP 1: Installation

### 1.1 Install Required Packages
```bash
npm install leaflet react-leaflet
```

**What each package does:**
- `leaflet`: Core Leaflet library for map functionality
- `react-leaflet`: React bindings for Leaflet, provides React components

### 1.2 Verify Installation
Check your `package.json` to ensure both packages are listed:
```json
{
  "dependencies": {
    "leaflet": "^1.9.4",
    "react-leaflet": "^5.0.0"
  }
}
```

---

## STEP 2: Import Leaflet CSS

### 2.1 Add CSS to Your Main Stylesheet
In your main CSS file (e.g., `index.css`), import Leaflet's stylesheet:

```css
@import "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
```

**Why this is necessary:**
- Leaflet requires its CSS for proper map rendering
- Without it, maps won't display correctly (tiles, markers, controls won't show)
- Must be imported before your component styles

**Alternative method:**
```javascript
// In your main.jsx or App.jsx
import 'leaflet/dist/leaflet.css';
```

---

## STEP 3: Basic Map Component Setup

### 3.1 Import Required Components
```javascript
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
```

**Component breakdown:**
- `MapContainer`: Root component that wraps the entire map
- `TileLayer`: Displays the map background (tiles from map providers)
- `Marker`: Places a marker pin on the map
- `Popup`: Shows information when marker is clicked

### 3.2 Create Basic Map Component
```javascript
function Map() {
  return (
    <MapContainer 
      center={[51.505, -0.09]}  // [latitude, longitude]
      zoom={13}                  // Zoom level (1-18)
      scrollWheelZoom={false}    // Disable zoom on scroll
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
    </MapContainer>
  );
}
```

**Key props explained:**
- `center`: Initial map center as `[lat, lng]` array
- `zoom`: Initial zoom level (1 = world view, 18 = street level)
- `scrollWheelZoom`: Enable/disable zoom with mouse wheel

---

## STEP 4: Add Tile Layer

### 4.1 Understanding Tile Layers
Tile layers provide the map background. Different providers offer different styles and features.

### 4.2 Standard OpenStreetMap Tiles
```javascript
<TileLayer
  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
/>
```

**URL template explained:**
- `{s}`: Subdomain (a, b, c) for load balancing
- `{z}`: Zoom level
- `{x}`: Tile X coordinate
- `{y}`: Tile Y coordinate

### 4.3 Alternative Tile Providers

**HOT (Humanitarian OpenStreetMap Team) Tiles:**
```javascript
<TileLayer
  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
/>
```

**CartoDB Light Theme:**
```javascript
<TileLayer
  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
  url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png"
/>
```

**CartoDB Dark Theme:**
```javascript
<TileLayer
  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
  url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png"
/>
```

---

## STEP 5: Add Markers

### 5.1 Basic Marker
```javascript
<Marker position={[51.505, -0.09]}>
  <Popup>
    A pretty CSS3 popup. <br /> Easily customizable.
  </Popup>
</Marker>
```

### 5.2 Marker with Custom Popup Content
```javascript
<Marker position={[51.505, -0.09]}>
  <Popup>
    <div>
      <h3>London</h3>
      <p>Capital of England</p>
    </div>
  </Popup>
</Marker>
```

**Important:**
- `position` must be `[latitude, longitude]` as numbers
- Popup content can include HTML/JSX
- Multiple markers can be added to the same map

---

## STEP 6: Dynamic Map Positions

### 6.1 Using URL Parameters
When you need to update map position based on URL params or state:

```javascript
import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

function Map() {
  const [searchParams] = useSearchParams();
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");

  const mapPosition = useMemo(() => {
    if (lat && lng) {
      return [Number(lat), Number(lng)];
    }
    return [40, 0]; // Default position
  }, [lat, lng]);

  return (
    <MapContainer center={mapPosition} zoom={13}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Marker position={mapPosition}>
        <Popup>Current location</Popup>
      </Marker>
    </MapContainer>
  );
}
```

**Why use `useMemo`:**
- Prevents unnecessary recalculations
- Converts string coordinates to numbers
- Provides fallback default position

### 6.2 Using State
```javascript
import { useState, useEffect } from 'react';

function Map() {
  const [position, setPosition] = useState([51.505, -0.09]);

  useEffect(() => {
    // Update position when needed
    // setPosition([newLat, newLng]);
  }, []);

  return (
    <MapContainer center={position} zoom={13}>
      {/* ... */}
    </MapContainer>
  );
}
```

---

## STEP 7: Styling the Map

### 7.1 CSS Module Example
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
  width: 100%;
}
```

**Critical styling requirements:**
- Map container **MUST** have a defined height
- Without height, the map won't render
- Use `height: 100%` if parent has height, or specific value like `height: 400px`

### 7.2 Global Leaflet Styles
To style Leaflet's built-in components (popups, controls), use `:global()` in CSS Modules:

```css
:global(.leaflet-popup .leaflet-popup-content-wrapper) {
  background-color: var(--color-dark--1);
  color: var(--color-light--2);
  border-radius: 5px;
  padding-right: 0.6rem;
}

:global(.leaflet-popup .leaflet-popup-content) {
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}
```

**Why `:global()`:**
- Leaflet generates its own class names
- CSS Modules would add random IDs to class names
- `:global()` prevents CSS Modules from modifying these classes

---

## STEP 8: Common MapContainer Props

### 8.1 Essential Props
```javascript
<MapContainer
  center={[lat, lng]}           // Required: Initial center
  zoom={13}                     // Required: Initial zoom
  scrollWheelZoom={true}        // Enable/disable scroll zoom
  doubleClickZoom={true}        // Enable/disable double-click zoom
  dragging={true}               // Enable/disable map dragging
  touchZoom={true}              // Enable/disable touch zoom
  zoomControl={true}            // Show/hide zoom controls
  className="my-map"            // CSS class name
  style={{ height: '100vh' }}   // Inline styles
>
```

### 8.2 Event Handlers
```javascript
<MapContainer
  center={[51.505, -0.09]}
  zoom={13}
  whenCreated={(map) => {
    // Called when map is created
    console.log('Map created:', map);
  }}
  whenReady={() => {
    // Called when map is ready
    console.log('Map ready');
  }}
>
```

---

## STEP 9: Advanced Features

### 9.1 Multiple Markers
```javascript
const locations = [
  { id: 1, position: [51.505, -0.09], name: 'London' },
  { id: 2, position: [40.7128, -74.0060], name: 'New York' },
  { id: 3, position: [35.6762, 139.6503], name: 'Tokyo' },
];

<MapContainer center={[51.505, -0.09]} zoom={2}>
  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
  {locations.map(location => (
    <Marker key={location.id} position={location.position}>
      <Popup>{location.name}</Popup>
    </Marker>
  ))}
</MapContainer>
```

### 9.2 Updating Map Center Programmatically
```javascript
import { useMap } from 'react-leaflet';

function ChangeMapView({ center, zoom }) {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, zoom);
  }, [map, center, zoom]);
  
  return null;
}

// Usage:
<MapContainer center={[51.505, -0.09]} zoom={13}>
  <ChangeMapView center={mapPosition} zoom={13} />
  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
</MapContainer>
```

### 9.3 Custom Marker Icons
```javascript
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;
```

---

## STEP 10: Common Issues & Solutions

### 10.1 Map Not Rendering
**Problem:** Map appears blank or doesn't show

**Solutions:**
1. ✅ Ensure Leaflet CSS is imported
2. ✅ Check that map container has defined height
3. ✅ Verify coordinates are numbers, not strings
4. ✅ Check browser console for errors

### 10.2 Marker Icons Not Showing
**Problem:** Markers appear as broken images

**Solution:**
```javascript
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: icon,
  shadowUrl: iconShadow,
});
```

### 10.3 Coordinates as Strings
**Problem:** Map doesn't center correctly

**Solution:**
Always convert to numbers:
```javascript
const lat = Number(searchParams.get("lat"));
const lng = Number(searchParams.get("lng"));
// Or use parseFloat()
```

### 10.4 Map Position Not Updating
**Problem:** Map doesn't move when position changes

**Solutions:**
- Use `key` prop to force remount: `<MapContainer key={position.join(',')} ...>`
- Use `ChangeMapView` component (see Step 9.2)
- Use `useMap` hook to programmatically update

### 10.5 CSS Module Conflicts
**Problem:** Leaflet styles not applying

**Solution:**
Use `:global()` for Leaflet classes:
```css
:global(.leaflet-container) {
  height: 100%;
}
```

---

## STEP 11: Complete Example

### 11.1 Full Map Component
```javascript
import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import styles from './Map.module.css';

function Map() {
  const [searchParams] = useSearchParams();
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");

  const mapPosition = useMemo(() => {
    if (lat && lng) {
      return [Number(lat), Number(lng)];
    }
    return [40, 0]; // Default position
  }, [lat, lng]);

  return (
    <div className={styles.mapContainer}>
      <MapContainer 
        className={styles.map} 
        center={mapPosition} 
        zoom={13} 
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={mapPosition}>
          <Popup>
            Latitude: {lat || 'N/A'}<br />
            Longitude: {lng || 'N/A'}
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}

export default Map;
```

---

## Summary Checklist

✅ Install `leaflet` and `react-leaflet` packages  
✅ Import Leaflet CSS in your main stylesheet  
✅ Create `MapContainer` with `center` and `zoom` props  
✅ Add `TileLayer` for map background  
✅ Ensure map container has defined height in CSS  
✅ Convert coordinate strings to numbers  
✅ Use `useMemo` for computed positions  
✅ Handle missing coordinates with default values  
✅ Style Leaflet components with `:global()` in CSS Modules  

---

## Additional Resources

- [React-Leaflet Documentation](https://react-leaflet.js.org/)
- [Leaflet Documentation](https://leafletjs.com/)
- [OpenStreetMap Tile Usage Policy](https://operations.osmfoundation.org/policies/tiles/)
- [Leaflet Providers](https://leaflet-extras.github.io/leaflet-providers/preview/)

---

## Key Takeaways

1. **Always import Leaflet CSS** - Maps won't render without it
2. **Container height is critical** - Map needs explicit height
3. **Coordinates must be numbers** - Convert strings with `Number()` or `parseFloat()`
4. **Use `useMemo` for positions** - Prevents unnecessary recalculations
5. **Tile providers matter** - Different providers offer different styles and features
6. **CSS Modules need `:global()`** - For styling Leaflet's built-in components
