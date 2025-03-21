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

describe("Login",()=>{
  describe('UTCID01 -> Đăng nhập thành công', () => {
    const mockRouter = { push: jest.fn() };
    const mockUserData = {
      email: 'test@example.com',
      password: 'correctpassword'
    };
    
    mockedAxios.post.mockRejectedValueOnce({
      response: { data: { message: 'Sai email hoặc mật khẩu!' } },
    });
    beforeEach(() => {
      jest.clearAllMocks();
      mockUseRouter.mockReturnValue(mockRouter);
    });
  
    it('Login: Email Correct or PassWord Correct', async () => {
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
  });
  describe('UTCID02 -> Đăng nhập Mật khẩu sai', () => {
    const mockRouter = { push: jest.fn() };
    const mockUserData = {
      email: 'test@example.com',
      password: 'correctpassword'
    };
    mockedAxios.post.mockRejectedValueOnce({
      response: { data: { message: 'Sai email hoặc mật khẩu!' } },
    });
    beforeEach(() => {
      jest.clearAllMocks();
      mockUseRouter.mockReturnValue(mockRouter);
    });
    it('Đăng nhập thất bại với mật khẩu sai', async () => {
      const { getByPlaceholderText, getByRole, findByText } = render(<LoginScreen />);
    
      fireEvent.changeText(getByPlaceholderText('Email'), mockUserData.email);
      fireEvent.changeText(getByPlaceholderText('Password'), 'inCorrectPassWord'); 
    
      await act(async () => {
        fireEvent.press(getByRole('button', { name: 'Login' }));
      });
    
      await waitFor(() => {
        expect(mockedAxios.post).toHaveBeenCalledWith(expect.any(String), {
          email: mockUserData.email,
          password: 'inCorrectPassWord',
        });
      });
      expect(await findByText('Sai email hoặc mật khẩu!')).toBeTruthy();
    });
  });
  describe('UTCID03 -> Đăng nhập tài khoản sai', () => {
    const mockRouter = { push: jest.fn() };
    const mockUserData = {
      email: 'test@example.com',
      password: 'correctpassword'
    };
    
    mockedAxios.post.mockRejectedValueOnce({
      response: { data: { message: 'Sai email hoặc mật khẩu!' } },
    });
    beforeEach(() => {
      jest.clearAllMocks();
      mockUseRouter.mockReturnValue(mockRouter);
    });
  
    it('Đăng nhập thất bại với tài khoản sai', async () => {
      const { getByPlaceholderText, getByRole } = render(<LoginScreen />);
  
      fireEvent.changeText(getByPlaceholderText('Email'), 'test@examplee.com');
      fireEvent.changeText(getByPlaceholderText('Password'), 'correctpassword');
  
      await act(async () => {
        fireEvent.press(getByRole('button', { name: 'Login' }));
      });
  
      await waitFor(() => {
        expect(mockedAxios.post).toHaveBeenCalledWith(
          expect.any(String),
          {
            email: 'test@examplee.com',
            password: 'correctpassword',
          }
        );
      });
    });
    describe('Tài khoản không tồn tại', () => {
      const mockRouter = { push: jest.fn() };
      const mockUserData = {
        email: '',
        password: ''
      };
      
      mockedAxios.post.mockRejectedValueOnce({
        response: { data: { message: 'Sai email hoặc mật khẩu!' } },
      });
      beforeEach(() => {
        jest.clearAllMocks();
        mockUseRouter.mockReturnValue(mockRouter);
      });
    
      it('Login: Email Correct or PassWord Correct', async () => {
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
    });
  });
  describe('Token',() => {
    const mockRouter = { push: jest.fn() };
  
    it('Sever Pass', async () => {
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
  });
});