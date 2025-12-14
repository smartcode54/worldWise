
import { useMemo } from 'react';
import styles from './Map.module.css';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import { useCities } from '../contexts/CitiesContext';

function Map() {
  
  const {cities} = useCities();
  const [searchParams] = useSearchParams();
  const maplat = searchParams.get("lat");
  const maplng = searchParams.get("lng");
  
  //use memo to memoize the map position is right way to do it because it will not re-render the map position when the map lat and lng change
  const mapPosition = useMemo(() => {
    if (maplat && maplng) {
      return [Number(maplat), Number(maplng)];
    }
    return [40, 0];
  }, [maplat, maplng]);

  return (
    <div className={styles.mapContainer}>
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