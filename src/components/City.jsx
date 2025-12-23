import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useEffect } from "react";
import styles from "./City.module.css";
import BackButton from "./BackButton";
import { useCities } from "../contexts/CitiesContext";

const formatDate = (date) => {
  if (!date) return "No date available";
  try {
    return new Intl.DateTimeFormat("en", {
      day: "numeric",
      month: "long",
      year: "numeric",
      weekday: "long",
    }).format(new Date(date));
  } catch {
    return "Invalid date";
  }
};

function City() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { getCity, setSelectedCityId } = useCities();

  // ✅ setSelectedCityId is memoized with useCallback in CitiesContext,
  // so it maintains referential equality and is safe to include in dependencies
  // Without memoization, this would cause an infinite loop
  useEffect(() => {
    if (id) {
      setSelectedCityId(parseInt(id));
    }
    // Cleanup: reset selected city when component unmounts (e.g., when going back)
    return () => {
      // Optional: clear selection when leaving city detail page
    };
  }, [id, setSelectedCityId]);

  // Get latitude and longitude from URL params
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");

  // Get the city by ID from context
  const currentCity = getCity(id);

  // Handle case when city is not found
  if (!currentCity) {
    return (
      <div className={styles.city}>
        <p>City not found</p>
        <button onClick={() => navigate("/app/cities")}>Back to Cities</button>
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
        <p>{formatDate(date)}</p>
      </div>

      {notes && (
        <div className={styles.row}>
          <h6>Your notes</h6>
          <p>{notes}</p>
        </div>
      )}

      {(lat || lng) && (
        <div className={styles.row}>
          <h6>Position</h6>
          <p>
            Latitude: {lat || "Select on list"}, <br />
            Longitude: {lng || "Select on list"}
          </p>
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
        <BackButton type="back" />
      </div>
    </div>
  );
}

export default City;
