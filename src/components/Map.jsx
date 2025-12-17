import { useMemo, useEffect, useRef } from 'react';
import styles from './Map.module.css';
import { useNavigate, useSearchParams, useLocation, useParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { useCities } from '../contexts/CitiesContext';
import useGeolocation from '../hooks/useGeolocaion';
import Button from './Button';

// Geoapify API configuration
// ⚠️ IMPORTANT: All credentials are loaded from .env file
// Get your API key from: https://www.geoapify.com/get-started-with-maps-api
// Add to .env file: VITE_GEOAPIFY_API_KEY=your-key-here
const GEOAPIFY_API_KEY = import.meta.env.VITE_GEOAPIFY_API_KEY;

// Geoapify map style options (can also be set in .env as VITE_GEOAPIFY_MAP_STYLE):
// - 'osm-bright' - Bright OpenStreetMap style
// - 'osm-bright-grey' - Grey OpenStreetMap style
// - 'dark-matter' - Dark theme
// - 'positron' - Light theme
// - 'klokantech-basic' - Basic style
// - 'osm-liberty' - Liberty style
// See more at: https://apidocs.geoapify.com/docs/maps/
const GEOAPIFY_MAP_STYLE = import.meta.env.VITE_GEOAPIFY_MAP_STYLE || 'osm-bright';

// Fix for default marker icons
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: icon,
  iconRetinaUrl: iconRetina,
  shadowUrl: iconShadow,
});

// Create custom icons for selected and unselected markers
const defaultIcon = new L.Icon({
  iconUrl: icon,
  iconRetinaUrl: iconRetina,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Create a custom red marker icon for selected cities
const selectedIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  iconRetinaUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Create a custom pin icon for temporary/clicked locations on form
// Using DivIcon with pin emoji for better visibility
const createFlagIcon = () => {
  return L.divIcon({
    html: '<div style="font-size: 3rem; text-align: center;">📍</div>',
    className: 'custom-flag-icon',
    iconSize: [45, 45],
    iconAnchor: [22.5, 45],
    popupAnchor: [0, -45]
  });
};

function Map() {
  const { isLoading: isLoadingPosition,
          position: geolocationPosition, 
          getPosition } = useGeolocation();
  const geoRequestedRef = useRef(false); // track manual geo requests without causing re-renders

  const {cities, selectedCityId} = useCities();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const params = useParams();
  const maplat = searchParams.get("lat");
  const maplng = searchParams.get("lng");
  
  // Get current city ID from URL params
  const currentCityId = params?.id ? parseInt(params.id) : null;
  const activeCityId = currentCityId || selectedCityId;
  
  // Create flag icon for temporary marker (memoized)
  const flagIcon = useMemo(() => createFlagIcon(), []);
  
  //use memo to memoize the map position is right way to do it because it will not re-render the map position when the map lat and lng change
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

  // Synchronize map position with geolocation data using React effects
  useEffect(() => {
    // Seed URL params from geolocation when user asked OR no coords yet
    const onFormPage = pathname === "/app/form";
    if (onFormPage && geolocationPosition && (geoRequestedRef.current || (!maplat && !maplng))) {
      setSearchParams({
        lat: geolocationPosition.lat,
        lng: geolocationPosition.lng,
      });
      // If user explicitly requested, navigate to form so data loads immediately
      if (geoRequestedRef.current) {
        navigate(`/app/form?lat=${geolocationPosition.lat}&lng=${geolocationPosition.lng}`);
      }
      geoRequestedRef.current = false; // reset flag after use
    }
  }, [geolocationPosition, maplat, maplng, pathname, setSearchParams, navigate]);



  return (
    <div className={styles.mapContainer}>
      {/* Always allow re-triggering geolocation */}
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

      <MapContainer className={styles.map} center={mapPosition} zoom={13} scrollWheelZoom={true}>
        {GEOAPIFY_API_KEY ? (
          <TileLayer
            attribution='Powered by <a href="https://www.geoapify.com/" target="_blank">Geoapify</a> | © OpenStreetMap contributors'
            url={`https://maps.geoapify.com/v1/tile/${GEOAPIFY_MAP_STYLE}/{z}/{x}/{y}.png?apiKey=${GEOAPIFY_API_KEY}`}
            maxZoom={20}
          />
        ) : (
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        )}
        {cities.map((city)=> (
          <Marker 
            key={city.id} 
            position={[city.position.lat, city.position.lng]}
            icon={activeCityId === city.id ? selectedIcon : defaultIcon}
          >
            <Popup>
              <span>{city.emoji}</span> <span>{city.cityName}</span>
            </Popup>
          </Marker>
        ))}
        {/* Show temporary marker when on form page with lat/lng params */}
        {pathname === "/app/form" && maplat && maplng && (
          <Marker 
            position={[Number(maplat), Number(maplng)]}
            icon={flagIcon}
          >
            <Popup>
              <span>New location</span>
            </Popup>
          </Marker>
        )}
        <ChangeCenter position={mapPosition} pathname={pathname} />
        <FitBounds cities={cities} pathname={pathname} />
        <DetectClick pathname={pathname} setSearchParams={setSearchParams} />
        <MapResizeHandler />
      </MapContainer>
    </div>
  );
}
function ChangeCenter({position, pathname}) {
  const map = useMap();
  
  // Determine zoom level based on context
  // Individual city page: zoom in more (13)
  // Cities list page: skip (handled by FitBounds)
  const isCityDetailPage = pathname?.includes('/cities/') && pathname !== '/app/cities';
  const isCitiesListPage = pathname === '/app/cities';
  const zoomLevel = isCityDetailPage ? 13 : 6;
  
  useEffect(() => {
    // Don't change center on cities list page (FitBounds handles it)
    if (isCitiesListPage) return;
    
    if (position && position.length === 2) {
      map.setView(position, zoomLevel);
    }
  }, [position, zoomLevel, map, isCitiesListPage]);
  
  return null;
}

function FitBounds({cities, pathname}) {
  const map = useMap();
  
  useEffect(() => {
    // Only fit bounds on cities list page (not on individual city pages)
    const isCitiesListPage = pathname === '/app/cities';
    
    if (isCitiesListPage && cities.length > 0) {
      // Calculate bounds to fit all cities
      const bounds = L.latLngBounds(
        cities.map(city => [city.position.lat, city.position.lng])
      );
      
      // Fit map to show all cities with some padding
      map.fitBounds(bounds, {
        padding: [50, 50], // Add padding around markers
        maxZoom: 6 // Don't zoom in too much
      });
    }
  }, [cities, pathname, map]);
  
  return null;
}

function DetectClick({ pathname, setSearchParams }) {
  const navigate = useNavigate();

  useMapEvents({
    click: (e) => {
      // ✅ Debug: Log the event to understand what's happening
      console.log("Click event:", e);
      console.log("latlng:", e.latlng);
      
      // ✅ Safely extract coordinates
      const latlng = e.latlng;
      
      if (!latlng || typeof latlng.lat !== 'number' || typeof latlng.lng !== 'number') {
        console.error("Invalid latlng in click event:", e);
        alert("Error: Could not get valid coordinates from map click");
        return;
      }
      
      let lat = latlng.lat;
      let lng = latlng.lng;
      
      // ✅ Validate and normalize latitude
      if (lat < -90 || lat > 90) {
        console.error(`Invalid latitude: ${lat}. Expected range: -90 to 90`);
        alert(`Error: Invalid latitude ${lat}. Please try clicking again.`);
        return;
      }
      
      // ✅ Validate and normalize longitude (wrap around if needed)
      if (lng < -180 || lng > 180) {
        console.warn(`Longitude ${lng} is outside normal range. Attempting to normalize...`);
        
        // Normalize longitude to -180 to 180 range
        while (lng > 180) {
          lng -= 360;
        }
        while (lng < -180) {
          lng += 360;
        }
        
        console.log(`Normalized longitude to: ${lng}`);
        
        // Double-check after normalization
        if (lng < -180 || lng > 180) {
          console.error(`Could not normalize longitude: ${lng}`);
          alert(`Error: Invalid longitude ${lng}. Please try clicking again.`);
          return;
        }
      }
      
      // ✅ Round to reasonable precision (6 decimal places)
      const roundedLat = Number(lat.toFixed(6));
      const roundedLng = Number(lng.toFixed(6));
      
      console.log(`Click coordinates: lat=${roundedLat}, lng=${roundedLng}`);
      
      // ✅ If already on form page, update search params instead of navigating
      if (pathname === "/app/form") {
        setSearchParams({
          lat: roundedLat.toString(),
          lng: roundedLng.toString(),
        });
      } else {
        // Navigate to form page with coordinates
        navigate(`form?lat=${roundedLat}&lng=${roundedLng}`);
      }
    }
  });
}

// Component to handle map resize and fix incomplete rendering
function MapResizeHandler() {
  const map = useMap();

  useEffect(() => {
    // Invalidate size on mount to fix incomplete rendering
    // This is especially important when map renders inside protected routes
    map.invalidateSize();

    // Also handle window resize events
    const handleResize = () => {
      map.invalidateSize();
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [map]);

  // Also invalidate size when map becomes visible (handles ProtectedRoute timing)
  useEffect(() => {
    // Small delay to ensure container has proper dimensions
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 100);

    return () => clearTimeout(timer);
  }, [map]);

  return null;
}

export default Map;
