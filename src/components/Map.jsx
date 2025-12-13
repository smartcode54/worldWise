
import { useMemo } from 'react';
import styles from './Map.module.css';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

function Map() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");

  const mapPosition = useMemo(() => {
    if (lat && lng) {
      return [Number(lat), Number(lng)];
    }
    return [13.842849, 100.510114];
  }, [lat, lng]);

  return (
    <div className={styles.mapContainer} onClick={() => navigate('/app/form')}>

      <MapContainer className={styles.map} center={mapPosition} zoom={13} scrollWheelZoom={true}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> smartCode54'
          url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
        />
        <Marker position={mapPosition}>
          <Popup>
            A pretty CSS3 popup. <br /> Easily customizable.
          </Popup>
        </Marker>
      </MapContainer>

      <h1>Map</h1>
      <h3>Position</h3>
      <p>Latitude: {lat || 'Select on list'}</p>
      <p>Longitude: {lng || 'Select on list'}</p>
    </div>
  )
}
export default Map;