import styles from "./Login.module.css";
import { useState, useEffect } from "react";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import PageNav from "../components/PageNav";
import { useAuth } from "../contexts/FakeAuthContext";

export default function Login() {
  // PRE-FILL FOR DEV PURPOSES
  const [email, setEmail] = useState("jack@example.com");
  const [password, setPassword] = useState("qwerty");
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get the location they were trying to access before being redirected to login
  const from = location.state?.from?.pathname || "/app";

  useEffect(() => {
    if (isAuthenticated === true) {
      // Redirect to the page they were trying to access, or /app as default
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  // If already authenticated, redirect immediately
  if (isAuthenticated === true) {
    return <Navigate to={from} replace />;
  }

  function handleSubmit(e) {
    e.preventDefault();
    try {
      login(email, password);
    } catch (error) {
      // Handle error (could show error message to user)
      console.error(error.message);
    }
  }

  return (
    <main className={styles.login}>
      <PageNav />
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.row}>
          <label htmlFor="email">Email address</label>
          <input
            type="email"
            id="email"
            onChange={(e) => setEmail(e.target.value)}
            value={email}
          />
        </div>

        <div className={styles.row}>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            onChange={(e) => setPassword(e.target.value)}
            value={password}
          />
        </div>

        <div className={styles.buttons}>
          <button className={styles.cta}>Login</button>
        </div>
      </form>
    </main>
  );
}
