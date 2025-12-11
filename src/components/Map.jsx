
import styles from './Map.module.css';
import {useSearchParams} from 'react-router-dom';

function Map() {
  const [searchParams] = useSearchParams();
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");
  
  return (
    <div className={styles.mapContainer}>
     <h1>Map</h1>
     <h3>Position</h3>
     <p>Latitude: {lat || 'Select on list'}</p>
     <p>Longitude: {lng || 'Select on list'}</p>
    </div>
  )
}
export default Map;