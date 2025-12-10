
import styles from './CountryList.module.css';
import Spinner from './Spinner';
import CountryItem from './CountryItem';
import Message from './Message';

function CountryList({ cities = [], isLoading }) {
  if (isLoading) return <Spinner />;
  
  // ดึงประเทศที่ไม่ซ้ำจาก cities
  const countries = cities.reduce((acc, city) => {
    const existingCountry = acc.find(c => c.country === city.country);
    if (!existingCountry) {
      acc.push({
        country: city.country,
        emoji: city.emoji
      });
    }
    return acc;
  }, []);
  
  if (countries.length === 0) {
    return <Message message="No countries found. Add cities to see countries." />;
  }
  
  return (
    <ul className={styles.countryList}>
      {countries.map((country, index) => (
        <CountryItem key={`${country.country}-${index}`} country={country} />
      ))}
    </ul>
  );
}

export default CountryList;