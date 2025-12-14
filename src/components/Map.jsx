
import { useMemo } from 'react';
import styles from './Map.module.css';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useCities } from '../contexts/CitiesContext';

function Map() {
  const navigate = useNavigate();
  const {cities} = useCities();
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
      </MapContainer>

      <h1>Map</h1>
      <h3>Position</h3>
      <p>Latitude: {lat || 'Select on list'}</p>
      <p>Longitude: {lng || 'Select on list'}</p>
    </div>
  )
}
export default Map;