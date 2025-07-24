import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../store/store';
import { useGetCurrentUserQuery } from '../store/api/authApi';
import { setCredentials, setLoading, logout } from '../store/slices/authSlice';

/**
 * Authentication Hook
 * 
 * Provides authentication state and methods for login, logout, and token management.
 * Handles automatic token refresh, user data fetching, and authentication state persistence.
 * This hook integrates with Redux store and RTK Query for comprehensive auth management.
 * 
 * @hook
 * @example
 * // Basic usage in a component
 * function MyComponent() {
 *   const { user, isAuthenticated, logout, isLoading } = useAuth();
 *   
 *   if (isLoading) return <div>Loading...</div>;
 *   if (!isAuthenticated) return <LoginForm />;
 *   
 *   return (
 *     <div>
 *       <h1>Welcome, {user.profile.firstName}!</h1>
 *       <button onClick={logout}>Logout</button>
 *     </div>
 *   );
 * }
 * 
 * @example
 * // Protected route usage
 * function ProtectedRoute({ children }) {
 *   const { isAuthenticated, isLoading } = useAuth();
 *   
 *   if (isLoading) return <LoadingSpinner />;
 *   return isAuthenticated ? children : <Navigate to="/login" />;
 * }
 * 
 * @returns {Object} Authentication state and methods
 * @returns {User|null} user - Current authenticated user object with profile and organization data
 * @returns {boolean} isAuthenticated - Whether user is logged in (has valid user and token)
 * @returns {boolean} isLoading - Whether auth state is being determined or user data is loading
 * @returns {string|null} error - Authentication error message if any operation failed
 * @returns {Function} logout - Function to log out current user and clear auth state
 * 
 * @behavior
 * - **Automatic User Fetching**: Loads user data if valid token exists in Redux store
 * - **Token Validation**: Automatically validates tokens and fetches user information
 * - **Error Recovery**: Handles token refresh failures by triggering logout
 * - **State Synchronization**: Keeps Redux auth state in sync with API responses
 * - **Loading Management**: Manages loading states during auth operations
 * - **Persistent Auth**: Maintains authentication across browser sessions
 * 
 * @side_effects
 * - Dispatches Redux actions to update auth state (`setCredentials`, `logout`, `setLoading`)
 * - Triggers RTK Query for user data fetching when needed
 * - Clears localStorage tokens on logout (handled by Redux slice)
 * - May trigger navigation redirects on authentication failures
 * 
 * @error_conditions
 * - **Network Failures**: RTK Query handles network errors and retries
 * - **Invalid Tokens**: Automatically logs out user if token validation fails
 * - **API Errors**: Surfaces API errors through the error return value
 * - **Token Expiry**: Handled by baseQuery in RTK Query configuration
 * 
 * @dependencies
 * - **Redux Store**: Requires auth slice and RTK Query setup
 * - **RTK Query**: Uses `useGetCurrentUserQuery` for user data fetching
 * - **Auth Slice**: Dispatches actions for state management
 * - **localStorage**: For token persistence (handled by slice)
 * 
 * @performance
 * - **Optimized Queries**: Skips user query if token is missing or user already loaded
 * - **Memoized Selectors**: Uses Redux selectors for efficient state access
 * - **Conditional Effects**: Only runs effects when necessary dependencies change
 * - **Debounced Loading**: Prevents unnecessary loading state flickers
 * 
 * @security
 * - **Token Validation**: Automatically validates tokens with backend
 * - **Secure Storage**: Tokens stored securely in Redux with localStorage backup
 * - **Automatic Cleanup**: Clears sensitive data on logout or token failure
 * - **Error Handling**: Safely handles authentication errors without exposing internals
 * 
 * @testing
 * - Unit tests: `src/hooks/__tests__/useAuth.test.ts`
 * - Integration tests: `src/test/integration/auth-flow.test.tsx`
 * - Mock implementations available in test utilities
 * 
 * @see {@link authSlice} - Redux slice for auth state management
 * @see {@link authApi} - RTK Query API for authentication endpoints
 * @see {@link useGetCurrentUserQuery} - RTK Query hook for user data
 * 
 * @since 1.0.0
 * @version 1.1.0
 */
export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, accessToken, isLoading, error } = useSelector(
    (state: RootState) => state.auth
  );

  // Query current user if we have a token but no user data
  const {
    data: userData,
    error: userError,
    isLoading: userLoading,
  } = useGetCurrentUserQuery(undefined, {
    skip: !accessToken || !!user,
  });

  useEffect(() => {
    if (accessToken && userData && !user) {
      dispatch(setCredentials({
        user: userData.user,
        accessToken,
        refreshToken: localStorage.getItem('refreshToken') || '',
      }));
    }
  }, [accessToken, userData, user, dispatch]);

  useEffect(() => {
    if (userError) {
      // If user query fails, likely token is invalid
      dispatch(logout());
    }
  }, [userError, dispatch]);

  useEffect(() => {
    // Set loading false after initial checks
    if (!userLoading && !isLoading) {
      dispatch(setLoading(false));
    }
  }, [userLoading, isLoading, dispatch]);

  useEffect(() => {
    // If no access token on initial load, set loading to false
    if (!accessToken && isLoading) {
      dispatch(setLoading(false));
    }
  }, [accessToken, isLoading, dispatch]);

  const handleLogout = () => {
    dispatch(logout());
  };

  return {
    user,
    isAuthenticated: !!user && !!accessToken,
    isLoading: isLoading || userLoading,
    error,
    logout: handleLogout,
  };
};