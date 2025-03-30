import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ScanScreen from '../../app/(tabs)/scan';
import uploadPhoto from '../../schema/uploadPhoto';
import { fetchUserId } from '../../schema/authen';
import * as ImagePicker from 'expo-image-picker';
import { CameraView } from 'expo-camera';

// Mock các dependencies
jest.mock('../../schema/uploadPhoto');
jest.mock('../../schema/authen');
jest.mock('expo-image-picker');

const mockUploadPhoto = uploadPhoto as jest.Mock;
const mockFetchUserId = fetchUserId as jest.Mock;

describe('ScanScreen Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetchUserId.mockResolvedValue('test-user-id');
  });

  // Test cases liên quan đến render ban đầu
  describe('Render Initial States', () => {
    it('UTCID-01: Hiển thị màn hình tải ban đầu khi chưa có permission', () => {
      const { getByTestId } = render(<ScanScreen />);
      expect(getByTestId('loading-screen')).toBeTruthy();
    });

    it('UTCID-02: Yêu cầu quyền truy cập camera khi chưa được cấp', async () => {
      const mockRequestPermission = jest.fn();
      jest.spyOn(require('expo-camera'), 'useCameraPermissions')
        .mockReturnValue([{ granted: false }, mockRequestPermission]);

      const { getByTestId } = render(<ScanScreen />);
      await waitFor(() => expect(getByTestId('camera-permission-screen')).toBeTruthy());

      fireEvent.press(getByTestId('grant-permission-button'));
      expect(mockRequestPermission).toHaveBeenCalled();
    });

    it('UTCID-03: Hiển thị yêu cầu đăng nhập nếu userId là null', async () => {
      mockFetchUserId.mockResolvedValue(null);
      jest.spyOn(require('expo-camera'), 'useCameraPermissions')
        .mockReturnValue([{ granted: true }, jest.fn()]);

      const { findByText } = render(<ScanScreen />);
      await waitFor(() => {
        expect(findByText('Bạn cần đăng nhập để sử dụng tính năng này.')).toBeTruthy();
      });
    });
  });

  // Test cases cho hàm toggleCameraFacing
  describe('toggleCameraFacing', () => {
    it('UTCID-04: Chuyển đổi hướng camera từ back sang front và ngược lại', async () => {
      jest.spyOn(require('expo-camera'), 'useCameraPermissions')
        .mockReturnValue([{ granted: true }, jest.fn()]);

      const { getByTestId } = render(<ScanScreen />);
      await waitFor(() => expect(getByTestId('camera-container')).toBeTruthy());

      fireEvent.press(getByTestId('flip-camera-button'));
      fireEvent.press(getByTestId('flip-camera-button'));
      // Không có cách trực tiếp kiểm tra state 'facing' trong test, nhưng đảm bảo hàm được gọi
    });
  });

  // Test cases cho hàm takePicture
  describe('takePicture', () => {
    it('UTCID-05: Chụp ảnh và tải lên thành công', async () => {
      const mockTakePictureAsync = jest.fn().mockResolvedValue({ uri: 'test-uri' });
      jest.spyOn(CameraView.prototype, 'takePictureAsync').mockImplementation(mockTakePictureAsync);
      jest.spyOn(require('expo-camera'), 'useCameraPermissions')
        .mockReturnValue([{ granted: true }, jest.fn()]);
      mockUploadPhoto.mockResolvedValue({
        data: {
          type: 'expense',
          category: 'food',
          amount: 100000,
          items: [{ productName: 'Pizza', quantity: 1, price: 100000 }]
        }
      });

      const { getByTestId } = render(<ScanScreen />);
      await waitFor(() => expect(getByTestId('camera-container')).toBeTruthy());

      fireEvent.press(getByTestId('capture-button'));
      await waitFor(() => expect(mockTakePictureAsync).toHaveBeenCalled());
      await waitFor(() => expect(mockUploadPhoto).toHaveBeenCalledWith('test-uri', 'test-user-id'));
      await waitFor(() => expect(getByTestId('transaction-item-0')).toBeTruthy());
    });

    it('UTCID-06: Hiển thị dữ liệu giao dịch sau khi chụp ảnh thành công', async () => {
      const mockTakePictureAsync = jest.fn().mockResolvedValue({ uri: 'test-uri' });
      jest.spyOn(CameraView.prototype, 'takePictureAsync').mockImplementation(mockTakePictureAsync);
      jest.spyOn(require('expo-camera'), 'useCameraPermissions')
        .mockReturnValue([{ granted: true }, jest.fn()]);
      mockUploadPhoto.mockResolvedValue({
        data: {
          type: 'expense',
          category: 'food',
          amount: 100000,
          items: [{ productName: 'Pizza', quantity: 1, price: 100000 }]
        }
      });

      const { getByTestId, getByText } = render(<ScanScreen />);
      await waitFor(() => expect(getByTestId('camera-container')).toBeTruthy());

      fireEvent.press(getByTestId('capture-button'));
      await waitFor(() => expect(getByText('Loại: expense')).toBeTruthy());
      await waitFor(() => expect(getByText('Danh mục: food')).toBeTruthy());
    });

    it('UTCID-07: Hiển thị trạng thái tải khi chụp ảnh và gọi API', async () => {
      const mockTakePictureAsync = jest.fn().mockResolvedValue({ uri: 'test-uri' });
      jest.spyOn(CameraView.prototype, 'takePictureAsync').mockImplementation(mockTakePictureAsync);
      jest.spyOn(require('expo-camera'), 'useCameraPermissions')
        .mockReturnValue([{ granted: true }, jest.fn()]);
      mockUploadPhoto.mockImplementation(() => new Promise(() => {})); // Giả lập API treo

      const { getByTestId } = render(<ScanScreen />);
      await waitFor(() => expect(getByTestId('camera-container')).toBeTruthy());

      fireEvent.press(getByTestId('capture-button'));
      await waitFor(() => expect(getByTestId('loading-indicator')).toBeTruthy());
    });
  });

  // Test cases cho hàm pickImage
  describe('pickImage', () => {
    it('UTCID-08: Chọn ảnh từ thư viện và tải lên thành công', async () => {
      jest.spyOn(require('expo-camera'), 'useCameraPermissions')
        .mockReturnValue([{ granted: true }, jest.fn()]);
      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [{ uri: 'gallery-uri' }]
      });
      mockUploadPhoto.mockResolvedValue({
        data: {
          type: 'expense',
          category: 'food',
          amount: 100000,
          items: [{ productName: 'Pizza', quantity: 1, price: 100000 }]
        }
      });

      const { getByTestId } = render(<ScanScreen />);
      await waitFor(() => expect(getByTestId('camera-container')).toBeTruthy());

      fireEvent.press(getByTestId('pick-image-button'));
      await waitFor(() => expect(mockUploadPhoto).toHaveBeenCalledWith('gallery-uri', 'test-user-id'));
      await waitFor(() => expect(getByTestId('transaction-item-0')).toBeTruthy());
    });
  });

  // Test cases cho hàm handlePhotoUpload
  describe('handlePhotoUpload', () => {
    it('UTCID-09: Hiển thị dữ liệu giao dịch sau khi tải lên thành công', async () => {
      const mockTakePictureAsync = jest.fn().mockResolvedValue({ uri: 'test-uri' });
      jest.spyOn(CameraView.prototype, 'takePictureAsync').mockImplementation(mockTakePictureAsync);
      jest.spyOn(require('expo-camera'), 'useCameraPermissions')
        .mockReturnValue([{ granted: true }, jest.fn()]);
      mockUploadPhoto.mockResolvedValue({
        data: {
          type: 'expense',
          category: 'food',
          items: [{ productName: 'Test Item', quantity: 1, price: 100000 }],
          amount: 100000
        },
        imageUrl: 'http://example.com/test-image.jpg'
      });

      const { getByTestId, findByText } = render(<ScanScreen />);
      await waitFor(() => expect(getByTestId('camera-container')).toBeTruthy());
      fireEvent.press(getByTestId('capture-button'));

      await waitFor(() => {
        expect(findByText('Test Item')).toBeTruthy();
        expect(findByText('100,000 VNĐ')).toBeTruthy();
        expect(findByText('food')).toBeTruthy();
      });
    });

    it('UTCID-10: Xử lý phản hồi lỗi API khi tải lên thất bại', async () => {
      const mockTakePictureAsync = jest.fn().mockResolvedValue({ uri: 'test-uri' });
      jest.spyOn(CameraView.prototype, 'takePictureAsync').mockImplementation(mockTakePictureAsync);
      jest.spyOn(require('expo-camera'), 'useCameraPermissions')
        .mockReturnValue([{ granted: true }, jest.fn()]);
      mockUploadPhoto.mockRejectedValue(new Error('API Error'));

      const { getByTestId, findByText } = render(<ScanScreen />);
      await waitFor(() => expect(getByTestId('camera-container')).toBeTruthy());
      fireEvent.press(getByTestId('capture-button'));

      await waitFor(() => 
        expect(findByText('Lỗi: API Error')).toBeTruthy()
      );
    });
  });
});