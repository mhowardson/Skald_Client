import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';

import { RegisterPage } from './RegisterPage';
import { renderWithProviders } from '../../test/utils/testUtils';

// Mock navigation
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock register mutation
const mockRegister = vi.fn();
const mockUseRegisterMutation = vi.fn();

vi.mock('../../store/api/authApi', () => ({
  authApi: {
    reducerPath: 'authApi',
    reducer: (state = {}) => state,
    middleware: vi.fn(() => (next: any) => (action: any) => next(action)),
    endpoints: {},
  },
  useRegisterMutation: () => mockUseRegisterMutation(),
}));

describe('RegisterPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    mockRegister.mockReturnValue({
      unwrap: vi.fn().mockResolvedValue({
        user: {
          id: '1',
          email: 'test@example.com',
          profile: { firstName: 'John', lastName: 'Doe' }
        },
        tokens: {
          accessToken: 'access-token',
          refreshToken: 'refresh-token',
          expiresIn: 3600
        }
      })
    });
    
    mockUseRegisterMutation.mockReturnValue([
      mockRegister,
      { isLoading: false, error: null }
    ]);
  });

  it('renders registration form', () => {
    renderWithProviders(<RegisterPage />);
    
    expect(screen.getByText('Create Your Account')).toBeInTheDocument();
    expect(screen.getByText('Join ContentAutoPilot and start automating your content')).toBeInTheDocument();
    
    expect(screen.getByTestId('firstName-input')).toBeInTheDocument();
    expect(screen.getByTestId('lastName-input')).toBeInTheDocument();
    expect(screen.getByTestId('email-input')).toBeInTheDocument();
    expect(screen.getByTestId('password-input')).toBeInTheDocument();
    expect(screen.getByTestId('organizationName-input')).toBeInTheDocument();
    expect(screen.getByTestId('organizationType-select')).toBeInTheDocument();
    expect(screen.getByTestId('plan-select')).toBeInTheDocument();
    expect(screen.getByTestId('register-button')).toBeInTheDocument();
  });

  it('renders login link', () => {
    renderWithProviders(<RegisterPage />);
    
    expect(screen.getByText('Already have an account?')).toBeInTheDocument();
    expect(screen.getByTestId('login-link')).toBeInTheDocument();
  });

  it('toggles password visibility', async () => {
    const user = userEvent.setup();
    renderWithProviders(<RegisterPage />);
    
    const passwordInput = screen.getByTestId('password-input').querySelector('input')!;
    const toggleButton = screen.getByTestId('toggle-password');
    
    expect(passwordInput.type).toBe('password');
    
    await user.click(toggleButton);
    expect(passwordInput.type).toBe('text');
    
    await user.click(toggleButton);
    expect(passwordInput.type).toBe('password');
  });

  it('validates required fields', async () => {
    const user = userEvent.setup();
    renderWithProviders(<RegisterPage />);
    
    const submitButton = screen.getByTestId('register-button');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('First name is required')).toBeInTheDocument();
      expect(screen.getByText('Last name is required')).toBeInTheDocument();
      expect(screen.getByText('Email is required')).toBeInTheDocument();
      expect(screen.getByText('Password is required')).toBeInTheDocument();
      expect(screen.getByText('Organization name is required')).toBeInTheDocument();
      expect(screen.getByText('Organization type is required')).toBeInTheDocument();
      expect(screen.getByText('Plan selection is required')).toBeInTheDocument();
    });
  });

  it('validates email format', async () => {
    const user = userEvent.setup();
    renderWithProviders(<RegisterPage />);
    
    const emailInput = screen.getByTestId('email-input').querySelector('input')!;
    await user.type(emailInput, 'invalid-email');
    
    const submitButton = screen.getByTestId('register-button');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Invalid email address')).toBeInTheDocument();
    });
  });

  it('validates password length', async () => {
    const user = userEvent.setup();
    renderWithProviders(<RegisterPage />);
    
    const passwordInput = screen.getByTestId('password-input').querySelector('input')!;
    await user.type(passwordInput, '1234567'); // 7 characters
    
    const submitButton = screen.getByTestId('register-button');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument();
    });
  });

  it('submits form with valid data', async () => {
    const user = userEvent.setup();
    renderWithProviders(<RegisterPage />);
    
    // Fill form
    await user.type(screen.getByTestId('firstName-input').querySelector('input')!, 'John');
    await user.type(screen.getByTestId('lastName-input').querySelector('input')!, 'Doe');
    await user.type(screen.getByTestId('email-input').querySelector('input')!, 'john@example.com');
    await user.type(screen.getByTestId('password-input').querySelector('input')!, 'password123');
    await user.type(screen.getByTestId('organizationName-input').querySelector('input')!, 'Test Org');
    
    // Select organization type
    const orgTypeSelect = screen.getByTestId('organizationType-select');
    fireEvent.mouseDown(orgTypeSelect.querySelector('[role="button"]')!);
    await waitFor(() => {
      const agencyOption = screen.getByText('Agency');
      fireEvent.click(agencyOption);
    });
    
    // Select plan
    const planSelect = screen.getByTestId('plan-select');
    fireEvent.mouseDown(planSelect.querySelector('[role="button"]')!);
    await waitFor(() => {
      const creatorOption = screen.getByText('Creator');
      fireEvent.click(creatorOption);
    });
    
    // Submit form
    const submitButton = screen.getByTestId('register-button');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
        organizationName: 'Test Org',
        organizationType: 'agency',
        plan: 'creator'
      });
    });
  });

  it('navigates to dashboard on successful registration', async () => {
    const user = userEvent.setup();
    renderWithProviders(<RegisterPage />);
    
    // Fill and submit form (minimal valid data)
    await user.type(screen.getByTestId('firstName-input').querySelector('input')!, 'John');
    await user.type(screen.getByTestId('lastName-input').querySelector('input')!, 'Doe');
    await user.type(screen.getByTestId('email-input').querySelector('input')!, 'john@example.com');
    await user.type(screen.getByTestId('password-input').querySelector('input')!, 'password123');
    await user.type(screen.getByTestId('organizationName-input').querySelector('input')!, 'Test Org');
    
    // Quick select options
    const orgTypeSelect = screen.getByTestId('organizationType-select');
    fireEvent.mouseDown(orgTypeSelect.querySelector('[role="button"]')!);
    await waitFor(() => fireEvent.click(screen.getByText('Agency')));
    
    const planSelect = screen.getByTestId('plan-select');
    fireEvent.mouseDown(planSelect.querySelector('[role="button"]')!);
    await waitFor(() => fireEvent.click(screen.getByText('Creator')));
    
    const submitButton = screen.getByTestId('register-button');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
    });
  });

  it('displays error message on registration failure', async () => {
    const errorMessage = 'Email already exists';
    mockRegister.mockReturnValue({
      unwrap: vi.fn().mockRejectedValue({
        data: { error: { message: errorMessage } }
      })
    });

    // Mock the hook to return error state
    mockUseRegisterMutation.mockReturnValue([
      mockRegister,
      { isLoading: false, error: { data: { error: { message: errorMessage } } } }
    ]);

    renderWithProviders(<RegisterPage />);
    
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('shows loading state during registration', () => {
    // Mock loading state
    mockUseRegisterMutation.mockReturnValue([
      mockRegister,
      { isLoading: true, error: null }
    ]);

    renderWithProviders(<RegisterPage />);
    
    const submitButton = screen.getByTestId('register-button');
    expect(submitButton).toBeDisabled();
    expect(screen.getByText('Creating Account...')).toBeInTheDocument();
  });

  it('shows organization type options', async () => {
    renderWithProviders(<RegisterPage />);
    
    const orgTypeSelect = screen.getByTestId('organizationType-select');
    fireEvent.mouseDown(orgTypeSelect.querySelector('[role="button"]')!);
    
    await waitFor(() => {
      expect(screen.getByText('Agency')).toBeInTheDocument();
      expect(screen.getByText('Enterprise')).toBeInTheDocument();
      expect(screen.getByText('Freelancer')).toBeInTheDocument();
    });
  });

  it('shows plan options', async () => {
    renderWithProviders(<RegisterPage />);
    
    const planSelect = screen.getByTestId('plan-select');
    fireEvent.mouseDown(planSelect.querySelector('[role="button"]')!);
    
    await waitFor(() => {
      expect(screen.getByText('Creator')).toBeInTheDocument();
      expect(screen.getByText('Agency')).toBeInTheDocument();
      expect(screen.getByText('Studio')).toBeInTheDocument();
      expect(screen.getByText('Enterprise')).toBeInTheDocument();
    });
  });

  it('handles form submission error gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const user = userEvent.setup();
    
    mockRegister.mockReturnValue({
      unwrap: vi.fn().mockRejectedValue(new Error('Network error'))
    });

    renderWithProviders(<RegisterPage />);
    
    // Fill minimal form
    await user.type(screen.getByTestId('firstName-input').querySelector('input')!, 'John');
    await user.type(screen.getByTestId('lastName-input').querySelector('input')!, 'Doe');
    await user.type(screen.getByTestId('email-input').querySelector('input')!, 'john@example.com');
    await user.type(screen.getByTestId('password-input').querySelector('input')!, 'password123');
    await user.type(screen.getByTestId('organizationName-input').querySelector('input')!, 'Test Org');
    
    // Quick select
    const orgTypeSelect = screen.getByTestId('organizationType-select');
    fireEvent.mouseDown(orgTypeSelect.querySelector('[role="button"]')!);
    await waitFor(() => fireEvent.click(screen.getByText('Agency')));
    
    const planSelect = screen.getByTestId('plan-select');
    fireEvent.mouseDown(planSelect.querySelector('[role="button"]')!);
    await waitFor(() => fireEvent.click(screen.getByText('Creator')));
    
    const submitButton = screen.getByTestId('register-button');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Registration error:', expect.any(Error));
    });
    
    consoleSpy.mockRestore();
  });
});