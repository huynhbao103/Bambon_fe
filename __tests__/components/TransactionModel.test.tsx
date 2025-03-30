import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { TransactionModal } from '../../app/components/TransactionModal';
import { Transaction, TransactionItem } from '../../app/types';
import { Alert } from 'react-native';

// Mock expo-font
jest.mock('expo-font', () => ({
  loadAsync: jest.fn(),
  isLoaded: jest.fn(() => true),
}));

// Mock FontAwesome
jest.mock('react-native-vector-icons/FontAwesome', () => 'Icon');

// Mock Ionicons với TypeScript
interface MockIoniconsProps {
  name?: string;
  size?: number;
  color?: string;
  [key: string]: any;
}

jest.mock('@expo/vector-icons', () => {
  const { View } = require('react-native');
  return {
    Ionicons: (props: MockIoniconsProps) => <View {...props} testID="mock-icon" />,
  };
});

// Mock Alert
jest.spyOn(Alert, 'alert').mockImplementation(jest.fn());

// Dữ liệu mock
const mockTransaction: Transaction = {
  _id: '1',
  date: '2025-03-24T10:00:00Z',
  category: 'Lương',
  amount: 5000000,
  type: 'income',
  items: [
    { productName: 'Tiền lương tháng 3', quantity: 1, price: 5000000 },
  ],
};

// Props với kiểu TransactionModalProps
const mockProps = {
  selectedTransaction: mockTransaction,
  isEditing: false,
  editedTransaction: mockTransaction,
  onClose: jest.fn(),
  onEdit: jest.fn(),
  onDelete: jest.fn((id: string) => {}),
  onSave: jest.fn(),
  onCancel: jest.fn(),
  setEditedTransaction: jest.fn((transaction: Transaction) => {}),
  addItem: jest.fn(),
  removeItem: jest.fn((index: number) => {}),
  updateItem: jest.fn((index: number, field: string, value: string | number) => {}),
};

// Thiết lập thời gian giả lập
beforeAll(() => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date('2025-03-24T00:00:00Z')); // Ngày hiện tại
});

afterAll(() => {
  jest.useRealTimers();
});

describe('TransactionModal Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('validateInput', () => {
    describe('UTCID-01 -> Kiểm tra lỗi khi nhập số tiền âm', () => {
      it('Hiển thị thông báo lỗi cho số tiền âm', async () => {
        const { getByPlaceholderText, getByText } = render(<TransactionModal {...mockProps} isEditing={true} />);
        fireEvent.changeText(getByPlaceholderText('Nhập số tiền'), '-1000');
        await waitFor(() => {
          expect(getByText('Giá trị không được âm')).toBeTruthy();
        });
      });
    });

    describe('UTCID-02 -> Kiểm tra lỗi khi tên sản phẩm quá 50 ký tự', () => {
      it('Hiển thị thông báo lỗi khi tên vượt quá giới hạn', async () => {
        const { getByPlaceholderText, getByText } = render(<TransactionModal {...mockProps} isEditing={true} />);
        fireEvent.changeText(getByPlaceholderText('Tên sản phẩm'), 'a'.repeat(51));
      });
    });

    describe('UTCID-03 -> Kiểm tra lỗi khi giá trị vượt quá 100 tỷ', () => {
      it('Hiển thị thông báo lỗi khi số tiền quá lớn', async () => {
        const { getByPlaceholderText, getByText } = render(<TransactionModal {...mockProps} isEditing={true} />);
        fireEvent.changeText(getByPlaceholderText('Nhập số tiền'), '100000000001');
        await waitFor(() => {
          expect(getByText('Giá trị không được quá 100 tỷ đồng')).toBeTruthy();
        });
      });
    });
  });

  describe('calculateTotal', () => {
    // describe('UTCID-04 -> Tự động tính tổng khi thay đổi số lượng', () => {
    //   it('Cập nhật tổng khi thay đổi số lượng sản phẩm', async () => {
    //     const { getByPlaceholderText } = render(<TransactionModal {...mockProps} isEditing={true} />);
    //     fireEvent.changeText(getByPlaceholderText('Số lượng'), '2');
    //     await waitFor(() => {
    //       expect(mockProps.setEditedTransaction).toHaveBeenCalledWith(
    //         expect.objectContaining({
    //           amount: 10000000, // 2 * 5000000
    //         })
    //       );
    //     });
    //   });
    // });

    describe('UTCID-05 -> Không tính tổng khi chỉnh sửa số tiền thủ công', () => {
      it('Giữ nguyên tổng khi chỉnh sửa thủ công', async () => {
        const { getByPlaceholderText } = render(<TransactionModal {...mockProps} isEditing={true} />);
        fireEvent.changeText(getByPlaceholderText('Nhập số tiền'), '7000000');
        fireEvent.changeText(getByPlaceholderText('Số lượng'), '2');
        await waitFor(() => {
          expect(mockProps.setEditedTransaction).not.toHaveBeenCalledWith(
            expect.objectContaining({ amount: 10000000 })
          );
        });
      });
    });
  });
  describe('handleUpdateItem', () => {
    describe('UTCID-06 -> Cập nhật tên sản phẩm khi thay đổi', () => {
      it('Cập nhật tên sản phẩm mới', async () => {
        const { getByPlaceholderText } = render(<TransactionModal {...mockProps} isEditing={true} />);
        fireEvent.changeText(getByPlaceholderText('Tên sản phẩm'), 'Lương tháng 4');
        await waitFor(() => {
          expect(mockProps.updateItem).toHaveBeenCalledWith(0, 'productName', 'Lương tháng 4');
        });
      });
    });

    // describe('UTCID-07 -> Cập nhật giá và tính lại tổng', () => {
    //   it('Cập nhật giá và tính lại tổng mới', async () => {
    //     const { getByPlaceholderText } = render(<TransactionModal {...mockProps} isEditing={true} />);
    //     fireEvent.changeText(getByPlaceholderText('Giá'), '6000000');
    //     await waitFor(() => {
    //       expect(mockProps.updateItem).toHaveBeenCalledWith(0, 'price', 6000000);
    //       expect(mockProps.setEditedTransaction).toHaveBeenCalledWith(
    //         expect.objectContaining({ amount: 6000000 })
    //       );
    //     });
    //   });
    // });
  });

  describe('handleSave', () => {
    describe('UTCID-08 -> Gọi hàm onSave khi dữ liệu hợp lệ', () => {
      it('Thực thi lưu khi dữ liệu hợp lệ', async () => {
        const { getByText } = render(<TransactionModal {...mockProps} isEditing={true} />);
        fireEvent.press(getByText('Lưu'));
        await waitFor(() => {
          expect(mockProps.onSave).toHaveBeenCalled();
        });
      });
    });

    describe('UTCID-09 -> Không cho phép nhập số âm vào số tiền', () => {
      it('Giữ giá trị hợp lệ khi cố gắng nhập số âm và lưu thành công', async () => {
        const { getByPlaceholderText, getByText } = render(<TransactionModal {...mockProps} isEditing={true} />);
        const amountInput = getByPlaceholderText('Nhập số tiền');
        
        fireEvent.changeText(amountInput, '-1000');
        
        await waitFor(() => {
          expect(amountInput.props.value).not.toBe('1000');
        });
    
        // Nhấn "Lưu"
        fireEvent.press(getByText('Lưu'));
        
        await waitFor(() => {
          expect(mockProps.onSave).toHaveBeenCalled(); 
          expect(Alert.alert).not.toHaveBeenCalled(); 
        });
      });
    });
    describe('UTCID-10 -> Gọi hàm onEdit khi nhấn nút Sửa', () => {
      it('Kích hoạt chế độ chỉnh sửa', () => {
        const { getByText } = render(<TransactionModal {...mockProps} />);
        fireEvent.press(getByText('Sửa'));
        expect(mockProps.onEdit).toHaveBeenCalled();
      });
    });

    describe('UTCID-11 -> Gọi hàm onDelete với ID đúng khi nhấn nút Xóa', () => {
      it('Xóa giao dịch với ID chính xác', () => {
        const { getByText } = render(<TransactionModal {...mockProps} />);
        fireEvent.press(getByText('Xóa'));
        expect(mockProps.onDelete).toHaveBeenCalledWith('1');
      });
    });

    describe('UTCID-12 -> Gọi hàm addItem khi nhấn nút Thêm sản phẩm', () => {
      it('Thêm sản phẩm mới vào danh sách', () => {
        const { getByText } = render(<TransactionModal {...mockProps} isEditing={true} />);
        fireEvent.press(getByText('+ Thêm sản phẩm'));
        expect(mockProps.addItem).toHaveBeenCalled();
      });
    });

    // describe('UTCID-13 -> Gọi hàm removeItem khi nhấn nút Xóa sản phẩm', () => {
    //   it('Xóa sản phẩm tại vị trí chính xác', async () => {
    //     const { getByTestID } = render(<TransactionModal {...mockProps} isEditing={true} />);
    //     fireEvent.press(getByTestID('remove-item-0'));
    //     await waitFor(() => {
    //       expect(mockProps.removeItem).toHaveBeenCalledWith(0);
    //     });
    //   });
    // });
  });
});