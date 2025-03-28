import { login } from '../../app/pages/login';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { saveTokenAndUserId } from '../../schema/authen';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
}));

// Mock saveTokenAndUserId
jest.mock('../../schema/authen', () => ({
  saveTokenAndUserId: jest.fn(),
}));

// Mock router và setError
const mockRouter = { push: jest.fn() };
const mockSetError = jest.fn();

describe('login', () => {
  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const testLogin = () => {
    describe('UTCID01 -> Đăng nhập thành công', () => {
      it('Đăng nhập với email và mật khẩu đúng', async () => {
        mockedAxios.post.mockResolvedValueOnce({
          data: { token: 'mockToken123' },
        });

        await login('test@example.com', 'correctpassword', mockRouter, mockSetError, 'UTCID01');

        expect(mockedAxios.post).toHaveBeenCalledWith(
          expect.any(String),
          { email: 'test@example.com', password: 'correctpassword' }
        );
        expect(AsyncStorage.setItem).toHaveBeenCalledWith('token', 'mockToken123');
        expect(saveTokenAndUserId).toHaveBeenCalledWith('mockToken123');
        expect(mockRouter.push).toHaveBeenCalledWith('/(tabs)/home');
        expect(mockSetError).not.toHaveBeenCalled();
      });
    });

    describe('UTCID02 -> Đăng nhập thất bại với mật khẩu sai', () => {
      it('Hiển thị lỗi khi mật khẩu sai', async () => {
        mockedAxios.post.mockRejectedValueOnce({
          response: { data: { message: 'Sai email hoặc mật khẩu!' } },
        });

        await login('test@example.com', 'incorrectpassword', mockRouter, mockSetError, 'UTCID02');

        expect(mockedAxios.post).toHaveBeenCalledWith(
          expect.any(String),
          { email: 'test@example.com', password: 'incorrectpassword' }
        );
        expect(console.error).toHaveBeenCalledWith(
          'Lỗi đăng nhập [UTCID02]:',
          { message: 'Sai email hoặc mật khẩu!' }
        );
        expect(mockSetError).toHaveBeenCalledWith('Sai email hoặc mật khẩu!');
        expect(mockRouter.push).not.toHaveBeenCalled();
      });
    });

    describe('UTCID03 -> Đăng nhập thất bại với email sai', () => {
      it('Hiển thị lỗi khi email không tồn tại', async () => {
        mockedAxios.post.mockRejectedValueOnce({
          response: { data: { message: 'Sai email hoặc mật khẩu!' } },
        });

        await login('test@examplee.com', 'correctpassword', mockRouter, mockSetError, 'UTCID03');

        expect(mockedAxios.post).toHaveBeenCalledWith(
          expect.any(String),
          { email: 'test@examplee.com', password: 'correctpassword' }
        );
        expect(console.error).toHaveBeenCalledWith(
          'Lỗi đăng nhập [UTCID03]:',
          { message: 'Sai email hoặc mật khẩu!' }
        );
        expect(mockSetError).toHaveBeenCalledWith('Sai email hoặc mật khẩu!');
        expect(mockRouter.push).not.toHaveBeenCalled();
      });
    });

    describe('UTCID04 -> Đăng nhập với email và mật khẩu rỗng', () => {
      it('Hiển thị lỗi khi không nhập email và mật khẩu', async () => {
        await login('', '', mockRouter, mockSetError, 'UTCID04');

        expect(mockedAxios.post).not.toHaveBeenCalled();
        expect(console.error).toHaveBeenCalledWith(
          'Lỗi đăng nhập [UTCID04]:',
          'Vui lòng nhập email hợp lệ!'
        );
        expect(mockSetError).toHaveBeenCalledWith('Vui lòng nhập email hợp lệ!');
        expect(mockRouter.push).not.toHaveBeenCalled();
      });
    });

    describe('UTCID05 -> Đăng nhập với email và mật khẩu dài hợp lệ', () => {
      it('Đăng nhập thành công với email và mật khẩu dài', async () => {
        mockedAxios.post.mockResolvedValueOnce({
          data: { token: 'mockToken456' },
        });

        const longEmail = 'very.long.email.address.for.testing@example.com';
        const longPassword = 'thisisaverylongpassword123';

        await login(longEmail, longPassword, mockRouter, mockSetError, 'UTCID05');

        expect(mockedAxios.post).toHaveBeenCalledWith(
          expect.any(String),
          { email: longEmail, password: longPassword }
        );
        expect(AsyncStorage.setItem).toHaveBeenCalledWith('token', 'mockToken456');
        expect(saveTokenAndUserId).toHaveBeenCalledWith('mockToken456');
        expect(mockRouter.push).toHaveBeenCalledWith('/(tabs)/home');
        expect(mockSetError).not.toHaveBeenCalled();
      });
    });

    describe('UTCID06 -> Đăng nhập thất bại do lỗi mạng', () => {
      it('Hiển thị lỗi mặc định khi API không phản hồi', async () => {
        mockedAxios.post.mockRejectedValueOnce(new Error('Network Error'));

        await login('test@example.com', 'correctpassword', mockRouter, mockSetError, 'UTCID06');

        expect(mockedAxios.post).toHaveBeenCalledWith(
          expect.any(String),
          { email: 'test@example.com', password: 'correctpassword' }
        );
        expect(console.error).toHaveBeenCalledWith(
          'Lỗi đăng nhập [UTCID06]:',
          'Network Error'
        );
        expect(mockSetError).toHaveBeenCalledWith('Sai email hoặc mật khẩu!');
        expect(mockRouter.push).not.toHaveBeenCalled();
      });
    });

    describe('UTCID07 -> Đăng nhập với email không hợp lệ (thiếu @)', () => {
      it('Hiển thị lỗi khi email không đúng định dạng', async () => {
        await login('testexample.com', 'correctpassword', mockRouter, mockSetError, 'UTCID07');

        expect(mockedAxios.post).not.toHaveBeenCalled();
        expect(console.error).toHaveBeenCalledWith(
          'Lỗi đăng nhập [UTCID07]:',
          'Vui lòng nhập email hợp lệ!'
        );
        expect(mockSetError).toHaveBeenCalledWith('Vui lòng nhập email hợp lệ!');
        expect(mockRouter.push).not.toHaveBeenCalled();
      });
    });

    describe('UTCID08 -> Đăng nhập thất bại do lỗi server (500)', () => {
      it('Hiển thị lỗi khi server trả về mã lỗi 500', async () => {
        mockedAxios.post.mockRejectedValueOnce({
          response: { status: 500, data: { message: 'Internal Server Error' } },
        });

        await login('test@example.com', 'correctpassword', mockRouter, mockSetError, 'UTCID08');

        expect(mockedAxios.post).toHaveBeenCalledWith(
          expect.any(String),
          { email: 'test@example.com', password: 'correctpassword' }
        );
        expect(console.error).toHaveBeenCalledWith(
          'Lỗi đăng nhập [UTCID08]:',
          { message: 'Internal Server Error' }
        );
        expect(mockSetError).toHaveBeenCalledWith('Internal Server Error');
        expect(mockRouter.push).not.toHaveBeenCalled();
      });
    });

    describe('UTCID09 -> Đăng nhập với email và mật khẩu độ dài tối đa', () => {
      it('Đăng nhập thành công với email và mật khẩu 256 ký tự', async () => {
        mockedAxios.post.mockResolvedValueOnce({
          data: { token: 'mockToken789' },
        });

        const maxEmail = `${'a'.repeat(243)}@example.com`;
        const maxPassword = 'a'.repeat(256);

        await login(maxEmail, maxPassword, mockRouter, mockSetError, 'UTCID09');

        expect(mockedAxios.post).toHaveBeenCalledWith(
          expect.any(String),
          { email: maxEmail, password: maxPassword }
        );
        expect(AsyncStorage.setItem).toHaveBeenCalledWith('token', 'mockToken789');
        expect(saveTokenAndUserId).toHaveBeenCalledWith('mockToken789');
        expect(mockRouter.push).toHaveBeenCalledWith('/(tabs)/home');
        expect(mockSetError).not.toHaveBeenCalled();
      });
    });

    describe('UTCID10 -> Đăng nhập với mật khẩu ngắn', () => {
      it('Mật khẩu phải có ít nhất 6 ký tự và nhỏ hơn 256 ký tự!', async () => {
        await login('test@example.com', 'short', mockRouter, mockSetError, 'UTCID10');

        expect(mockedAxios.post).not.toHaveBeenCalled();
        expect(console.error).toHaveBeenCalledWith(
          'Lỗi đăng nhập [UTCID10]:',
          'Mật khẩu phải có ít nhất 6 ký tự và nhỏ hơn 256 ký tự!'
        );
        expect(mockSetError).toHaveBeenCalledWith('Mật khẩu phải có ít nhất 6 ký tự và nhỏ hơn 256 ký tự!');
        expect(mockRouter.push).not.toHaveBeenCalled();
      });
    });
  };
  testLogin();
});