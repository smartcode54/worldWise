# 239 - Implementing Authentication Step by Step

## Overview

This guide explains how to implement a complete authentication system in React using Context API and React Router. We'll create a fake authentication system suitable for development and testing purposes.

## Table of Contents

1. [Understanding the Architecture](#understanding-the-architecture)
2. [Step 1: Creating the Authentication Context](#step-1-creating-the-authentication-context)
3. [Step 2: Setting Up the AuthProvider](#step-2-setting-up-the-authprovider)
4. [Step 3: Adding AuthProvider to App.jsx](#step-3-adding-authprovider-to-appjsx)
5. [Step 4: Implementing the Login Page](#step-4-implementing-the-login-page)
6. [Step 5: Creating the User Component](#step-5-creating-the-user-component)
7. [Step 6: Adding User Component to AppLayout](#step-6-adding-user-component-to-applayout)
8. [Security Considerations](#security-considerations)
9. [Complete Flow Diagram](#complete-flow-diagram)
10. [Key Concepts Summary](#key-concepts-summary)

---

## Understanding the Architecture

### Components Involved

```
App.jsx (Root)
  └── AuthProvider (Context Provider)
      └── CitiesProvider
          └── BrowserRouter
              └── Routes
                  ├── Login Page (uses useAuth hook)
                  └── AppLayout (protected route)
                      └── User Component (uses useAuth hook)
```

### Authentication Flow

1. **User visits `/login`** → Enters credentials
2. **Form submission** → Calls `login()` from context
3. **Context validates** → Updates state with user data
4. **useEffect detects** → `isAuthenticated === true`
5. **Navigation** → Redirects to `/app`
6. **User component** → Displays logged-in user info
7. **Logout** → Calls `logout()` and navigates to `/`

---

## Step 1: Creating the Authentication Context

### File: `src/contexts/FakeAuthContext.jsx`

#### 1.1 Import Required Hooks

```javascript
import { createContext, useContext, useReducer } from "react";
```

- `createContext`: Creates a new context for authentication
- `useContext`: Hook to consume the context
- `useReducer`: Manages authentication state with reducer pattern

#### 1.2 Create the Context

```javascript
const AuthContext = createContext();
```

This creates an empty context that will hold our authentication state and functions.

#### 1.3 Define Initial State

```javascript
const initialState = {
  user: null,
  isAuthenticated: false,
}
```

**Why this structure?**
- `user`: Stores the logged-in user's data (name, email, avatar)
- `isAuthenticated`: Boolean flag indicating authentication status
- Both start as `null`/`false` because no user is logged in initially

#### 1.4 Create the Reducer

```javascript
function reducer(state, action) {
  switch (action.type) {
    case 'login':
      return {...state, user: action.payload, isAuthenticated: true};
    case 'logout': 
      return {...state, user: null, isAuthenticated: false};
    default: 
      throw new Error("Unknown action type");
  }
}
```

**Reducer Pattern Explanation:**

- **`login` action**: 
  - Takes user data as `payload`
  - Sets `user` to the payload
  - Sets `isAuthenticated` to `true`
  
- **`logout` action**:
  - Resets `user` to `null`
  - Sets `isAuthenticated` to `false`

**Why use a reducer?**
- Centralized state management
- Predictable state updates
- Easy to add more actions later (e.g., `updateUser`, `refreshToken`)

#### 1.5 Define Fake User Data

```javascript
// ⚠️ FAKE AUTHENTICATION - FOR DEVELOPMENT/TESTING ONLY ⚠️
// In production, passwords should NEVER be stored in plain text or in code.

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
```

**Important Security Notes:**

1. **Separate credentials from user data**: 
   - Credentials are only used for validation
   - User data (without password) is stored in state

2. **Never store passwords in state**: 
   - Passwords should only exist during login
   - Once validated, discard the password
   - Only store user information needed for the UI

3. **This is fake auth**: 
   - Real applications use hashed passwords
   - Real applications connect to a backend API
   - Real applications use JWT tokens or sessions

---

## Step 2: Setting Up the AuthProvider

### 2.1 Create the AuthProvider Component

```javascript
function AuthProvider({ children }) {
  const [{user, isAuthenticated}, dispatch] = useReducer(reducer, initialState);
  
  // ... login and logout functions ...
  
  return (
    <AuthContext.Provider value={{user, isAuthenticated, login, logout}}>
      {children}
    </AuthContext.Provider>
  );
}
```

**Breaking it down:**

1. **`useReducer(reducer, initialState)`**:
   - Returns current state and dispatch function
   - State is destructured to get `user` and `isAuthenticated`
   - `dispatch` is used to trigger state changes

2. **`children` prop**:
   - Represents all components wrapped by `AuthProvider`
   - These components will have access to the context

3. **Context Provider value**:
   - `user`: Current user object (or null)
   - `isAuthenticated`: Boolean authentication status
   - `login`: Function to authenticate user
   - `logout`: Function to sign out user

### 2.2 Implement the Login Function

```javascript
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
```

**Step-by-step explanation:**

1. **Function receives credentials**: `email` and `password` from login form
2. **Validation check**: Compares with `FAKE_USER_CREDENTIALS`
3. **On success**:
   - Dispatches `login` action with `FAKE_USER_DATA` as payload
   - Note: We send `FAKE_USER_DATA` (without password), not credentials
   - Returns early to exit function
4. **On failure**: Throws an error that can be caught by the calling component

**Why throw an error?**
- Allows the Login component to handle invalid credentials
- Can display error messages to the user
- Prevents silent failures

### 2.3 Implement the Logout Function

```javascript
function logout() {
  dispatch({type: 'logout'});
}
```

**Simple and clean:**
- Dispatches `logout` action
- Reducer handles resetting state to initial values
- No need to pass any data

### 2.4 Create the useAuth Hook

```javascript
function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within a AuthProvider");
  }
  return context;
}
```

**Why create a custom hook?**

1. **Error handling**: Ensures hook is used within provider
2. **Better developer experience**: Clear error message if misused
3. **Abstraction**: Components don't need to import `useContext` directly
4. **Consistency**: Single way to access auth context

### 2.5 Export Everything

```javascript
// eslint-disable-next-line react-refresh/only-export-components
export { AuthProvider, useAuth };
```

**ESLint comment explanation:**
- Fast Refresh requires files to export only components
- We're exporting both `AuthProvider` (component) and `useAuth` (hook)
- The comment disables this rule for this specific line
- This is acceptable because context providers commonly export hooks

---

## Step 3: Adding AuthProvider to App.jsx

### File: `src/App.jsx`

### 3.1 Import AuthProvider

```javascript
import { AuthProvider } from './contexts/FakeAuthContext';
```

### 3.2 Wrap the Application

```javascript
function App() {
  return (
    <AuthProvider>
      <CitiesProvider>
        <BrowserRouter>
          {/* ... routes ... */}
        </BrowserRouter>
      </CitiesProvider>
    </AuthProvider>
  );
}
```

**Provider Order Matters:**

```
AuthProvider (outermost)
  └── CitiesProvider
      └── BrowserRouter
```

**Why this order?**

1. **AuthProvider outermost**: 
   - Authentication state is needed by many components
   - Some routes might need auth state
   - Makes auth available to entire app

2. **CitiesProvider inside**: 
   - Cities data might depend on user authentication
   - Can access auth context if needed

3. **BrowserRouter inside**: 
   - Router needs access to contexts
   - Routes can use `useAuth()` hook

**Key Point**: Any component inside `AuthProvider` can now use `useAuth()` hook.

---

## Step 4: Implementing the Login Page

### File: `src/pages/Login.jsx`

### 4.1 Import Required Dependencies

```javascript
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/FakeAuthContext";
```

- `useState`: Manages form input state
- `useEffect`: Watches for authentication changes
- `useNavigate`: Programmatic navigation
- `useAuth`: Access authentication context

### 4.2 Set Up Component State

```javascript
export default function Login() {
  const [email, setEmail] = useState("jack@example.com");
  const [password, setPassword] = useState("qwerty");
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
```

**State breakdown:**

- **Form state**: `email` and `password` for controlled inputs
- **Auth context**: `login` function and `isAuthenticated` status
- **Navigation**: `navigate` function for routing

**Pre-filled values**: For development convenience (remove in production)

### 4.3 Implement Auto-Navigation Effect

```javascript
useEffect(() => {
  if (isAuthenticated === true) {
    navigate("/app");
  }
}, [isAuthenticated, navigate]);
```

**How it works:**

1. **Effect runs when dependencies change**: `isAuthenticated` or `navigate`
2. **Checks authentication status**: If `isAuthenticated === true`
3. **Navigates to app**: Redirects user to `/app` route
4. **Dependency array**: Ensures effect runs when auth state changes

**Why use `useEffect`?**

- **Reactive**: Automatically redirects when login succeeds
- **Separation of concerns**: Login logic separate from navigation logic
- **Clean**: No need to manually navigate after login

**Flow:**
```
User submits form → login() called → State updates → 
isAuthenticated becomes true → useEffect triggers → 
Navigate to /app
```

### 4.4 Create Form Submit Handler

```javascript
function handleSubmit(e) {
  e.preventDefault();
  try {
    login(email, password);
  } catch (error) {
    // Handle error (could show error message to user)
    console.error(error.message);
  }
}
```

**Step-by-step:**

1. **`e.preventDefault()`**: Prevents default form submission (page reload)
2. **Try block**: Attempts to call `login()` function
3. **Catch block**: Handles errors if login fails
4. **Error handling**: Currently logs to console (could show UI error)

**Error handling improvement** (optional):

```javascript
const [error, setError] = useState("");

function handleSubmit(e) {
  e.preventDefault();
  try {
    login(email, password);
    setError(""); // Clear any previous errors
  } catch (error) {
    setError(error.message); // Display error to user
  }
}

// In JSX:
{error && <div className={styles.error}>{error}</div>}
```

### 4.5 Create the Form JSX

```javascript
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
```

**Form features:**

- **Controlled inputs**: `value` and `onChange` for each input
- **Form submission**: `onSubmit` handler on form element
- **Accessibility**: Proper `label` and `id` associations
- **Password type**: Hides password characters

**Complete Login Flow:**

```
1. User types email/password
2. User clicks "Login" button
3. Form submits → handleSubmit() called
4. login() function called with credentials
5. Context validates credentials
6. If valid: dispatch('login') → state updates
7. isAuthenticated becomes true
8. useEffect detects change → navigate("/app")
9. User redirected to app
```

---

## Step 5: Creating the User Component

### File: `src/components/User.jsx`

### 5.1 Import Dependencies

```javascript
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/FakeAuthContext";
```

- `useNavigate`: For navigation after logout
- `useAuth`: To access user data and logout function

### 5.2 Access Auth Context

```javascript
function User() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
```

**What we get from context:**

- `user`: Object containing `{ name, email, avatar }`
- `logout`: Function to sign out the user

### 5.3 Create Logout Handler

```javascript
function handleClick() {
  logout();
  navigate("/");
}
```

**Logout flow:**

1. **`logout()`**: 
   - Dispatches `logout` action
   - Resets `user` to `null`
   - Sets `isAuthenticated` to `false`

2. **`navigate("/")`**: 
   - Redirects user to homepage
   - Prevents access to protected routes

**Why navigate after logout?**

- **Security**: Ensures user can't access protected routes
- **UX**: Clear indication that logout succeeded
- **Clean state**: User starts fresh on homepage

### 5.4 Render User Information

```javascript
return (
  <div className={styles.user}>
    <img src={user.avatar} alt={user.name} />
    <span>Welcome, {user.name}</span>
    <button onClick={handleClick}>Logout</button>
  </div>
);
```

**Component displays:**

- **Avatar image**: User's profile picture
- **Welcome message**: Personalized greeting with user's name
- **Logout button**: Triggers logout and navigation

**Important**: This component assumes `user` exists. In a real app, you might want to add a check:

```javascript
if (!user) return null; // Don't render if no user
```

---

## Step 6: Adding User Component to AppLayout

### File: `src/pages/AppLayout.jsx`

### 6.1 Import User Component

```javascript
import User from '../components/User';
```

### 6.2 Add to Layout

```javascript
function AppLayout() {
  return (
    <div className={styles.app}>
      <SideBar />
      <Map />
      <User />
    </div>
  )
}
```

**Layout structure:**

- **SideBar**: Navigation menu
- **Map**: Main map component
- **User**: User info and logout button

**Why in AppLayout?**

- **Protected route**: AppLayout is only accessible when authenticated
- **Persistent display**: User info visible across all app pages
- **Consistent UI**: Logout always accessible

---

## Security Considerations

### ⚠️ Current Implementation (Fake Auth)

**What we have:**
- Plain text password comparison
- Hardcoded credentials
- Client-side only authentication
- No token/session management

**This is acceptable for:**
- ✅ Development and testing
- ✅ Learning purposes
- ✅ Prototyping
- ❌ **NOT for production**

### 🔒 Production Requirements

#### 1. Password Hashing

```javascript
// ❌ DON'T DO THIS (current):
if (password === storedPassword) { ... }

// ✅ DO THIS (production):
const bcrypt = require('bcrypt');
const isValid = await bcrypt.compare(inputPassword, hashedPassword);
```

**Why hash passwords?**

- **Security**: Even if database is compromised, passwords are unreadable
- **Best practice**: Industry standard for password storage
- **One-way**: Cannot reverse hash to get original password

#### 2. Backend API

```javascript
// ❌ DON'T DO THIS (current):
// Client-side validation

// ✅ DO THIS (production):
// Send credentials to backend API
const response = await fetch('/api/login', {
  method: 'POST',
  body: JSON.stringify({ email, password })
});
const { token, user } = await response.json();
```

**Why backend?**

- **Security**: Credentials never exposed in client code
- **Validation**: Server validates against database
- **Tokens**: Returns secure JWT tokens

#### 3. Token Management

```javascript
// ✅ Production approach:
// Store token in httpOnly cookie or localStorage
localStorage.setItem('token', token);

// Include token in API requests
headers: {
  'Authorization': `Bearer ${token}`
}
```

#### 4. Environment Variables

```javascript
// ❌ DON'T DO THIS:
const API_URL = "https://myapi.com";

// ✅ DO THIS:
const API_URL = import.meta.env.VITE_API_URL;
```

**`.env` file:**
```
VITE_API_URL=https://myapi.com
VITE_API_KEY=secret_key_here
```

**Never commit `.env` files to git!**

### 📋 Security Checklist

- [ ] Passwords hashed with bcrypt/argon2
- [ ] Authentication handled by backend API
- [ ] JWT tokens or secure sessions
- [ ] HTTPS for all authentication requests
- [ ] Environment variables for sensitive data
- [ ] Rate limiting on login attempts
- [ ] Password strength requirements
- [ ] Two-factor authentication (optional)
- [ ] Secure password reset flow

---

## Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    USER VISITS /login                       │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              Login Component Renders                        │
│  - Form with email/password inputs                          │
│  - useAuth() hook gets login() and isAuthenticated         │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              User Submits Form                              │
│  handleSubmit() → login(email, password)                    │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│         AuthProvider.login() Validates                      │
│  - Compares with FAKE_USER_CREDENTIALS                     │
│  - If valid: dispatch({type: 'login', payload: userData})   │
│  - If invalid: throw Error                                  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│            Reducer Updates State                            │
│  - user: FAKE_USER_DATA                                     │
│  - isAuthenticated: true                                    │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│         useEffect Detects Change                            │
│  - isAuthenticated === true                                 │
│  - navigate("/app")                                         │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              User Redirected to /app                        │
│  - AppLayout renders                                        │
│  - User component displays user info                        │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              User Clicks Logout                             │
│  - logout() called                                          │
│  - dispatch({type: 'logout'})                               │
│  - navigate("/")                                           │
└─────────────────────────────────────────────────────────────┘
```

---

## Key Concepts Summary

### 1. Context API Pattern

**What**: React's built-in state management for sharing data across components

**Why**: Avoids prop drilling, centralizes state

**How**: 
- Create context with `createContext()`
- Provide with `Context.Provider`
- Consume with `useContext()` or custom hook

### 2. Reducer Pattern

**What**: Centralized state updates using actions

**Why**: Predictable state changes, easier debugging

**How**:
- Define reducer function with switch statement
- Use `useReducer()` hook
- Dispatch actions to update state

### 3. Custom Hooks

**What**: Reusable functions that use React hooks

**Why**: Encapsulate logic, improve reusability

**How**:
- Create function starting with `use`
- Use other hooks inside
- Return values/functions needed by components

### 4. Programmatic Navigation

**What**: Navigating routes using code instead of links

**Why**: Dynamic navigation based on state/events

**How**:
- Use `useNavigate()` hook from React Router
- Call `navigate(path)` when needed

### 5. Controlled Components

**What**: Form inputs controlled by React state

**Why**: Full control over input values, validation

**How**:
- Set `value={state}`
- Handle `onChange` to update state

### 6. Effect Hook for Side Effects

**What**: Handle side effects (navigation, API calls) based on state changes

**Why**: Separate side effects from rendering logic

**How**:
- Use `useEffect()` with dependency array
- Effect runs when dependencies change

---

## Common Patterns Used

### Pattern 1: Context + Reducer

```javascript
// Context provides state and functions
const Context = createContext();

function Provider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  
  const actions = {
    login: (data) => dispatch({type: 'login', payload: data}),
    logout: () => dispatch({type: 'logout'})
  };
  
  return (
    <Context.Provider value={{...state, ...actions}}>
      {children}
    </Context.Provider>
  );
}
```

### Pattern 2: Custom Hook with Error Handling

```javascript
function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
```

### Pattern 3: Effect-Based Navigation

```javascript
useEffect(() => {
  if (condition) {
    navigate('/path');
  }
}, [condition, navigate]);
```

### Pattern 4: Form Submission Handler

```javascript
function handleSubmit(e) {
  e.preventDefault();
  try {
    action(formData);
  } catch (error) {
    // Handle error
  }
}
```

---

## Testing the Implementation

### Test Cases

1. **Login with correct credentials**
   - ✅ Should authenticate user
   - ✅ Should redirect to `/app`
   - ✅ User component should display user info

2. **Login with incorrect credentials**
   - ✅ Should throw error
   - ✅ Should NOT redirect
   - ✅ Should NOT authenticate

3. **Logout**
   - ✅ Should clear user data
   - ✅ Should set `isAuthenticated` to false
   - ✅ Should redirect to `/`

4. **Navigation after login**
   - ✅ Should automatically navigate when `isAuthenticated` becomes true
   - ✅ Should work even if user manually navigates

---

## Troubleshooting

### Issue: "useAuth must be used within AuthProvider"

**Cause**: Component using `useAuth()` is outside `AuthProvider`

**Solution**: Ensure `AuthProvider` wraps the component tree

### Issue: Navigation not working

**Cause**: `useNavigate()` used outside `BrowserRouter`

**Solution**: Ensure `BrowserRouter` wraps routes

### Issue: State not updating

**Cause**: Reducer not handling action type correctly

**Solution**: Check reducer switch statement includes all action types

### Issue: User data undefined

**Cause**: Accessing `user` before login

**Solution**: Add null check: `if (!user) return null;`

---

## Next Steps

### Enhancements You Could Add

1. **Protected Routes**
   ```javascript
   function ProtectedRoute({ children }) {
     const { isAuthenticated } = useAuth();
     return isAuthenticated ? children : <Navigate to="/login" />;
   }
   ```

2. **Persistent Login**
   ```javascript
   // Store auth state in localStorage
   useEffect(() => {
     localStorage.setItem('user', JSON.stringify(user));
   }, [user]);
   ```

3. **Loading States**
   ```javascript
   const [isLoading, setIsLoading] = useState(false);
   // Show spinner during authentication
   ```

4. **Error Messages**
   ```javascript
   const [error, setError] = useState("");
   // Display error messages to user
   ```

5. **Form Validation**
   ```javascript
   // Validate email format
   // Check password strength
   // Show validation errors
   ```

---

## Conclusion

You've successfully implemented a complete authentication system using:

- ✅ Context API for state management
- ✅ Reducer pattern for state updates
- ✅ Custom hooks for clean API
- ✅ Programmatic navigation
- ✅ Form handling
- ✅ Effect hooks for side effects

This foundation can be extended with backend integration, token management, and additional security features for production use.

---

## Code Files Reference

- `src/contexts/FakeAuthContext.jsx` - Authentication context and provider
- `src/App.jsx` - Root component with AuthProvider
- `src/pages/Login.jsx` - Login page component
- `src/components/User.jsx` - User display and logout component
- `src/pages/AppLayout.jsx` - Protected layout with User component

---

**Remember**: This is a fake authentication system for learning. Always implement proper security measures in production applications!
