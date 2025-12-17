# 238 - Adding Authentication with Fake User

## 📚 Overview

This guide explains how to implement authentication in a React application using **Context API** and **useReducer** hook. We'll create a fake authentication system that simulates user login/logout without connecting to a real backend server. This is perfect for development and prototyping.

---

## 🎯 Learning Objectives

By the end of this guide, you will understand:

1. How to create an authentication context using React Context API
2. How to manage authentication state with `useReducer`
3. How to implement login and logout functionality
4. How to create a custom hook (`useAuth`) for accessing auth state
5. How to protect routes and components based on authentication status
6. Best practices for authentication state management

---

## 📋 Table of Contents

1. [Concepts Overview](#concepts-overview)
2. [Step-by-Step Implementation](#step-by-step-implementation)
3. [Understanding the Reducer](#understanding-the-reducer)
4. [Complete Code Breakdown](#complete-code-breakdown)
5. [Using Authentication in Components](#using-authentication-in-components)
6. [Data Flow Diagram](#data-flow-diagram)
7. [Best Practices](#best-practices)
8. [Common Patterns](#common-patterns)
9. [Troubleshooting](#troubleshooting)

---

## 🧠 Concepts Overview

### What is Authentication Context?

An **Authentication Context** is a React Context that provides authentication state and methods to all components in your application. It acts as a centralized place to manage:

- Current user information
- Authentication status (logged in/out)
- Login and logout functions

### Why Use Context for Authentication?

| Without Context                    | With Context                      |
|-----------------------------------|-----------------------------------|
| Prop drilling through many levels | Direct access from any component  |
| State scattered across components | Single source of truth           |
| Hard to maintain                  | Easy to update globally           |
| Difficult to test                 | Testable in isolation             |

### Authentication Flow

```
User Action → Login Function → Reducer → State Update → Context Update → UI Re-render
```

1. **User Action**: User submits login form
2. **Login Function**: Validates credentials
3. **Reducer**: Updates authentication state
4. **Context Update**: New state propagated to all consumers
5. **UI Re-render**: Components reflect new auth state

---

## 🛠️ Step-by-Step Implementation

### Step 1: Imports and Setup

```javascript
import { createContext, useContext, useReducer } from "react";
```

**What each import does:**
- `createContext`: Creates the authentication context object
- `useContext`: Hook to access context in components
- `useReducer`: Manages authentication state with reducer pattern

### Step 2: Create Context

```javascript
const AuthContext = createContext();
```

**Purpose:**
- Creates a context object that will hold authentication state and functions
- This context will be provided to all child components via `AuthProvider`

### Step 3: Define Initial State

```javascript
const initialState = {
     user: null,
     isAuthenticated: false,
}
```

**State Structure:**
- `user`: Object containing user information (null when logged out)
- `isAuthenticated`: Boolean flag indicating login status

**Why this structure?**
- Separates user data from authentication status
- Makes it easy to check if user is logged in
- Allows for easy state reset on logout

### Step 4: Create Reducer Function

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

**Reducer Actions:**

| Action Type | Payload          | Result                                    |
|-------------|------------------|-------------------------------------------|
| `login`     | User object      | Sets user data and `isAuthenticated: true` |
| `logout`    | None             | Clears user and sets `isAuthenticated: false` |

**Key Points:**
- ✅ Uses spread operator to maintain immutability
- ✅ Always returns a new state object
- ✅ Throws error for unknown actions (helps catch bugs)

### Step 5: Define Fake User

```javascript
const FAKE_USER = {
     name: "Jack",
     email: "jack@example.com",
     password: "qwerty",
     avatar: "https://i.pravatar.cc/100?u=zz",
}
```

**Purpose:**
- Hardcoded user credentials for testing
- Simulates a real user without backend
- **Important**: Never use this in production!

**User Object Structure:**
- `name`: User's display name
- `email`: Login email (used for authentication)
- `password`: Login password (used for authentication)
- `avatar`: Profile picture URL

### Step 6: Create AuthProvider Component

```javascript
function AuthProvider({ children }) {
     const [{user, isAuthenticated}, dispatch] = useReducer(reducer, initialState);
     return<AuthContext.Provider value={{user, isAuthenticated, login, logout}}>
          {children}
          </AuthContext.Provider>
}
```

**What happens here:**
1. `useReducer` initializes state with `initialState`
2. Returns `dispatch` function to trigger state changes
3. Provides `user`, `isAuthenticated`, `login`, and `logout` to all children
4. Wraps children with `AuthContext.Provider`

**⚠️ Important Note:**
The current implementation has `login` and `logout` functions defined outside the component, but they reference `dispatch` which is only available inside. This is a bug that needs to be fixed (see [Troubleshooting](#troubleshooting) section).

### Step 7: Create Login Function

```javascript
function login(email, password) {
     if (email === FAKE_USER.email && password === FAKE_USER.password) {
          dispatch({type: 'login', payload: FAKE_USER});
     }
     throw new Error("Invalid email or password");
}
```

**Function Logic:**
1. Compares provided credentials with `FAKE_USER`
2. If match: dispatches `login` action with user data
3. If no match: throws error

**Validation:**
- Checks email against `FAKE_USER.email`
- Checks password against `FAKE_USER.password`
- Only authenticates if both match exactly

### Step 8: Create Logout Function

```javascript
function logout() {
     dispatch({type: 'logout'});
}
```

**Function Logic:**
- Dispatches `logout` action
- Reducer clears user data and sets `isAuthenticated: false`

### Step 9: Create useAuth Hook

```javascript
function useAuth() {
     const context = useContext(AuthContext);
     if (context === undefined) {
        throw new Error("useAuth must be used within a AuthProvider");
     }
     return context;
}
```

**Purpose:**
- Custom hook to access authentication context
- Provides better error messages if used outside provider
- Returns `{user, isAuthenticated, login, logout}`

**Why create a custom hook?**
- ✅ Better error handling
- ✅ Consistent API across app
- ✅ Easier to refactor later
- ✅ More descriptive than `useContext(AuthContext)`

### Step 10: Export Components and Functions

```javascript
export { AuthProvider, useAuth, login, logout };
```

**Exports:**
- `AuthProvider`: Component to wrap app and provide auth context
- `useAuth`: Hook to access auth state in components
- `login`: Login function (though typically accessed via `useAuth`)
- `logout`: Logout function (though typically accessed via `useAuth`)

---

## 📝 Complete Code Breakdown

### Full FakeAuthContext.jsx

```javascript
import { createContext, useContext, useReducer } from "react";

// 1. Create Context
const AuthContext = createContext();

// 2. Initial State
const initialState = {
     user: null,
     isAuthenticated: false,
}

// 3. Reducer Function
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

// 4. Fake User Data
const FAKE_USER = {
     name: "Jack",
     email: "jack@example.com",
     password: "qwerty",
     avatar: "https://i.pravatar.cc/100?u=zz",
}

// 5. AuthProvider Component
function AuthProvider({ children }) {
     const [{user, isAuthenticated}, dispatch] = useReducer(reducer, initialState);
     return<AuthContext.Provider value={{user, isAuthenticated, login, logout}}>
          {children}
          </AuthContext.Provider>
}

// 6. Login Function
function login(email, password) {
     if (email === FAKE_USER.email && password === FAKE_USER.password) {
          dispatch({type: 'login', payload: FAKE_USER});
     }
     throw new Error("Invalid email or password");
}

// 7. Logout Function
function logout() {
     dispatch({type: 'logout'});
}

// 8. useAuth Hook
function useAuth() {
     const context = useContext(AuthContext);
     if (context === undefined) {
        throw new Error("useAuth must be used within a AuthProvider");
     }
     return context;
}

// 9. Exports
export { AuthProvider, useAuth, login, logout };
```

---

## 🔧 Using Authentication in Components

### Step 1: Wrap App with AuthProvider

```javascript
// App.jsx
import { AuthProvider } from './contexts/FakeAuthContext';

function App() {
  return (
    <AuthProvider>
      {/* Your app components */}
    </AuthProvider>
  );
}
```

**Why wrap at App level?**
- Makes auth available to all components
- Single source of truth for authentication
- Easy to manage global auth state

### Step 2: Use useAuth Hook in Components

```javascript
// Login.jsx
import { useAuth } from '../contexts/FakeAuthContext';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/app'); // Redirect after login
    } catch (error) {
      alert(error.message);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
}
```

### Step 3: Access User Data

```javascript
// UserMenu.jsx
import { useAuth } from '../contexts/FakeAuthContext';

function UserMenu() {
  const { user, logout } = useAuth();

  return (
    <div>
      <img src={user.avatar} alt={user.name} />
      <span>{user.name}</span>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Step 4: Protect Routes

```javascript
// ProtectedRoute.jsx
import { useAuth } from '../contexts/FakeAuthContext';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
```

**Usage:**
```javascript
<Route 
  path="/app" 
  element={
    <ProtectedRoute>
      <AppLayout />
    </ProtectedRoute>
  } 
/>
```

---

## 📊 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    User Interaction                         │
│                  (Login Form Submit)                        │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    Login Component                          │
│  - Gets email/password from form                           │
│  - Calls login(email, password) from useAuth()             │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    login() Function                         │
│  - Validates credentials against FAKE_USER                 │
│  - Dispatches {type: 'login', payload: FAKE_USER}          │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    Reducer Function                         │
│  - Receives action: {type: 'login', payload: FAKE_USER}    │
│  - Returns new state: {user: FAKE_USER, isAuthenticated: true} │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    AuthProvider                             │
│  - State updates via useReducer                            │
│  - Provides new state to all consumers                     │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              All Components Using useAuth()                 │
│  - Receive updated user and isAuthenticated                │
│  - Re-render with new authentication state                 │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ Best Practices

### 1. **Keep Reducer Pure**
- ✅ No side effects (API calls, localStorage, etc.)
- ✅ No mutations (always return new state)
- ✅ Predictable (same input = same output)

### 2. **Handle Errors Properly**
```javascript
function login(email, password) {
  try {
    if (email === FAKE_USER.email && password === FAKE_USER.password) {
      dispatch({type: 'login', payload: FAKE_USER});
      return; // Success
    }
    throw new Error("Invalid email or password");
  } catch (error) {
    // Handle error
    throw error;
  }
}
```

### 3. **Use TypeScript for Type Safety** (Optional)
```typescript
interface User {
  name: string;
  email: string;
  avatar: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}
```

### 4. **Persist Auth State** (For Real Apps)
```javascript
// Save to localStorage on login
localStorage.setItem('user', JSON.stringify(user));

// Load from localStorage on mount
useEffect(() => {
  const savedUser = localStorage.getItem('user');
  if (savedUser) {
    dispatch({type: 'login', payload: JSON.parse(savedUser)});
  }
}, []);
```

### 5. **Add Loading States**
```javascript
const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: false, // Add loading state
  error: null,      // Add error state
}
```

---

## 🔄 Common Patterns

### Pattern 1: Conditional Rendering Based on Auth

```javascript
function App() {
  const { isAuthenticated } = useAuth();

  return (
    <>
      {isAuthenticated ? (
        <AuthenticatedApp />
      ) : (
        <PublicApp />
      )}
    </>
  );
}
```

### Pattern 2: Show User Info When Logged In

```javascript
function Header() {
  const { user, isAuthenticated } = useAuth();

  return (
    <header>
      {isAuthenticated ? (
        <div>
          <img src={user.avatar} alt={user.name} />
          <span>{user.name}</span>
        </div>
      ) : (
        <Link to="/login">Login</Link>
      )}
    </header>
  );
}
```

### Pattern 3: Redirect After Login

```javascript
function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/app';

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (error) {
      // Handle error
    }
  }
}
```

---

## 🐛 Troubleshooting

### Issue 1: `dispatch is not defined`

**Problem:**
```javascript
function login(email, password) {
  dispatch({type: 'login', payload: FAKE_USER}); // ❌ Error!
}
```

**Solution:**
Move `login` and `logout` functions inside `AuthProvider`:

```javascript
function AuthProvider({ children }) {
  const [{user, isAuthenticated}, dispatch] = useReducer(reducer, initialState);

  function login(email, password) {
    if (email === FAKE_USER.email && password === FAKE_USER.password) {
      dispatch({type: 'login', payload: FAKE_USER});
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
```

### Issue 2: `useAuth must be used within a AuthProvider`

**Problem:**
Component using `useAuth()` is not wrapped in `AuthProvider`.

**Solution:**
```javascript
// ❌ Wrong
function App() {
  return <Login />; // Login uses useAuth() but no provider
}

// ✅ Correct
function App() {
  return (
    <AuthProvider>
      <Login />
    </AuthProvider>
  );
}
```

### Issue 3: State Not Updating

**Problem:**
Login works but UI doesn't update.

**Solution:**
- Check if component is using `useAuth()` hook
- Verify `AuthProvider` wraps the component
- Check reducer is returning new state (not mutating)

### Issue 4: Login Always Fails

**Problem:**
Credentials don't match.

**Solution:**
- Verify email: `jack@example.com`
- Verify password: `qwerty`
- Check for typos or extra spaces
- Add console.log to debug:

```javascript
function login(email, password) {
  console.log('Email:', email, 'Expected:', FAKE_USER.email);
  console.log('Password:', password, 'Expected:', FAKE_USER.password);
  // ... rest of function
}
```

---

## 🎓 Key Takeaways

1. **Context API + useReducer** = Powerful state management
2. **Reducer** should be pure (no side effects)
3. **Custom hooks** (`useAuth`) provide better API
4. **Fake authentication** is great for prototyping
5. **Always validate** credentials before updating state
6. **Error handling** is crucial for good UX
7. **Protect routes** based on authentication status

---

## 📚 Next Steps

1. **Add Protected Routes**: Create route guards
2. **Add Loading States**: Show spinners during auth
3. **Add Error Messages**: Display auth errors to users
4. **Persist Auth**: Save to localStorage
5. **Add Real Backend**: Replace fake user with API calls
6. **Add Token Management**: Implement JWT tokens
7. **Add Password Reset**: Implement forgot password flow

---

## 🔗 Related Concepts

- **React Context API**: Sharing state across components
- **useReducer Hook**: Managing complex state
- **Custom Hooks**: Creating reusable logic
- **Route Protection**: Securing routes based on auth
- **State Management**: Centralized state patterns

---

## 📝 Summary

In this lesson, we learned how to:

✅ Create an authentication context using React Context API  
✅ Manage authentication state with `useReducer`  
✅ Implement login and logout functionality  
✅ Create a custom `useAuth` hook  
✅ Handle authentication errors  
✅ Structure authentication code for maintainability  

The fake authentication system provides a solid foundation for building real authentication features later!
