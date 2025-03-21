// import React from 'react';
// import { render, fireEvent, waitFor } from '@testing-library/react-native';
// import BudgetScreen from '../../app/(tabs)/BudgetScreen';
// import axios from 'axios';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { BACKEND_URL } from '../../config';

// jest.mock('axios');
// jest.mock('@react-native-async-storage/async-storage');

// const mockGetItem = AsyncStorage.getItem as jest.Mock;
// const mockPost = axios.post as jest.Mock;
// const mockGet = axios.get as jest.Mock;

// describe('BudgetScreen', () => {
//   beforeEach(() => {
//     jest.clearAllMocks();
//   });

//   it('hiển thị màn hình với tiêu đề và ô nhập ngân sách', () => {
//     const { getByTestId } = render(<BudgetScreen />);
//     expect(getByTestId('budget-title')).toBeTruthy();
//     expect(getByTestId('budget-input')).toBeTruthy();
//     expect(getByTestId('budget-submit-button')).toBeTruthy();
//   });

//   it('lấy ngân sách hiện tại khi userId có sẵn', async () => {
//     mockGetItem.mockResolvedValue('test-user-id');
//     mockGet.mockResolvedValue({ data: { budget: 500000 } });
    
//     const { getByTestId, getByText } = render(<BudgetScreen />);
//     await waitFor(() => expect(getByText('Ngân sách hiện tại: 500,000 đ')).toBeTruthy());
//   });

//   it('hiển thị lỗi nếu userId không tồn tại', async () => {
//     mockGetItem.mockResolvedValue(null);
//     const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

//     render(<BudgetScreen />);
//     await waitFor(() => expect(consoleErrorSpy).toHaveBeenCalled());
//     consoleErrorSpy.mockRestore();
//   });

//   it('lưu ngân sách thành công', async () => {
//     mockGetItem.mockResolvedValue('test-user-id');
//     mockPost.mockResolvedValue({});
    
//     const { getByTestId } = render(<BudgetScreen />);
//     fireEvent.changeText(getByTestId('budget-input'), '1000000');
//     fireEvent.press(getByTestId('budget-submit-button'));
    
//     await waitFor(() => expect(mockPost).toHaveBeenCalledWith(`${BACKEND_URL}/budget`, {
//       userId: 'test-user-id',
//       budget: 1000000,
//     }));
//   });

//   it('hiển thị cảnh báo khi nhập sai ngân sách', async () => {
//     const { getByTestId, getByText } = render(<BudgetScreen />);
//     fireEvent.changeText(getByTestId('budget-input'), '-5000');
//     fireEvent.press(getByTestId('budget-submit-button'));
//     await waitFor(() => expect(getByText('Vui lòng nhập số tiền hợp lệ cho ngân sách!')).toBeTruthy());
//   });
// });
