import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import RegisterScreen from '../../app/pages/register';
import axios from 'axios';
import * as ExpoRouter from 'expo-router';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock expo-router
jest.mock('expo-router', () => ({
  ...jest.requireActual('expo-router'),
  useRouter: jest.fn(),
}));

const logTestResult = (testName: string, passed: boolean) => {
    console.log(`✅ ${testName}: ${passed ? "PASSED" : "FAILED"}`);
  };
const mockUseRouter = ExpoRouter.useRouter as jest.Mock;

describe('Đăng kí tài khoản',()=>{
    describe('RegisterScreen', () => {
        const mockRouter = { push: jest.fn() };
      
        beforeEach(() => {
          jest.clearAllMocks();
          mockUseRouter.mockReturnValue(mockRouter);
        });
        const logTestResult = (testName: string, passed: boolean) => {
            console.log(`✅ ${testName}: ${passed ? "PASSED" : "FAILED"}`);
          };
          it('Kiểm tra trạng thái', () => {
            try {
              const { getByPlaceholderText, getAllByText, getByRole, queryByText } = render(<RegisterScreen />);
            
              expect(getByPlaceholderText('Name')).toBeTruthy();
              expect(getByPlaceholderText('Email')).toBeTruthy();
              expect(getByPlaceholderText('Password')).toBeTruthy();
            
              expect(getByRole('button', { name: 'Register' })).toBeTruthy();
            
              expect(queryByText('Registration failed')).toBeNull();
              expect(queryByText('Registration successful!')).toBeNull();
              
              logTestResult("renders the Register screen correctly", true);
            } catch (error) {
              logTestResult("renders the Register screen correctly", false);
              throw error; 
            }
          });
          
      });
    describe('UTCID01 -> Email đã đăng kí', () => {
          const mockRouter = { push: jest.fn() };
          const mockUserData = {
              email: 'test@example.com',
              password: null 
            };
            
          beforeEach(() => {
            jest.clearAllMocks();
            mockUseRouter.mockReturnValue(mockRouter);
          });
        
          it('Register: Tài khoản đã tồn tại!', async () => {
            mockedAxios.post.mockRejectedValueOnce({
              response: { data: { message: 'Registration successful!' } },
            });
        
            const { getByPlaceholderText, getByRole, findByText } = render(<RegisterScreen />);
        
            fireEvent.changeText(getByPlaceholderText('Email'), mockUserData.email);
            fireEvent.changeText(getByPlaceholderText('Password'), 'correctpassword');
            fireEvent.changeText(getByPlaceholderText('Name'), 'a');
            await act(async () => {
              fireEvent.press(getByRole('button', { name: 'Register' }));
            });
        
            await waitFor(() => {
              expect(mockedAxios.post).toHaveBeenCalledWith(expect.any(String), {
                email: mockUserData.email,
                password: 'correctpassword',
                name: 'a',
              });
            });
          });
        });
     describe('UTCID02 -> Email chưa được đăng kí - đăng kí thành công', () => {
          const mockRouter = { push: jest.fn() };
          const mockUserData = {
              email: null,
              password: null, 
              name: null
            };
            
            beforeEach(() => {
              jest.clearAllMocks();
              mockUseRouter.mockReturnValue(mockRouter);
            });
        
          it('Register: Đăng kí tài khoản thành công!', async () => {
            mockedAxios.post.mockRejectedValueOnce({
              response: { data: { message: 'Registration successful!' } },
            });
        
            const { getByPlaceholderText, getByRole, findByText } = render(<RegisterScreen />);
        
            fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
            fireEvent.changeText(getByPlaceholderText('Password'), 'correctpassword');
            fireEvent.changeText(getByPlaceholderText('Name'), 'a');
            await act(async () => {
              fireEvent.press(getByRole('button', { name: 'Register' }));
            });
        
            await waitFor(() => {
              expect(mockedAxios.post).toHaveBeenCalledWith(expect.any(String), {
                email: 'test@example.com',
                password: 'correctpassword',
                name: 'a',
              });
            });
          });
        });
    describe('UTCID03 -> Email chưa được đăng kí - Không nhập email', () => {
            const mockRouter = { push: jest.fn() };
            const mockUserData = {
                email: null,
                password: null, 
                name: null
              };
              
              beforeEach(() => {
                jest.clearAllMocks();
                mockUseRouter.mockReturnValue(mockRouter);
              });
          
        it('Register: Đăng kí tài khoản không nhập email', async () => {
            mockedAxios.post.mockRejectedValueOnce({
              response: { data: { message: 'Registration failed' } },
            });
        
            const { getByPlaceholderText, getByRole, findByText } = render(<RegisterScreen />);
        
            fireEvent.changeText(getByPlaceholderText('Email'), '');
            fireEvent.changeText(getByPlaceholderText('Password'), 'correctpassword');
            fireEvent.changeText(getByPlaceholderText('Name'), 'a');
            await act(async () => {
              fireEvent.press(getByRole('button', { name: 'Register' }));
            });
        
            await waitFor(() => {
              expect(mockedAxios.post).toHaveBeenCalledWith(expect.any(String), {
                email: '',
                password: 'correctpassword',
                name: 'a',
              });
            });
        });
    });
    describe('UTCID04 -> Email chưa được đăng kí - đăng kí thất bại', () => {
        const mockRouter = { push: jest.fn() };
        const mockUserData = {
            email: null,
            password: null, 
            name: null
          };
          
          beforeEach(() => {
            jest.clearAllMocks();
            mockUseRouter.mockReturnValue(mockRouter);
          });
        it('Register: Đăng kí tài khoản không nhập mật khẩu', async () => {
            mockedAxios.post.mockRejectedValueOnce({
            response: { data: { message: 'Registration failed' } },
            });
        
            const { getByPlaceholderText, getByRole, findByText } = render(<RegisterScreen />);
        
            fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
            fireEvent.changeText(getByPlaceholderText('Password'), '');
            fireEvent.changeText(getByPlaceholderText('Name'), 'a');
            await act(async () => {
            fireEvent.press(getByRole('button', { name: 'Register' }));
            });
        
            await waitFor(() => {
            expect(mockedAxios.post).toHaveBeenCalledWith(expect.any(String), {
                email: 'test@example.com',
                password: '',
                name: 'a',
            });
            });
        });
    });
    describe('UTCID05 -> Email chưa được đăng kí - đăng kí thất bại', () => {
        const mockRouter = { push: jest.fn() };
        const mockUserData = {
            email: null,
            password: null, 
            name: null
          };
          
          beforeEach(() => {
            jest.clearAllMocks();
            mockUseRouter.mockReturnValue(mockRouter);
          });
          it('Register: Đăng kí tài khoản không nhập tên', async () => {
            mockedAxios.post.mockRejectedValueOnce({
              response: { data: { message: 'Registration failed' } },
            });
        
            const { getByPlaceholderText, getByRole, findByText } = render(<RegisterScreen />);
        
            fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
            fireEvent.changeText(getByPlaceholderText('Password'), 'correctpassword');
            fireEvent.changeText(getByPlaceholderText('Name'), '');
            await act(async () => {
              fireEvent.press(getByRole('button', { name: 'Register' }));
            });
        
            await waitFor(() => {
              expect(mockedAxios.post).toHaveBeenCalledWith(expect.any(String), {
                email: 'test@example.com',
                password: 'correctpassword',
                name: '',
              });
            });
        });
    });
});
