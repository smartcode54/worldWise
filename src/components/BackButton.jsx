import { useNavigate, useSearchParams } from 'react-router-dom';
import styles from "./Button.module.css";

export default function BackButton({ type = "back" }) {
  const navigate = useNavigate();
  const [, setSearchParams] = useSearchParams();
  
  const handleClick = (e) => {
    e.preventDefault(); // Prevent form submission if inside a form
    e.stopPropagation(); // Prevent event bubbling
    // Clear all URL params first to reset map to default center [40, 0]
    setSearchParams({}, { replace: true });
    // Then navigate to cities page
    navigate('/app/cities', { replace: true });
  };
  
  return (
    <button 
      type="button" 
      className={`${styles.btn} ${styles[type]}`} 
      onClick={handleClick}
    >
      &larr; Back
    </button>
  );
}
