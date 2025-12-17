
import { createContext, useContext, useReducer } from "react";

const AuthContext = createContext();

const initialState = {
     user: null,
     isAuthenticated: false,
}

function reducer(state, action) {
     switch (action.type) {
          case 'login':
               return {...state,user: action.payload, isAuthenticated: true};
          case 'logout': 
               return {...state, user: null, isAuthenticated: false};
          default: 
          throw new Error("Unknown action type");
     }
}
// ⚠️ FAKE AUTHENTICATION - FOR DEVELOPMENT/TESTING ONLY ⚠️
// In production, passwords should NEVER be stored in plain text or in code.
// Real applications should:
// 1. Hash passwords using bcrypt/argon2 before storing in database
// 2. Compare hashed passwords, never plain text
// 3. Use environment variables for sensitive data (never commit to git)
// 4. Implement proper authentication with JWT tokens or sessions

// Fake user credentials (for testing purposes only)
const FAKE_USER_CREDENTIALS = {
     email: "jack@example.com",
     password: "qwerty", // ⚠️ Plain text password - ONLY for fake auth
}

// User data (without password - never store passwords in state)
const FAKE_USER_DATA = {
     name: "Jack",
     email: "jack@example.com",
     avatar: "https://i.pravatar.cc/100?u=zz",
}

function AuthProvider({ children }) {
     const [{user, isAuthenticated}, dispatch] = useReducer(reducer, initialState);

     function login(email, password) {
          // ⚠️ FAKE AUTHENTICATION - Plain text comparison (NOT secure for production)
          // In production, you would:
          // 1. Hash the input password
          // 2. Compare with stored hash from database
          // 3. Use libraries like bcrypt.compare(password, hashedPassword)
          
          if (email === FAKE_USER_CREDENTIALS.email && 
              password === FAKE_USER_CREDENTIALS.password) {
               // Only store user data, NEVER store password in state
               dispatch({type: 'login', payload: FAKE_USER_DATA});
               return;
          }
          throw new Error("Invalid email or password");
     }

     function logout() {
          dispatch({type: 'logout'});
     }

     return (
          <AuthContext.Provider value={{user, isAuthenticated, login, logout}}>
               {children}
          </AuthContext.Provider>
     );
}

function useAuth() {
     const context = useContext(AuthContext);
     if (context === undefined) {
        throw new Error("useAuth must be used within a AuthProvider");
     }
     return context;
}

// eslint-disable-next-line react-refresh/only-export-components
export { AuthProvider, useAuth };