import { register } from '../../app/pages/register';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock setError và setSuccessMessage
const mockSetError = jest.fn();
const mockSetSuccessMessage = jest.fn();

describe('Register Function', () => {
  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('UTCID01 -> Đăng ký thành công', () => {
    it('Đăng ký với thông tin hợp lệ', async () => {
      mockedAxios.post.mockResolvedValueOnce({
        status: 200,
        data: { message: 'User registered' },
      });

      await register('jeyley', 'test@example.com', 'password123', mockSetError, mockSetSuccessMessage, 'UTCID01');

      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.any(String),
        { name: 'jeyley', email: 'test@example.com', password: 'password123' }
      );
      expect(mockSetSuccessMessage).toHaveBeenCalledWith('Registration successful!');
      expect(mockSetError).not.toHaveBeenCalled();
    });
  });

  describe('UTCID02 -> Đăng ký thất bại - Email đã tồn tại', () => {
    it('Hiển thị lỗi khi email đã được đăng ký', async () => {
      mockedAxios.post.mockRejectedValueOnce({
        response: { data: { message: 'Email already exists' } },
      });

      await register('jeyley', 'test@example.com', 'password123', mockSetError, mockSetSuccessMessage, 'UTCID02');

      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.any(String),
        { name: 'jeyley', email: 'test@example.com', password: 'password123' }
      );
      expect(console.error).toHaveBeenCalledWith(
        'Lỗi đăng ký [UTCID02]:',
        expect.any(Object)
      );
      expect(mockSetError).toHaveBeenCalledWith('Registration failed');
      expect(mockSetSuccessMessage).not.toHaveBeenCalled();
    });
  });

  describe('UTCID03 -> Đăng ký thất bại - Không nhập email', () => {
    it('Hiển thị lỗi khi email rỗng', async () => {
      await register('jeyley', '', 'password123', mockSetError, mockSetSuccessMessage, 'UTCID03');

      expect(mockedAxios.post).not.toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith(
        'Lỗi đăng ký [UTCID03]:',
        'Vui lòng nhập email hợp lệ!'
      );
      expect(mockSetError).toHaveBeenCalledWith('Vui lòng nhập email hợp lệ!');
      expect(mockSetSuccessMessage).not.toHaveBeenCalled();
    });
  });

  describe('UTCID04 -> Đăng ký thất bại - Không nhập mật khẩu', () => {
    it('Hiển thị lỗi khi mật khẩu rỗng', async () => {
      await register('jeyley', 'test@example.com', '', mockSetError, mockSetSuccessMessage, 'UTCID04');

      expect(mockedAxios.post).not.toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith(
        'Lỗi đăng ký [UTCID04]:',
        'Mật khẩu phải có ít nhất 6 ký tự!'
      );
      expect(mockSetError).toHaveBeenCalledWith('Mật khẩu phải có ít nhất 6 ký tự!');
      expect(mockSetSuccessMessage).not.toHaveBeenCalled();
    });
  });

  describe('UTCID05 -> Đăng ký thất bại - Không nhập tên', () => {
    it('Hiển thị lỗi khi tên rỗng', async () => {
      await register('', 'test@example.com', 'password123', mockSetError, mockSetSuccessMessage, 'UTCID05');

      expect(mockedAxios.post).not.toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith(
        'Lỗi đăng ký [UTCID05]:',
        'Vui lòng nhập tên hợp lệ!'
      );
      expect(mockSetError).toHaveBeenCalledWith('Vui lòng nhập tên hợp lệ!');
      expect(mockSetSuccessMessage).not.toHaveBeenCalled();
    });
  });

  describe('UTCID06 -> Đăng ký thất bại - Email không hợp lệ', () => {
    it('Hiển thị lỗi khi email thiếu @', async () => {
      await register('jeyley', 'testexample.com', 'password123', mockSetError, mockSetSuccessMessage, 'UTCID06');

      expect(mockedAxios.post).not.toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith(
        'Lỗi đăng ký [UTCID06]:',
        'Vui lòng nhập email hợp lệ!'
      );
      expect(mockSetError).toHaveBeenCalledWith('Vui lòng nhập email hợp lệ!');
      expect(mockSetSuccessMessage).not.toHaveBeenCalled();
    });
  });

  describe('UTCID07 -> Đăng ký thất bại - Mật khẩu ngắn', () => {
    it('Hiển thị lỗi khi mật khẩu dưới 6 ký tự', async () => {
      await register('jeyley', 'test@example.com', 'pass', mockSetError, mockSetSuccessMessage, 'UTCID07');

      expect(mockedAxios.post).not.toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith(
        'Lỗi đăng ký [UTCID07]:',
        'Mật khẩu phải có ít nhất 6 ký tự!'
      );
      expect(mockSetError).toHaveBeenCalledWith('Mật khẩu phải có ít nhất 6 ký tự!');
      expect(mockSetSuccessMessage).not.toHaveBeenCalled();
    });
  });

  describe('UTCID08 -> Đăng ký thành công - Tên, email, mật khẩu dài', () => {
    it('Đăng ký với thông tin dài hợp lệ', async () => {
      mockedAxios.post.mockResolvedValueOnce({
        status: 200,
        data: { message: 'User registered' },
      });

      const longName = 'jeyley'.repeat(10); // 40 ký tự
      const longEmail = 'very.long.email.address.for.testing@example.com';
      const longPassword = 'password123'.repeat(5); // 60 ký tự

      await register(longName, longEmail, longPassword, mockSetError, mockSetSuccessMessage, 'UTCID08');

      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.any(String),
        { name: longName, email: longEmail, password: longPassword }
      );
      expect(mockSetSuccessMessage).toHaveBeenCalledWith('Registration successful!');
      expect(mockSetError).not.toHaveBeenCalled();
    });
  });

  describe('UTCID09 -> Đăng ký thất bại - Lỗi server', () => {
    it('Hiển thị lỗi khi server trả về mã lỗi 500', async () => {
      mockedAxios.post.mockRejectedValueOnce({
        response: { status: 500, data: { message: 'Internal Server Error' } },
      });

      await register('jeyley', 'test@example.com', 'password123', mockSetError, mockSetSuccessMessage, 'UTCID09');

      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.any(String),
        { name: 'jeyley', email: 'test@example.com', password: 'password123' }
      );
      expect(console.error).toHaveBeenCalledWith(
        'Lỗi đăng ký [UTCID09]:',
        expect.any(Object)
      );
      expect(mockSetError).toHaveBeenCalledWith('Registration failed');
      expect(mockSetSuccessMessage).not.toHaveBeenCalled();
    });
  });
});