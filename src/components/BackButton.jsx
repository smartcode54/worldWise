import { useNavigate } from 'react-router-dom';
import styles from "./Button.module.css";

export default function BackButton({ type = "back" }) {
  const navigate = useNavigate();
  
  const handleClick = (e) => {
    e.preventDefault(); // Prevent form submission if inside a form
    e.stopPropagation(); // Prevent event bubbling
    navigate(-1);
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
