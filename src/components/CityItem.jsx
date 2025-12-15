import styles from './CityItem.module.css';
import { Link, useParams } from 'react-router-dom';
import { useCities } from '../contexts/CitiesContext';

const formatDate = (date) => {
  if (!date) return 'No date';
  try {
    return new Intl.DateTimeFormat("en", {
      day: "numeric",
      month: "long",
      year: "numeric",
      weekday: "long",
    }).format(new Date(date));
  } catch {
    return 'Invalid date';
  }
};

function CityItem({ city }) {
  const { cityName, emoji, date, id, position } = city;
  const params = useParams();
  const currentCityId = params?.id;
  const { selectedCityId, handleCityClick, deleteCity } = useCities();
  
  const isSelected = currentCityId === id.toString() || selectedCityId === id;
  
  const handleClick = () => {
    handleCityClick(id);
  };

  const handleDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete ${cityName}?`)) {
      deleteCity(id);
    }
  };
   
  return (
    <li>
      <Link 
        className={`${styles.cityItem} ${isSelected ? styles.cityItemActive : ''}`}
        to={`/app/cities/${id}${position?.lat && position?.lng ? `?lat=${position.lat}&lng=${position.lng}` : ''}`}
        onClick={handleClick}
      >
        <span className={styles.emoji}>{emoji}</span>
        <h3 className={styles.name}>{cityName}</h3>
        <time className={styles.date}>{formatDate(date)}</time>
        <button 
          className={styles.deleteBtn} 
          onClick={handleDelete}
          aria-label="Delete city"
        >
          &times;
        </button>
      </Link>
    </li>
  );
}
export default CityItem;