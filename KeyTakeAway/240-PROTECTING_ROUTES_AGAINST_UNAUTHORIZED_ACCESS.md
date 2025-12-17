# 240 - Protecting Routes Against Unauthorized Access

## 📚 Overview

This guide explains how to protect routes in a React application using React Router and authentication context. We'll create a `ProtectedRoute` component that prevents unauthorized users from accessing certain routes and redirects them to the login page.

---

## 🎯 Learning Objectives

By the end of this guide, you will understand:

1. Why route protection is essential for secure applications
2. How to create a `ProtectedRoute` component
3. The difference between render-time checks and side effects
4. How to implement redirect-after-login functionality
5. Best practices for protecting routes in React Router v6
6. Why `useEffect` is NOT needed in `ProtectedRoute`

---

## 📋 Table of Contents

1. [Concepts Overview](#concepts-overview)
2. [Why Protect Routes?](#why-protect-routes)
3. [Step-by-Step Implementation](#step-by-step-implementation)
4. [Understanding the Pattern](#understanding-the-pattern)
5. [Complete Code Breakdown](#complete-code-breakdown)
6. [Why Not useEffect?](#why-not-useeffect)
7. [Redirect After Login](#redirect-after-login)
8. [Best Practices](#best-practices)
9. [Common Patterns](#common-patterns)
10. [Troubleshooting](#troubleshooting)

---

## 🧠 Concepts Overview

### What is Route Protection?

**Route Protection** is a security mechanism that restricts access to certain routes based on authentication status. Unauthorized users are redirected to a login page, and after successful authentication, they're redirected back to their original destination.

### Why Protect Routes?

| Without Protection                    | With Protection                      |
|--------------------------------------|--------------------------------------|
| Anyone can access protected content  | Only authenticated users can access  |
| Sensitive data exposed                | Sensitive data secured               |
| Poor user experience                  | Better UX with proper redirects      |
| Security vulnerability                | Security best practice               |

### Route Protection Flow

```
User tries to access /app/cities
    ↓
ProtectedRoute checks isAuthenticated
    ↓
Not authenticated? → Redirect to /login (save original location)
    ↓
User logs in successfully
    ↓
Redirect back to original location (/app/cities)
```

---

## 🛠️ Step-by-Step Implementation

### Step 1: Create ProtectedRoute Component

#### File: `src/pages/ProtectedRoute.jsx`

```javascript
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/FakeAuthContext';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // Save the location they were trying to access for redirect after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

export default ProtectedRoute;
```

**Key Points:**
- Uses `useAuth()` hook to check authentication status
- Uses `useLocation()` to get current route information
- Returns `<Navigate>` component if not authenticated
- Saves original location in state for redirect after login
- Uses `replace` prop to avoid adding to browser history

### Step 2: Wrap Protected Routes in App.jsx

#### File: `src/App.jsx`

```javascript
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './pages/ProtectedRoute';
import AppLayout from './pages/AppLayout';
// ... other imports

function App() {
  return (
    <AuthProvider>
      <CitiesProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Homepage />} />
            <Route path="/product" element={<Product />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/login" element={<Login />} />
            
            {/* Protected routes */}
            <Route 
              path="/app" 
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/app/cities" replace />} />
              <Route path="cities" element={<CityList />} />
              <Route path="cities/:id" element={<City />} />
              <Route path="countries" element={<CountryList />} />
              <Route path="form" element={<Form />} />
            </Route>
            
            <Route path="*" element={<PageNotFound />} />
          </Routes>
        </BrowserRouter>
      </CitiesProvider>
    </AuthProvider>
  );
}
```

**Key Points:**
- Wrap `AppLayout` (and all nested routes) with `ProtectedRoute`
- All routes under `/app/*` are now protected
- Public routes remain accessible without authentication

### Step 3: Update Login Component for Redirect

#### File: `src/pages/Login.jsx`

```javascript
import { useState, useEffect } from "react";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/FakeAuthContext";

export default function Login() {
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
      console.error(error.message);
    }
  }

  return (
    // ... login form JSX
  );
}
```

**Key Points:**
- Uses `useLocation()` to get saved location from state
- Defaults to `/app` if no saved location exists
- Uses `useEffect` to handle redirect after authentication state changes
- Also has early return check for immediate redirect

---

## 🔍 Understanding the Pattern

### Render-Time Decision vs. Side Effect

#### ProtectedRoute (Render-Time Check)

```javascript
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  
  // ✅ This happens DURING render - immediate decision
  if (!isAuthenticated) {
    return <Navigate to="/login" />; // React Router handles this synchronously
  }
  
  return children; // Only renders if authenticated
}
```

**Why this works:**
- Checks authentication status **during render**
- Returns `<Navigate>` component immediately if not authenticated
- React Router processes `<Navigate>` synchronously during render
- No protected content is ever rendered to unauthenticated users

#### Login Component (Side Effect)

```javascript
function Login() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // ✅ This happens AFTER render - reacts to state change
    if (isAuthenticated === true) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);
  
  // ... rest of component
}
```

**Why this works:**
- Reacts to **changes** in authentication state
- Redirects happen as a **side effect** after login
- Handles the transition from unauthenticated → authenticated

### Comparison Table

| Aspect | ProtectedRoute | Login |
|--------|----------------|-------|
| **Purpose** | Check current auth state | React to auth state change |
| **Timing** | During render | After render (side effect) |
| **Pattern** | Conditional rendering | State change handler |
| **Tool** | `<Navigate>` component | `navigate()` function |
| **useEffect?** | ❌ No | ✅ Yes |

---

## 🚫 Why Not useEffect?

### The Problem with useEffect in ProtectedRoute

If we used `useEffect` in `ProtectedRoute`:

```javascript
// ❌ BAD - Using useEffect would cause problems
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login"); // This runs AFTER render
    }
  }, [isAuthenticated, navigate]);
  
  return children; // ⚠️ PROBLEM: This renders FIRST, then redirect happens
  // User would see protected content flash before redirect!
}
```

**Problems:**
1. **Content Flash**: Protected content renders first, then redirect happens
2. **Security Risk**: Brief exposure of protected content
3. **Poor UX**: Confusing flash of content before redirect
4. **Unnecessary**: `<Navigate>` handles redirects synchronously during render

### The Correct Approach

```javascript
// ✅ GOOD - Synchronous render-time check
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />; // Happens during render, no flash
  }
  
  return children; // Only renders if authenticated
}
```

**Benefits:**
1. **No Content Flash**: Redirect happens before rendering protected content
2. **Secure**: Protected content never renders to unauthenticated users
3. **Better UX**: Smooth redirect without visual glitches
4. **React Router Pattern**: Uses declarative `<Navigate>` component

---

## 🔄 Redirect After Login

### How It Works

1. **User tries to access protected route** (`/app/cities`)
2. **ProtectedRoute intercepts** → Saves location in state
3. **Redirects to login** → `<Navigate to="/login" state={{ from: location }} />`
4. **User logs in** → Authentication state changes
5. **Login component detects** → Reads saved location from state
6. **Redirects back** → `navigate(from, { replace: true })`

### Code Flow

```javascript
// ProtectedRoute.jsx
if (!isAuthenticated) {
  return <Navigate to="/login" state={{ from: location }} replace />;
  //                                 ^^^^^^^^^^^^^^^^^^^^
  //                                 Saves current location
}

// Login.jsx
const location = useLocation();
const from = location.state?.from?.pathname || "/app";
//            ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
//            Retrieves saved location

useEffect(() => {
  if (isAuthenticated === true) {
    navigate(from, { replace: true });
    //      ^^^^
    //      Redirects to original destination
  }
}, [isAuthenticated, navigate, from]);
```

---

## ✅ Best Practices

### 1. Use `replace` Prop

```javascript
<Navigate to="/login" replace />
```

**Why?**
- Prevents adding redirect to browser history
- User can't go back to protected route using browser back button
- Cleaner navigation history

### 2. Save Original Location

```javascript
<Navigate to="/login" state={{ from: location }} replace />
```

**Why?**
- Better UX - user returns to where they were trying to go
- More intuitive than always redirecting to `/app`

### 3. Provide Default Fallback

```javascript
const from = location.state?.from?.pathname || "/app";
```

**Why?**
- Handles cases where user navigates directly to `/login`
- Always has a valid destination after login

### 4. Early Return for Already Authenticated

```javascript
if (isAuthenticated === true) {
  return <Navigate to={from} replace />;
}
```

**Why?**
- Prevents rendering login form to authenticated users
- Immediate redirect without unnecessary renders

### 5. Wrap Parent Route, Not Individual Children

```javascript
// ✅ GOOD - Wrap parent route
<Route 
  path="/app" 
  element={
    <ProtectedRoute>
      <AppLayout />
    </ProtectedRoute>
  }
>
  <Route path="cities" element={<CityList />} />
  <Route path="countries" element={<CountryList />} />
</Route>

// ❌ BAD - Wrapping each child individually
<Route path="/app" element={<AppLayout />}>
  <Route path="cities" element={<ProtectedRoute><CityList /></ProtectedRoute>} />
  <Route path="countries" element={<ProtectedRoute><CountryList /></ProtectedRoute>} />
</Route>
```

**Why?**
- Cleaner code
- Single protection point
- Easier to maintain

---

## 🎨 Common Patterns

### Pattern 1: Multiple Protected Route Groups

```javascript
<Routes>
  {/* Public routes */}
  <Route path="/" element={<Homepage />} />
  <Route path="/login" element={<Login />} />
  
  {/* Protected user routes */}
  <Route 
    path="/app" 
    element={<ProtectedRoute><AppLayout /></ProtectedRoute>}
  >
    <Route path="cities" element={<CityList />} />
  </Route>
  
  {/* Protected admin routes */}
  <Route 
    path="/admin" 
    element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}
  >
    <Route path="users" element={<UserList />} />
  </Route>
</Routes>
```

### Pattern 2: Role-Based Protection

```javascript
function ProtectedRoute({ children, requiredRole }) {
  const { isAuthenticated, user } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return children;
}

// Usage
<Route 
  path="/admin" 
  element={
    <ProtectedRoute requiredRole="admin">
      <AdminLayout />
    </ProtectedRoute>
  }
/>
```

### Pattern 3: Public Route Protection (Redirect Authenticated Users)

```javascript
function PublicRoute({ children }) {
  const { isAuthenticated } = useAuth();
  
  if (isAuthenticated) {
    return <Navigate to="/app" replace />;
  }
  
  return children;
}

// Usage
<Route 
  path="/login" 
  element={<PublicRoute><Login /></PublicRoute>}
/>
```

---

## 🔧 Troubleshooting

### Problem 1: Infinite Redirect Loop

**Symptoms:**
- Page keeps redirecting between login and protected route

**Cause:**
- Authentication state not properly initialized
- `isAuthenticated` is `undefined` instead of `false`

**Solution:**
```javascript
// Make sure initial state is explicit
const initialState = {
  user: null,
  isAuthenticated: false, // ✅ Explicit false, not undefined
}
```

### Problem 2: Content Flash Before Redirect

**Symptoms:**
- Protected content briefly appears before redirect

**Cause:**
- Using `useEffect` with `navigate()` instead of `<Navigate>`

**Solution:**
```javascript
// ❌ Wrong
useEffect(() => {
  if (!isAuthenticated) navigate("/login");
}, [isAuthenticated]);

// ✅ Correct
if (!isAuthenticated) {
  return <Navigate to="/login" replace />;
}
```

### Problem 3: Redirect Not Working After Login

**Symptoms:**
- Login succeeds but user stays on login page

**Cause:**
- Missing `useEffect` dependency
- Not reading location state correctly

**Solution:**
```javascript
// ✅ Correct
const from = location.state?.from?.pathname || "/app";

useEffect(() => {
  if (isAuthenticated) {
    navigate(from, { replace: true });
  }
}, [isAuthenticated, navigate, from]); // Include all dependencies
```

### Problem 4: Browser Back Button Issues

**Symptoms:**
- User can navigate back to protected route after logout

**Cause:**
- Not using `replace` prop in `<Navigate>`

**Solution:**
```javascript
// ✅ Always use replace
<Navigate to="/login" replace />
```

---

## 📊 Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    User Tries to Access                      │
│                    /app/cities                               │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              ProtectedRoute Component Renders               │
│                                                              │
│  1. Calls useAuth() → Gets isAuthenticated                  │
│  2. Calls useLocation() → Gets current location             │
│  3. Checks: isAuthenticated === false?                      │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
                    ┌───────┴───────┐
                    │               │
            ┌───────▼──────┐  ┌─────▼──────┐
            │ Not          │  │ Authenticated │
            │ Authenticated│  │              │
            └───────┬──────┘  └─────┬───────┘
                    │               │
                    ▼               ▼
        ┌───────────────────┐  ┌──────────────┐
        │ Return <Navigate> │  │ Return       │
        │ to="/login"       │  │ children     │
        │ state={{from:     │  │ (AppLayout)  │
        │  location}}       │  │              │
        └─────────┬─────────┘  └──────────────┘
                  │
                  ▼
        ┌─────────────────────────────┐
        │   User Redirected to Login  │
        │   Location saved in state   │
        └─────────────┬───────────────┘
                      │
                      ▼
        ┌─────────────────────────────┐
        │   User Enters Credentials   │
        │   Calls login() function    │
        └─────────────┬───────────────┘
                      │
                      ▼
        ┌─────────────────────────────┐
        │   AuthContext Updates State │
        │   isAuthenticated = true    │
        └─────────────┬───────────────┘
                      │
                      ▼
        ┌─────────────────────────────┐
        │   Login Component useEffect │
        │   Detects isAuthenticated   │
        │   Reads saved location      │
        └─────────────┬───────────────┘
                      │
                      ▼
        ┌─────────────────────────────┐
        │   navigate(from, {replace}) │
        │   Redirects to /app/cities │
        └─────────────────────────────┘
```

---

## 🎓 Key Concepts Summary

### 1. Render-Time vs. Side Effects

- **Render-time checks** (`ProtectedRoute`): Use conditional rendering with `<Navigate>`
- **Side effects** (`Login`): Use `useEffect` with `navigate()` function

### 2. React Router Components

- **`<Navigate>`**: Declarative redirect component (use during render)
- **`navigate()`**: Imperative navigation function (use in effects/handlers)

### 3. Location State

- **Save location**: `state={{ from: location }}` in `<Navigate>`
- **Read location**: `location.state?.from?.pathname` in component

### 4. History Management

- **`replace` prop**: Prevents adding to browser history
- **Always use**: When redirecting for authentication

### 5. Protection Strategy

- **Wrap parent route**: Protects all nested routes automatically
- **Single point of control**: Easier to maintain and update

---

## 📝 Quick Reference

### ProtectedRoute Component

```javascript
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/FakeAuthContext';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
```

### Usage in Routes

```javascript
<Route 
  path="/app" 
  element={
    <ProtectedRoute>
      <AppLayout />
    </ProtectedRoute>
  }
>
  {/* All nested routes are automatically protected */}
</Route>
```

### Login Redirect Logic

```javascript
const location = useLocation();
const from = location.state?.from?.pathname || "/app";

useEffect(() => {
  if (isAuthenticated) {
    navigate(from, { replace: true });
  }
}, [isAuthenticated, navigate, from]);
```

---

## 🎯 Conclusion

Route protection is essential for securing React applications. By using a `ProtectedRoute` component with render-time checks, we ensure:

- ✅ No unauthorized access to protected routes
- ✅ Smooth user experience with proper redirects
- ✅ No content flash or security vulnerabilities
- ✅ Clean, maintainable code structure

Remember: **Use `<Navigate>` for render-time redirects, and `useEffect` with `navigate()` for side-effect redirects.**

---

## 📚 Related Guides

- **238**: Adding Authentication with Fake User
- **239**: Implementing Authentication Step by Step
- **React Router Documentation**: https://reactrouter.com/

---

**Next Steps:**
- Implement route protection in your application
- Add role-based protection if needed
- Test redirect flows thoroughly
- Consider adding loading states during authentication checks
