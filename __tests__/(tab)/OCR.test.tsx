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

mockFetchUserId.mockResolvedValue('test-user-id');

describe('ScanScreen', () => {
  it('hiển thị màn hình tải ban đầu', () => {
    const { getByTestId } = render(<ScanScreen />);
    expect(getByTestId('loading-screen')).toBeTruthy();
  });

  it('yêu cầu quyền truy cập camera khi chưa được cấp', async () => {
    const mockRequestPermission = jest.fn();
    jest.spyOn(require('expo-camera'), 'useCameraPermissions').mockReturnValue([{ granted: false }, mockRequestPermission]);

    const { getByTestId } = render(<ScanScreen />);
    expect(getByTestId('camera-permission-screen')).toBeTruthy();

    fireEvent.press(getByTestId('grant-permission-button'));
    expect(mockRequestPermission).toHaveBeenCalled();
  });

//   it('hiển thị yêu cầu đăng nhập nếu userId là null', async () => {
//     mockFetchUserId.mockResolvedValue(null);
  
//     const { getByTestId, queryByTestId, findByTestId } = render(<ScanScreen />);
  
//     // Chờ cho loading-screen biến mất trước
//     await waitFor(() => expect(queryByTestId('loading-screen')).toBeNull());
  
//     // Sau khi loading kết thúc, kiểm tra login-required-screen
//     expect(await findByTestId('login-required-screen')).toBeTruthy();
//   });
  
  
  it('chụp ảnh và tải lên', async () => {
    const mockTakePictureAsync = jest.fn().mockResolvedValue({ uri: 'test-uri' });
    jest.spyOn(CameraView.prototype, 'takePictureAsync').mockImplementation(mockTakePictureAsync);
    mockUploadPhoto.mockResolvedValue({ data: { type: 'expense', category: 'food', amount: 100000 } });

    const { getByTestId } = render(<ScanScreen />);
    fireEvent.press(getByTestId('capture-button'));
    await waitFor(() => expect(mockTakePictureAsync).toHaveBeenCalled());
    await waitFor(() => expect(mockUploadPhoto).toHaveBeenCalledWith('test-uri', 'test-user-id'));
  });

  it('chọn ảnh từ thư viện và tải lên', async () => {
    (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({ canceled: false, assets: [{ uri: 'gallery-uri' }] });
    mockUploadPhoto.mockResolvedValue({ data: { type: 'expense', category: 'food', amount: 100000 } });

    const { getByTestId } = render(<ScanScreen />);
    fireEvent.press(getByTestId('gallery-button'));
    await waitFor(() => expect(mockUploadPhoto).toHaveBeenCalledWith('gallery-uri', 'test-user-id'));
  });

  it('chuyển đổi hướng camera', () => {
    const { getByTestId } = render(<ScanScreen />);
    fireEvent.press(getByTestId('flip-camera-button'));
    fireEvent.press(getByTestId('flip-camera-button'));
  });

  it('hiển thị dữ liệu giao dịch sau khi tải lên thành công', async () => {
    mockUploadPhoto.mockResolvedValue({
      data: { type: 'expense', category: 'food', amount: 100000, items: [{ productName: 'Pizza', quantity: 1, price: 100000 }] }
    });

    const { getByTestId, getByText } = render(<ScanScreen />);
    fireEvent.press(getByTestId('capture-button'));
    await waitFor(() => expect(getByText('Loại: expense')).toBeTruthy());
    await waitFor(() => expect(getByText('Danh mục: food')).toBeTruthy());
  });
});
