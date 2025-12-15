import { useMemo, useEffect, useRef } from 'react';
import styles from './Map.module.css';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import { useCities } from '../contexts/CitiesContext';
import useGeolocation from '../hooks/useGeolocaion';
import Button from './Button';

function Map() {
  const { isLoading: isLoadingPosition,
          position: geolocationPosition, 
          getPosition } = useGeolocation();
  const geoRequestedRef = useRef(false); // track manual geo requests without causing re-renders

  const {cities} = useCities();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const maplat = searchParams.get("lat");
  const maplng = searchParams.get("lng");
  
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
        navigate(`form?lat=${geolocationPosition.lat}&lng=${geolocationPosition.lng}`);
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
  map.setView(position, 10);
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
          alert(`Error: Invalid longitude ${latlng.lng}. Please try clicking again.`);
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