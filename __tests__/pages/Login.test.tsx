import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { act } from 'react-test-renderer';
import LoginScreen from '../../app/pages/login';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ExpoRouter from 'expo-router';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
}));

// Mock expo-router
jest.mock('expo-router');
const mockUseRouter = ExpoRouter.useRouter as jest.Mock;

describe('LoginScreen', () => {
  const mockRouter = { push: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue(mockRouter);
  });

  it('calls login function when Login button is pressed', async () => {
    const { getByPlaceholderText, getByRole } = render(<LoginScreen />);

    fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'correctpassword');

    await act(async () => {
      fireEvent.press(getByRole('button', { name: 'Login' }));
    });

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.any(String),
        {
          email: 'test@example.com',
          password: 'correctpassword',
        }
      );
    });
  });

  it('saves token to AsyncStorage and navigates to home on successful login', async () => {
    const { getByPlaceholderText, getByRole } = render(<LoginScreen />);

    mockedAxios.post.mockResolvedValueOnce({
      data: {
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjM0NTY3ODkwIn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
      }
    });

    fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'correctpassword');

    await act(async () => {
      fireEvent.press(getByRole('button', { name: 'Login' }));
    });

    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'token',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjM0NTY3ODkwIn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
      );
      expect(mockRouter.push).toHaveBeenCalledWith('/(tabs)/home');
    });
  });

  it('navigates to register page when Go to Register link is pressed', async () => {
    const { getByTestId, debug } = render(<LoginScreen />);
  
    debug();  
  
    const link = getByTestId('go-to-register-link');  
    expect(link).toHaveProp('href', '/pages/register');
  });
});