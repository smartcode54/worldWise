import { useParams, useNavigate } from 'react-router-dom';
import styles from "./City.module.css";

const formatDate = (date) =>
  new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "long",
    year: "numeric",
    weekday: "long",
  }).format(new Date(date));

function City({ cities = [] }) {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Find the city by ID
  const currentCity = cities.find(city => city.id === parseInt(id));

  // Handle case when city is not found
  if (!currentCity) {
    return (
      <div className={styles.city}>
        <p>City not found</p>
        <button onClick={() => navigate('/app/cities')}>Back to Cities</button>
      </div>
    );
  }

  const { cityName, emoji, date, notes } = currentCity;

  return (
    <div className={styles.city}>
      <div className={styles.row}>
        <h6>City name</h6>
        <h3>
          <span>{emoji}</span> {cityName}
        </h3>
      </div>

      <div className={styles.row}>
        <h6>You went to {cityName} on</h6>
        <p>{formatDate(date || null)}</p>
      </div>

      {notes && (
        <div className={styles.row}>
          <h6>Your notes</h6>
          <p>{notes}</p>
        </div>
      )}

      <div className={styles.row}>
        <h6>Learn more</h6>
        <a
          href={`https://en.wikipedia.org/wiki/${cityName}`}
          target="_blank"
          rel="noreferrer"
        >
          Check out {cityName} on Wikipedia &rarr;
        </a>
      </div>

      <div>
        <button onClick={() => navigate('/app/cities')}>
          &larr; Back
        </button>
      </div>
    </div>
  );
}

export default City;
