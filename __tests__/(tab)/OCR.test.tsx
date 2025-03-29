import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ScanScreen from '../../app/(tabs)/scan';
import uploadPhoto from '../../schema/uploadPhoto';
import { fetchUserId } from '../../schema/authen';
import * as ImagePicker from 'expo-image-picker';
import { CameraView } from 'expo-camera';

jest.mock('../../schema/uploadPhoto');
jest.mock('../../schema/authen');
jest.mock('expo-image-picker');

const mockUploadPhoto = uploadPhoto as jest.Mock;
const mockFetchUserId = fetchUserId as jest.Mock;

describe('ScanScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetchUserId.mockResolvedValue('test-user-id');
  });

  it('hiển thị màn hình tải ban đầu', () => {
    const { getByTestId } = render(<ScanScreen />);
    expect(getByTestId('loading-screen')).toBeTruthy();
  });

  it('yêu cầu quyền truy cập camera khi chưa được cấp', async () => {
    const mockRequestPermission = jest.fn();
    jest.spyOn(require('expo-camera'), 'useCameraPermissions')
      .mockReturnValue([{ granted: false }, mockRequestPermission]);

    const { getByTestId } = render(<ScanScreen />);
    await waitFor(() => expect(getByTestId('camera-permission-screen')).toBeTruthy());

    fireEvent.press(getByTestId('grant-permission-button'));
    expect(mockRequestPermission).toHaveBeenCalled();
  });

  it('hiển thị yêu cầu đăng nhập nếu userId là null', async () => {
    mockFetchUserId.mockResolvedValue(null);
    jest.spyOn(require('expo-camera'), 'useCameraPermissions')
      .mockReturnValue([{ granted: true }, jest.fn()]);

    const { findByText } = render(<ScanScreen />);
    await waitFor(() => {
      expect(findByText('Bạn cần đăng nhập để sử dụng tính năng này.')).toBeTruthy();
    });
  });

  it('chụp ảnh và tải lên', async () => {
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

  it('chọn ảnh từ thư viện và tải lên', async () => {
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

  it('chuyển đổi hướng camera', async () => {
    jest.spyOn(require('expo-camera'), 'useCameraPermissions')
      .mockReturnValue([{ granted: true }, jest.fn()]);

    const { getByTestId } = render(<ScanScreen />);
    await waitFor(() => expect(getByTestId('camera-container')).toBeTruthy());

    fireEvent.press(getByTestId('flip-camera-button'));
    fireEvent.press(getByTestId('flip-camera-button'));
  });

  it('hiển thị dữ liệu giao dịch sau khi tải lên thành công', async () => {
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
});


describe('ScanScreen Data Handling', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetchUserId.mockResolvedValue('test-user-id');
  });

  it('hiển thị dữ liệu giao dịch sau khi tải lên thành công', async () => {
    const mockTransactionData = {
      type: 'expense',
      category: 'food',
      items: [{ productName: 'Test Item', quantity: 1, price: 100000 }],
      amount: 100000
    };
    
    mockUploadPhoto.mockResolvedValue({
      data: mockTransactionData,
      imageUrl: 'http://example.com/test-image.jpg'
    });

    const { getByTestId, findByText } = render(<ScanScreen />);
await waitFor(() => expect(getByTestId('camera-container')).toBeTruthy());
fireEvent.press(getByTestId('capture-button'));
    
    await waitFor(() => {
      expect(findByText('Test Item')).toBeTruthy();
      expect(findByText('100,000 VND')).toBeTruthy();
      expect(findByText('food')).toBeTruthy();
    });
  });

  it('xử lý phản hồi lỗi API', async () => {
    mockUploadPhoto.mockRejectedValue(new Error('API Error'));
    
    const { getByTestId, findByText } = render(<ScanScreen />);
await waitFor(() => expect(getByTestId('camera-container')).toBeTruthy());
fireEvent.press(getByTestId('capture-button'));
    
    await waitFor(() => 
      expect(findByText('Lỗi: API Error')).toBeTruthy()
    );
  });

  it('hiển thị trạng thái tải trong khi gọi API', async () => {
    mockUploadPhoto.mockImplementation(() => new Promise(() => {}));
    
    const { getByTestId } = render(<ScanScreen />);
await waitFor(() => expect(getByTestId('camera-container')).toBeTruthy());
fireEvent.press(getByTestId('capture-button'));
    
    expect(getByTestId('loading-indicator')).toBeTruthy();
  });
});