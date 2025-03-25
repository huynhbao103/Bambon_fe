import React from 'react';
import { render, fireEvent, act, waitFor } from '@testing-library/react-native';
import { TransactionModal } from '../../app/components/TransactionModal';
import { Transaction, TransactionItem } from '../../app/types';
import { Alert } from 'react-native';

jest.mock('expo-font', () => ({
  loadAsync: jest.fn(),
  isLoaded: jest.fn(() => true),
}));
jest.mock('react-native-vector-icons/FontAwesome', () => 'Icon');

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

const mockOnClose = jest.fn();
const mockOnEdit = jest.fn();
const mockOnDelete = jest.fn();
const mockOnSave = jest.fn();
const mockOnCancel = jest.fn();
const mockSetEditedTransaction = jest.fn();
const mockAddItem = jest.fn();
const mockRemoveItem = jest.fn();
const mockUpdateItem = jest.fn();

describe('TransactionModal Functions', () => {
  let screen: any;

  beforeEach(() => {
    jest.clearAllMocks();
    screen = render(
      <TransactionModal
        selectedTransaction={mockTransaction}
        isEditing={true}
        editedTransaction={mockTransaction}
        onClose={mockOnClose}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
        setEditedTransaction={mockSetEditedTransaction}
        addItem={mockAddItem}
        removeItem={mockRemoveItem}
        updateItem={mockUpdateItem}
      />
    );
  });

  describe('UTCID01 -> Hiển thị chi tiết giao dịch', () => {
    it('Hiển thị đúng thông tin giao dịch ở chế độ xem', () => {
      const { getByText } = render(
        <TransactionModal
          selectedTransaction={mockTransaction}
          isEditing={false}
          editedTransaction={mockTransaction}
          onClose={mockOnClose}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
          setEditedTransaction={mockSetEditedTransaction}
          addItem={mockAddItem}
          removeItem={mockRemoveItem}
          updateItem={mockUpdateItem}
        />
      );

      expect(getByText('Chi tiết giao dịch')).toBeTruthy();
      expect(getByText('Danh sách sản phẩm')).toBeTruthy();
      expect(getByText('Tiền lương tháng 3')).toBeTruthy();
      expect(getByText('1 x 5.000.000 đ')).toBeTruthy();
      expect(getByText('Tổng cộng: 5.000.000 đ')).toBeTruthy();
      expect(getByText('Sửa')).toBeTruthy();
      expect(getByText('Xóa')).toBeTruthy();
      expect(getByText('Đóng')).toBeTruthy();
    });
  });

  describe('UTCID02 -> Hiển thị giao diện chỉnh sửa', () => {
    it('Hiển thị đúng các trường nhập liệu ở chế độ chỉnh sửa', () => {
      const { getByText, getByTestId } = screen;

      expect(getByText('Sửa giao dịch')).toBeTruthy();
      expect(getByText('Loại giao dịch')).toBeTruthy();
      expect(getByTestId('transaction-type-input')).toHaveProp('value', 'income');
      expect(getByText('Danh mục')).toBeTruthy();
      expect(getByTestId('category-input')).toHaveProp('value', 'Lương');
      expect(getByText('Số tiền (VNĐ)')).toBeTruthy();
      expect(getByTestId('amount-input')).toHaveProp('value', '5000000');
      expect(getByText('Danh sách sản phẩm')).toBeTruthy();
      expect(getByTestId('product-name-0')).toHaveProp('value', 'Tiền lương tháng 3');
      expect(getByText('Lưu')).toBeTruthy();
      expect(getByText('Hủy')).toBeTruthy();
    });
  });

  describe('UTCID03 -> Kiểm tra validateInput với giá trị hợp lệ', () => {
    it('Cho phép nhập liệu hợp lệ mà không hiển thị lỗi', () => {
      const { getByTestId } = screen;

      const productNameInput = getByTestId('product-name-0');
      fireEvent.changeText(productNameInput, 'Tiền lương mới');
      expect(mockUpdateItem).toHaveBeenCalledWith(0, 'productName', 'Tiền lương mới');

      const priceInput = getByTestId('price-0');
      fireEvent.changeText(priceInput, '6000000');
      expect(mockUpdateItem).toHaveBeenCalledWith(0, 'price', 6000000);

      const quantityInput = getByTestId('quantity-0');
      fireEvent.changeText(quantityInput, '2');
      expect(mockUpdateItem).toHaveBeenCalledWith(0, 'quantity', 2);
    });
  });

  describe('UTCID04 -> Giới hạn nhập liệu cho tên sản phẩm, giá và số lượng', () => {
    it('Tên sản phẩm giới hạn 50 ký tự, giá và số lượng giữ nguyên khi không phải số', async () => {
      const { getByTestId, queryByText } = screen;
  
      const productNameInput = getByTestId('product-name-0');
      const longProductName = 'Tên sản phẩm rất dài để kiểm tra giới hạn 50 ký tự và hơn nữa';
  
      await act(async () => {
        fireEvent.changeText(productNameInput, longProductName);
      });
      expect(mockUpdateItem).not.toHaveBeenCalled();
  
      const priceInput = getByTestId('price-0');
      await act(async () => {
        fireEvent.changeText(priceInput, 'abc');
      });
      expect(mockUpdateItem).toHaveBeenCalledWith(0, 'price', 0); 
  
      await act(async () => {
        fireEvent.changeText(priceInput, '-1000');
      });
      expect(mockUpdateItem).not.toHaveBeenCalledWith(0, 'price', 1000); 
  
      const quantityInput = getByTestId('quantity-0');
      await act(async () => {
        fireEvent.changeText(quantityInput, 'xyz');
      });
      expect(mockUpdateItem).toHaveBeenCalledWith(0, 'quantity', 0);
  
      await act(async () => {
        fireEvent.changeText(quantityInput, '-5');
      });
      expect(mockUpdateItem).not.toHaveBeenCalledWith(0, 'quantity', 5); 
  
      await act(async () => {
        fireEvent.changeText(priceInput, '6000000');
      });
      expect(mockUpdateItem).toHaveBeenCalledWith(0, 'price', 6000000);
  
      await act(async () => {
        fireEvent.changeText(quantityInput, '2');
      });
      expect(mockUpdateItem).toHaveBeenCalledWith(0, 'quantity', 2);
  
      await act(async () => {
        fireEvent.changeText(priceInput, '0011');
      });
      expect(mockUpdateItem).toHaveBeenCalledWith(0, 'price', 11);
    });
  });

  describe('UTCID05 -> Kiểm tra tính toán tổng tiền', () => {
    it('Cập nhật tổng tiền khi thay đổi giá hoặc số lượng', async () => {
      const { getByTestId } = screen;
  
      const priceInput = getByTestId('price-0');
      const quantityInput = getByTestId('quantity-0');
  
      await act(async () => {
        fireEvent.changeText(priceInput, '2000000');
        fireEvent.changeText(quantityInput, '3');
      });
  
      expect(mockUpdateItem).toHaveBeenCalledWith(0, 'price', 2000000);
      expect(mockUpdateItem).toHaveBeenCalledWith(0, 'quantity', 3);
  
      const expectedAmount = 2000000 * 3;
  
      await waitFor(() => {
        expect(mockSetEditedTransaction).toHaveBeenCalledWith(
          expect.objectContaining({
            amount: expectedAmount,
          })
        );
      });
    });
  });
  
  describe('UTCID06 -> Kiểm tra lưu giao dịch với dữ liệu hợp lệ', () => {
    it('Gọi hàm onSave khi tất cả dữ liệu hợp lệ', () => {
      const { getByTestId } = screen;

      fireEvent.press(getByTestId('save-button'));
      expect(mockOnSave).toHaveBeenCalled();
    });
  });

  describe('UTCID07 -> Kiểm tra thêm sản phẩm', () => {
    it('Gọi hàm addItem khi nhấn nút thêm sản phẩm', () => {
      const { getByTestId } = screen;

      fireEvent.press(getByTestId('add-item-button'));
      expect(mockAddItem).toHaveBeenCalled();
    });
  });

  describe('UTCID08 -> Kiểm tra xóa sản phẩm', () => {
    it('Gọi hàm removeItem khi nhấn nút xóa', () => {
      const { getByTestId } = screen;

      const removeButton = getByTestId('remove-item-0');
      fireEvent.press(removeButton);
      expect(mockRemoveItem).toHaveBeenCalledWith(0);
    });
  });
});