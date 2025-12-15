import { useMemo, useEffect, useRef } from 'react';
import styles from './Map.module.css';
import { useNavigate, useSearchParams, useLocation, useParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { useCities } from '../contexts/CitiesContext';
import useGeolocation from '../hooks/useGeolocaion';
import Button from './Button';

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
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> smartCode54'
          url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
        />
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
        <ChangeCenter position={mapPosition} pathname={pathname} />
        <FitBounds cities={cities} pathname={pathname} />
        <DetectClick />
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

function DetectClick() {
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
      
      console.log(`Navigating with coordinates: lat=${roundedLat}, lng=${roundedLng}`);
      navigate(`form?lat=${roundedLat}&lng=${roundedLng}`);
    }
  });
}

export default Map;