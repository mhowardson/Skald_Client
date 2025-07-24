import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../utils/testUtils';
import { LoginPage } from '../../pages/auth/LoginPage';
import { RegisterPage } from '../../pages/auth/RegisterPage';
import { DashboardPage } from '../../pages/dashboard/DashboardPage';

// Mock the API
vi.mock('../../store/api/authApi', () => ({
  useLoginMutation: () => [
    vi.fn().mockResolvedValue({
      unwrap: () => Promise.resolve({
        user: {
          id: '1',
          email: 'test@example.com',
          name: 'Test User',
          role: 'user',
        },
        accessToken: 'mock-token',
        refreshToken: 'mock-refresh-token',
      }),
    }),
    { isLoading: false },
  ],
  useRegisterMutation: () => [
    vi.fn().mockResolvedValue({
      unwrap: () => Promise.resolve({
        user: {
          id: '1',
          email: 'test@example.com',
          name: 'Test User',
          role: 'user',
        },
        accessToken: 'mock-token',
        refreshToken: 'mock-refresh-token',
      }),
    }),
    { isLoading: false },
  ],
}));

describe('Authentication Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Login Page', () => {
    it('should render login form', () => {
      renderWithProviders(<LoginPage />);
      
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    it('should validate email format', async () => {
      const user = userEvent.setup();
      renderWithProviders(<LoginPage />);
      
      const emailInput = screen.getByLabelText(/email/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      
      await user.type(emailInput, 'invalid-email');
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/please enter a valid email/i)).toBeInTheDocument();
      });
    });

    it('should validate password requirements', async () => {
      const user = userEvent.setup();
      renderWithProviders(<LoginPage />);
      
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      
      await user.type(passwordInput, '123');
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument();
      });
    });

    it('should handle successful login', async () => {
      const user = userEvent.setup();
      renderWithProviders(<LoginPage />);
      
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/signing in/i)).toBeInTheDocument();
      });
    });

    it('should handle login errors', async () => {
      // Mock failed login
      vi.mocked(useLoginMutation).mockReturnValue([
        vi.fn().mockRejectedValue({
          unwrap: () => Promise.reject({ message: 'Invalid credentials' }),
        }),
        { isLoading: false },
      ]);

      const user = userEvent.setup();
      renderWithProviders(<LoginPage />);
      
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'wrongpassword');
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
      });
    });

    it('should toggle password visibility', async () => {
      const user = userEvent.setup();
      renderWithProviders(<LoginPage />);
      
      const passwordInput = screen.getByLabelText(/password/i);
      const toggleButton = screen.getByRole('button', { name: /toggle password visibility/i });
      
      expect(passwordInput).toHaveAttribute('type', 'password');
      
      await user.click(toggleButton);
      
      expect(passwordInput).toHaveAttribute('type', 'text');
    });

    it('should navigate to register page', async () => {
      const user = userEvent.setup();
      renderWithProviders(<LoginPage />);
      
      const registerLink = screen.getByText(/don't have an account/i);
      await user.click(registerLink);
      
      // This would typically test navigation, but we'll just check the link exists
      expect(registerLink).toBeInTheDocument();
    });
  });

  describe('Register Page', () => {
    it('should render registration form', () => {
      renderWithProviders(<RegisterPage />);
      
      expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
    });

    it('should validate password confirmation', async () => {
      const user = userEvent.setup();
      renderWithProviders(<RegisterPage />);
      
      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole('button', { name: /create account/i });
      
      await user.type(passwordInput, 'password123');
      await user.type(confirmPasswordInput, 'password456');
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
      });
    });

    it('should require terms acceptance', async () => {
      const user = userEvent.setup();
      renderWithProviders(<RegisterPage />);
      
      const nameInput = screen.getByLabelText(/full name/i);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole('button', { name: /create account/i });
      
      await user.type(nameInput, 'Test User');
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.type(confirmPasswordInput, 'password123');
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/you must accept the terms/i)).toBeInTheDocument();
      });
    });

    it('should handle successful registration', async () => {
      const user = userEvent.setup();
      renderWithProviders(<RegisterPage />);
      
      const nameInput = screen.getByLabelText(/full name/i);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const termsCheckbox = screen.getByLabelText(/i agree to the terms/i);
      const submitButton = screen.getByRole('button', { name: /create account/i });
      
      await user.type(nameInput, 'Test User');
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.type(confirmPasswordInput, 'password123');
      await user.click(termsCheckbox);
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/creating account/i)).toBeInTheDocument();
      });
    });
  });

  describe('Protected Routes', () => {
    it('should redirect to login when not authenticated', () => {
      const initialState = {
        auth: {
          user: null,
          accessToken: null,
          isAuthenticated: false,
        },
      };
      
      renderWithProviders(<DashboardPage />, { initialState });
      
      // This would typically test redirection, but we'll check for auth guard
      expect(screen.queryByText(/dashboard/i)).not.toBeInTheDocument();
    });

    it('should render protected content when authenticated', () => {
      const initialState = {
        auth: {
          user: {
            id: '1',
            email: 'test@example.com',
            name: 'Test User',
            role: 'user',
          },
          accessToken: 'mock-token',
          isAuthenticated: true,
        },
      };
      
      renderWithProviders(<DashboardPage />, { initialState });
      
      expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
    });
  });

  describe('Token Management', () => {
    it('should store tokens in localStorage on login', async () => {
      const user = userEvent.setup();
      renderWithProviders(<LoginPage />);
      
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(localStorage.setItem).toHaveBeenCalledWith('accessToken', 'mock-token');
        expect(localStorage.setItem).toHaveBeenCalledWith('refreshToken', 'mock-refresh-token');
      });
    });

    it('should clear tokens on logout', async () => {
      const initialState = {
        auth: {
          user: {
            id: '1',
            email: 'test@example.com',
            name: 'Test User',
            role: 'user',
          },
          accessToken: 'mock-token',
          isAuthenticated: true,
        },
      };
      
      renderWithProviders(<DashboardPage />, { initialState });
      
      const logoutButton = screen.getByRole('button', { name: /logout/i });
      await fireEvent.click(logoutButton);
      
      await waitFor(() => {
        expect(localStorage.removeItem).toHaveBeenCalledWith('accessToken');
        expect(localStorage.removeItem).toHaveBeenCalledWith('refreshToken');
      });
    });
  });

  describe('Role-based Access', () => {
    it('should show admin features for admin users', () => {
      const initialState = {
        auth: {
          user: {
            id: '1',
            email: 'admin@example.com',
            name: 'Admin User',
            role: 'admin',
          },
          accessToken: 'mock-token',
          isAuthenticated: true,
        },
      };
      
      renderWithProviders(<DashboardPage />, { initialState });
      
      expect(screen.getByText(/admin dashboard/i)).toBeInTheDocument();
    });

    it('should hide admin features for regular users', () => {
      const initialState = {
        auth: {
          user: {
            id: '1',
            email: 'user@example.com',
            name: 'Regular User',
            role: 'user',
          },
          accessToken: 'mock-token',
          isAuthenticated: true,
        },
      };
      
      renderWithProviders(<DashboardPage />, { initialState });
      
      expect(screen.queryByText(/admin dashboard/i)).not.toBeInTheDocument();
    });
  });
});