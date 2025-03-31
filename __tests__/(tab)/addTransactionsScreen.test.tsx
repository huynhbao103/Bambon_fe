import { validateForm, calculateTotalAmount, addItem, updateItem, addCustomCategory, submitTransaction } from '../../app/(tabs)/addTransactionF/addTransactionUtils';
import axios from 'axios';
import { Alert } from 'react-native';

// Mock các dependencies
jest.mock('axios');
jest.spyOn(Alert, 'alert');

const mockedAxios = axios as jest.Mocked<typeof axios>;

// Khai báo kiểu cho items
interface TransactionItem {
  productName: string;
  quantity: string;
  price: string;
}

describe('AddTransactionScreen Functional Tests', () => {
  let setErrorsMock: jest.Mock;
  let setItemsMock: jest.Mock;
  let setCategoryMock: jest.Mock;
  let setIncomeCategoriesMock: jest.Mock;
  let setExpenseCategoriesMock: jest.Mock;
  let setCustomCategoryMock: jest.Mock;
  let setShowCustomCategoryInputMock: jest.Mock;
  let setIsLoadingMock: jest.Mock;
  let setAmountMock: jest.Mock;
  let setTypeMock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    setErrorsMock = jest.fn();
    setItemsMock = jest.fn();
    setCategoryMock = jest.fn();
    setIncomeCategoriesMock = jest.fn();
    setExpenseCategoriesMock = jest.fn();
    setCustomCategoryMock = jest.fn();
    setShowCustomCategoryInputMock = jest.fn();
    setIsLoadingMock = jest.fn();
    setAmountMock = jest.fn();
    setTypeMock = jest.fn();
  });

  // validateForm
  describe('validateForm', () => {
    it('UTCID-01: Không chọn loại giao dịch', () => {
      const result = validateForm('', '', '', [], setErrorsMock);
      expect(result).toBe(false);
      expect(Alert.alert).toHaveBeenCalledWith('Lỗi', 'Vui lòng chọn loại giao dịch.');
    });

    it('UTCID-02: Chọn loại income nhưng không chọn danh mục', () => {
      const result = validateForm('income', '', '5000000', [], setErrorsMock);
      expect(result).toBe(false);
      expect(Alert.alert).toHaveBeenCalledWith('Lỗi', 'Vui lòng chọn danh mục.');
    });

    it('UTCID-03: Chọn loại expense nhưng không chọn danh mục', () => {
      const result = validateForm('expense', '', '', [], setErrorsMock);
      expect(result).toBe(false);
      expect(Alert.alert).toHaveBeenCalledWith('Lỗi', 'Vui lòng chọn danh mục.');
    });

    it('UTCID-04: Chọn loại income, chọn danh mục nhưng không nhập số tiền', () => {
      const result = validateForm('income', 'Lương', '', [], setErrorsMock);
      expect(result).toBe(false);
      expect(setErrorsMock).toHaveBeenCalledWith({ amount: 'Vui lòng nhập số tiền' });
    });

    it('UTCID-05: Chọn loại income, nhập số tiền không hợp lệ (âm, chữ, ký tự đặc biệt)', () => {
      const result = validateForm('income', 'Lương', '-1000abc !@#', [], setErrorsMock);
      expect(result).toBe(true); // -1000abc !@# -> 1000, hợp lệ
      expect(setErrorsMock).toHaveBeenCalledWith({});
    });

    it('UTCID-06: Chọn loại expense nhưng không thêm mục chi tiêu', () => {
      const result = validateForm('expense', 'Ăn uống', '', [], setErrorsMock);
      expect(result).toBe(false);
      expect(setErrorsMock).toHaveBeenCalledWith({ items: 'Vui lòng thêm ít nhất một mục chi tiêu' });
    });

    it('UTCID-07: Chọn loại expense, thêm mục chi tiêu nhưng không nhập tên', () => {
      const items: TransactionItem[] = [{ productName: '', quantity: '2', price: '25000' }];
      const result = validateForm('expense', 'Ăn uống', '', items, setErrorsMock);
      expect(result).toBe(false);
      expect(setErrorsMock).toHaveBeenCalledWith({ itemDetails: 'Tên sản phẩm 1 không được để trống' });
    });

    it('UTCID-08: Chọn loại expense, thêm mục chi tiêu nhưng không nhập số lượng', () => {
      const items: TransactionItem[] = [{ productName: 'Cà phê', quantity: '', price: '25000' }];
      const result = validateForm('expense', 'Ăn uống', '', items, setErrorsMock);
      expect(result).toBe(false);
      expect(setErrorsMock).toHaveBeenCalledWith({ itemDetails: 'Vui lòng nhập số lượng cho sản phẩm 1' });
    });

    it('UTCID-09: Chọn loại expense, thêm mục chi tiêu nhưng không nhập đơn giá', () => {
      const items: TransactionItem[] = [{ productName: 'Cà phê', quantity: '2', price: '' }];
      const result = validateForm('expense', 'Ăn uống', '', items, setErrorsMock);
      expect(result).toBe(false);
      expect(setErrorsMock).toHaveBeenCalledWith({ itemDetails: 'Vui lòng nhập đơn giá cho sản phẩm 1' });
    });

    it('UTCID-10: Chọn loại expense, số lượng không hợp lệ (âm, chữ, ký tự)', () => {
      const items: TransactionItem[] = [{ productName: 'Cà phê', quantity: '-2abc !@#', price: '25000' }];
      const result = validateForm('expense', 'Ăn uống', '', items, setErrorsMock);
      expect(result).toBe(true); // -2abc !@# -> 2, hợp lệ
      expect(setErrorsMock).toHaveBeenCalledWith({});
    });

    it('UTCID-11: Chọn loại expense, đơn giá không hợp lệ (âm, chữ, ký tự)', () => {
      const items: TransactionItem[] = [{ productName: 'Cà phê', quantity: '2', price: '-25000abc !@#' }];
      const result = validateForm('expense', 'Ăn uống', '', items, setErrorsMock);
      expect(result).toBe(true); // -25000abc !@# -> 25000, hợp lệ
      expect(setErrorsMock).toHaveBeenCalledWith({});
    });
  });

  // calculateTotalAmount
  describe('calculateTotalAmount', () => {
    it('UTCID-12: Tính tổng tiền với một mục chi tiêu', () => {
      const items: TransactionItem[] = [{ productName: 'Cà phê', quantity: '2', price: '25000' }];
      const result = calculateTotalAmount(items);
      expect(result).toBe(50000);
    });

    it('UTCID-13: Tính tổng tiền với nhiều mục chi tiêu', () => {
      const items: TransactionItem[] = [
        { productName: 'Cà phê', quantity: '2', price: '25000' },
        { productName: 'Bánh mì', quantity: '1', price: '15000' },
      ];
      const result = calculateTotalAmount(items);
      expect(result).toBe(65000);
    });
  });

  // addItem
  describe('addItem', () => {
    it('UTCID-14: Thêm một mục chi tiêu mới', () => {
      const items: TransactionItem[] = [];
      addItem(items, setItemsMock);
      expect(setItemsMock).toHaveBeenCalledWith([{ productName: '', quantity: '', price: '' }]);
    });
  });

  // updateItem
  describe('updateItem', () => {
    it('UTCID-15: Cập nhật tên sản phẩm', () => {
      const items: TransactionItem[] = [{ productName: '', quantity: '2', price: '25000' }];
      updateItem(0, 'productName', 'Cà phê', items, setItemsMock);
      expect(setItemsMock).toHaveBeenCalledWith([{ productName: 'Cà phê', quantity: '2', price: '25000' }]);
    });

    it('UTCID-16: Cập nhật số lượng không hợp lệ', () => {
      const items: TransactionItem[] = [{ productName: 'Cà phê', quantity: '', price: '25000' }];
      updateItem(0, 'quantity', '-2abc !@#', items, setItemsMock);
      expect(setItemsMock).toHaveBeenCalledWith([{ productName: 'Cà phê', quantity: '2', price: '25000' }]);
    });

    it('UTCID-17: Cập nhật đơn giá không hợp lệ', () => {
      const items: TransactionItem[] = [{ productName: 'Cà phê', quantity: '2', price: '' }];
      updateItem(0, 'price', '-25000abc !@#', items, setItemsMock);
      expect(setItemsMock).toHaveBeenCalledWith([{ productName: 'Cà phê', quantity: '2', price: '25000' }]);
    });
  });

  // addCustomCategory
  describe('addCustomCategory', () => {
    it('UTCID-18: Thêm danh mục tùy chỉnh hợp lệ', () => {
      const incomeCategories = [{ name: 'Lương', icon: 'money' }];
      addCustomCategory(
        'Freelance',
        'income',
        incomeCategories,
        [],
        setIncomeCategoriesMock,
        setExpenseCategoriesMock,
        setCategoryMock,
        setCustomCategoryMock,
        setShowCustomCategoryInputMock,
        setErrorsMock
      );
      expect(setIncomeCategoriesMock).toHaveBeenCalledWith([...incomeCategories, { name: 'Freelance', icon: 'tag' }]);
      expect(setCategoryMock).toHaveBeenCalledWith('Freelance');
      expect(setCustomCategoryMock).toHaveBeenCalledWith('');
      expect(setShowCustomCategoryInputMock).toHaveBeenCalledWith(false);
    });
  });

  // submitTransaction
  describe('submitTransaction', () => {
    it('UTCID-19: Gửi giao dịch expense hợp lệ', async () => {
      const items: TransactionItem[] = [{ productName: 'Cà phê', quantity: '2', price: '25000' }];
      mockedAxios.post.mockResolvedValue({ data: { message: 'success' } });
      await submitTransaction(
        'test-user-id',
        'expense',
        'Ăn uống',
        '',
        items,
        setIsLoadingMock,
        setCategoryMock,
        setAmountMock,
        setTypeMock,
        setItemsMock,
        setErrorsMock
      );
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          userId: 'test-user-id',
          type: 'expense',
          category: 'Ăn uống',
          amount: 50000,
          items,
        })
      );
      expect(Alert.alert).toHaveBeenCalledWith('Thành công', 'Giao dịch đã được thêm thành công!');
    });

    it('UTCID-20: Gửi giao dịch income hợp lệ', async () => {
      mockedAxios.post.mockResolvedValue({ data: { message: 'success' } });
      await submitTransaction(
        'test-user-id',
        'income',
        'Lương',
        '5000000abc !@#', // Sẽ thành 5000000
        [],
        setIsLoadingMock,
        setCategoryMock,
        setAmountMock,
        setTypeMock,
        setItemsMock,
        setErrorsMock
      );
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          userId: 'test-user-id',
          type: 'income',
          category: 'Lương',
          amount: 5000000,
        })
      );
      expect(Alert.alert).toHaveBeenCalledWith('Thành công', 'Giao dịch đã được thêm thành công!');
    });
  });
});