import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProtectedRoutes from '../routes/ProtectedRoutes';

jest.mock('../context/AuthContext');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => {
      const translations = {
        'protectedRoutes.loginRequired.title': 'Login Required',
        'protectedRoutes.loginRequired.titlePart1': 'Login',
        'protectedRoutes.loginRequired.titlePart2': 'Required',
        'protectedRoutes.loginRequired.description': 'Please log in to access this content',
        'protectedRoutes.loginRequired.protectedContent.title': 'Protected Content',
        'protectedRoutes.loginRequired.protectedContent.description': 'This content is only for authenticated users',
        'protectedRoutes.loginRequired.benefits.title': 'Benefits',
        'protectedRoutes.loginRequired.benefits.item1': 'Benefit 1',
        'protectedRoutes.loginRequired.benefits.item2': 'Benefit 2',
        'protectedRoutes.loginRequired.benefits.item3': 'Benefit 3',
        'protectedRoutes.loginRequired.loginButton': 'Log In',
        'protectedRoutes.loginRequired.backButton': 'Back to Home',
        'protectedRoutes.loginRequired.registerPrompt.start': 'Don\'t have an account?',
        'protectedRoutes.loginRequired.registerPrompt.link': 'Register now',
        'protectedRoutes.loginRequired.registerPrompt.end': 'for just {{amount}}',
        'protectedRoutes.accessDenied.title': 'Access Denied',
        'protectedRoutes.accessDenied.description': 'You do not have permission to access this page',
        'protectedRoutes.accessDenied.homeButton': 'Go to Home',
      };
      return translations[key] || key;
    }
  })
}));

const ProtectedComponent = () => <div data-testid="protected-content">Protected Content</div>;

describe('ProtectedRoutes Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders children when user is authenticated with admin role', () => {
    useAuth.mockReturnValue({
      user: { role: 'admin' }
    });

    render(
      <MemoryRouter>
        <ProtectedRoutes>
          <ProtectedComponent />
        </ProtectedRoutes>
      </MemoryRouter>
    );

    const protectedContent = screen.getByTestId('protected-content');
    expect(protectedContent).toBeInTheDocument();
  });

  test('renders access denied screen when user is authenticated but not an admin', () => {
    useAuth.mockReturnValue({
      user: { role: 'user' }
    });

    render(
      <MemoryRouter>
        <ProtectedRoutes>
          <ProtectedComponent />
        </ProtectedRoutes>
      </MemoryRouter>
    );

    expect(screen.getByText('Access Denied')).toBeInTheDocument();
    expect(screen.getByText('You do not have permission to access this page')).toBeInTheDocument();
    expect(screen.getByText('Go to Home')).toBeInTheDocument();
    
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });

  test('login button navigates to login page when clicked', async () => {
    useAuth.mockReturnValue({
      user: null
    });
    
    const navigateMock = jest.fn();
    jest.spyOn(require('react-router-dom'), 'useNavigate').mockImplementation(() => navigateMock);

    render(
      <MemoryRouter>
        <ProtectedRoutes>
          <ProtectedComponent />
        </ProtectedRoutes>
      </MemoryRouter>
    );

    const loginButton = screen.getByText('Log In');
    fireEvent.click(loginButton);

    expect(loginButton).toBeDisabled();
    
    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith('/login');
    }, { timeout: 600 });
  });

  test('back button navigates to home page when clicked', async () => {
    useAuth.mockReturnValue({
      user: null
    });
    
    const navigateMock = jest.fn();
    jest.spyOn(require('react-router-dom'), 'useNavigate').mockImplementation(() => navigateMock);

    render(
      <MemoryRouter>
        <ProtectedRoutes>
          <ProtectedComponent />
        </ProtectedRoutes>
      </MemoryRouter>
    );

    const backButton = screen.getByText('Back to Home');
    fireEvent.click(backButton);
    
    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith('/');
    }, { timeout: 600 });
  });

  test('home button on access denied screen navigates to home page when clicked', () => {
    useAuth.mockReturnValue({
      user: { role: 'user' }
    });
    
    const navigateMock = jest.fn();
    jest.spyOn(require('react-router-dom'), 'useNavigate').mockImplementation(() => navigateMock);

    render(
      <MemoryRouter>
        <ProtectedRoutes>
          <ProtectedComponent />
        </ProtectedRoutes>
      </MemoryRouter>
    );

    const homeButton = screen.getByText('Go to Home');
    fireEvent.click(homeButton);
    
    expect(navigateMock).toHaveBeenCalledWith('/');
  });

  test('register link has correct href', () => {
    useAuth.mockReturnValue({
      user: null
    });

    render(
      <MemoryRouter>
        <ProtectedRoutes>
          <ProtectedComponent />
        </ProtectedRoutes>
      </MemoryRouter>
    );

    const registerLink = screen.getByText('Register now');
    expect(registerLink).toHaveAttribute('href', '/register');
  });

  test('translates text correctly using i18n', () => {
    useAuth.mockReturnValue({
      user: null
    });

    const customTMock = jest.fn((key, options) => {
      if (key === 'protectedRoutes.loginRequired.registerPrompt.end') {
        return `for just ${options.amount}`;
      }
      return key;
    });
    
    jest.spyOn(require('react-i18next'), 'useTranslation').mockImplementation(() => ({
      t: customTMock
    }));

    render(
      <MemoryRouter>
        <ProtectedRoutes>
          <ProtectedComponent />
        </ProtectedRoutes>
      </MemoryRouter>
    );

    expect(customTMock).toHaveBeenCalledWith(
      'protectedRoutes.loginRequired.registerPrompt.end', 
      expect.objectContaining({ amount: '2$' })
    );
  });
});