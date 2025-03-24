import {
    formatCurrency,
    handleBudgetChange,
    calculateSpentAmounts,
    deleteBudget,
    saveBudget,
  } from '../../app/(tabs)/BudgetScreen';
  import axios from 'axios';
  import { Alert, StyleSheet } from 'react-native';
  
  jest.mock('axios');
  const mockedAxios = axios as jest.Mocked<typeof axios>;
  
  jest.mock('react-native', () => ({
    Alert: { alert: jest.fn() },
    View: 'View',
    Text: 'Text',
    TextInput: 'TextInput',
    ScrollView: 'ScrollView',
    TouchableOpacity: 'TouchableOpacity',
    StyleSheet: {
      create: jest.fn().mockImplementation(styles => styles),
    },
  }));
  const mockedAlert = Alert.alert as jest.Mock;
  
  const mockTransactions = [
    { type: 'expense', amount: 500000, date: new Date('2025-03-24') },
    { type: 'expense', amount: 300000, date: new Date('2025-03-15') },
    { type: 'income', amount: 1000000, date: new Date('2025-03-24') },
    { type: 'expense', amount: 200000, date: new Date('2024-12-31') },
  ];
  
  const mockSetter = jest.fn();
  const mockSetSpentAmounts = jest.fn();
  const mockSetCurrentBudgets = jest.fn();
  const mockSetWeeklyBudget = jest.fn();
  const mockSetMonthlyBudget = jest.fn();
  const mockSetYearlyBudget = jest.fn();
  const mockOnBudgetSaved = jest.fn();
  
  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2025-03-24'));
    // Mock console.error để ngăn lỗi thoát ra ngoài
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  jest.mock('@ant-design/react-native', () => ({
    Button: jest.fn(() => 'Button'), 
  }));

  afterAll(() => {
    jest.useRealTimers();
    jest.restoreAllMocks(); 
  });
  
  beforeEach(() => {
    jest.clearAllMocks();
    mockedAxios.post.mockResolvedValue({ data: {} });
  });
  
  describe('BudgetScreen', () => {
  describe('formatCurrency', () => {
    it('UTCID01 - định dạng số tiền sang tiền tệ Việt Nam', () => {
      expect(formatCurrency('500000')).toBe('500.000');
      expect(formatCurrency('1000000')).toBe('1.000.000');
      expect(formatCurrency('0')).toBe('0');
    });

    it('UTCID02 - loại bỏ ký tự không phải số', () => {
      expect(formatCurrency('500 000')).toBe('500.000');
      expect(formatCurrency('1,000,000')).toBe('1.000.000');
    });
  });

  describe('handleBudgetChange', () => {
    it('UTCID03 - gọi setter với giá trị số', () => {
      handleBudgetChange('500000', mockSetter);
      expect(mockSetter).toHaveBeenCalledWith('500000');

      handleBudgetChange('abc500def000', mockSetter);
      expect(mockSetter).toHaveBeenCalledWith('500000');
    });

    it('UTCID04 - xử lý chuỗi rỗng', () => {
      handleBudgetChange('', mockSetter);
      expect(mockSetter).toHaveBeenCalledWith('');
    });
  });

  describe('calculateSpentAmounts', () => {
    it('UTCID05 - tính toán chi tiêu đúng', () => {
      calculateSpentAmounts(mockTransactions, mockSetSpentAmounts);
      expect(mockSetSpentAmounts).toHaveBeenCalledWith({
        weeklySpent: 500000,
        monthlySpent: 800000,
        yearlySpent: 800000,
      });
    });

    it('UTCID06 - xử lý mảng rỗng', () => {
      calculateSpentAmounts([], mockSetSpentAmounts);
      expect(mockSetSpentAmounts).toHaveBeenCalledWith({
        weeklySpent: 0,
        monthlySpent: 0,
        yearlySpent: 0,
      });
    });
  });

  describe('deleteBudget', () => {
    it('UTCID07 - xóa ngân sách tuần thành công', async () => {
      const currentBudgets = { weeklyBudget: 1000000, monthlyBudget: null, yearlyBudget: null };
      deleteBudget('weekly', currentBudgets, mockSetCurrentBudgets, mockSetWeeklyBudget, mockSetMonthlyBudget, mockSetYearlyBudget, 'testUser', mockOnBudgetSaved);

      const confirmCallback = mockedAlert.mock.calls[0][2][1].onPress;
      await confirmCallback();

      expect(mockSetCurrentBudgets).toHaveBeenCalledWith({ weeklyBudget: null, monthlyBudget: null, yearlyBudget: null });
      expect(mockSetWeeklyBudget).toHaveBeenCalledWith('');
      expect(mockedAxios.post).toHaveBeenCalledWith('https://bambon-be.onrender.com/api/budget', {
        userId: 'testUser',
        weeklyBudget: null,
        monthlyBudget: null,
        yearlyBudget: null,
      });
      expect(mockedAlert).toHaveBeenCalledWith('Thành công', 'Đã xóa ngân sách!');
    });

    it('UTCID08 - xóa ngân sách tháng thành công', async () => {
      const currentBudgets = { weeklyBudget: null, monthlyBudget: 2000000, yearlyBudget: null };
      deleteBudget('monthly', currentBudgets, mockSetCurrentBudgets, mockSetWeeklyBudget, mockSetMonthlyBudget, mockSetYearlyBudget, 'testUser', mockOnBudgetSaved);

      const confirmCallback = mockedAlert.mock.calls[0][2][1].onPress;
      await confirmCallback();

      expect(mockSetCurrentBudgets).toHaveBeenCalledWith({ weeklyBudget: null, monthlyBudget: null, yearlyBudget: null });
      expect(mockSetMonthlyBudget).toHaveBeenCalledWith('');
      expect(mockedAxios.post).toHaveBeenCalledWith('https://bambon-be.onrender.com/api/budget', {
        userId: 'testUser',
        weeklyBudget: null,
        monthlyBudget: null,
        yearlyBudget: null,
      });
      expect(mockedAlert).toHaveBeenCalledWith('Thành công', 'Đã xóa ngân sách!');
    });

    it('UTCID09 - xóa ngân sách năm thành công', async () => {
      const currentBudgets = { weeklyBudget: null, monthlyBudget: null, yearlyBudget: 3000000 };
      deleteBudget('yearly', currentBudgets, mockSetCurrentBudgets, mockSetWeeklyBudget, mockSetMonthlyBudget, mockSetYearlyBudget, 'testUser', mockOnBudgetSaved);

      const confirmCallback = mockedAlert.mock.calls[0][2][1].onPress;
      await confirmCallback();

      expect(mockSetCurrentBudgets).toHaveBeenCalledWith({ weeklyBudget: null, monthlyBudget: null, yearlyBudget: null });
      expect(mockSetYearlyBudget).toHaveBeenCalledWith('');
      expect(mockedAxios.post).toHaveBeenCalledWith('https://bambon-be.onrender.com/api/budget', {
        userId: 'testUser',
        weeklyBudget: null,
        monthlyBudget: null,
        yearlyBudget: null,
      });
      expect(mockedAlert).toHaveBeenCalledWith('Thành công', 'Đã xóa ngân sách!');
    });

    it('UTCID10 - xử lý lỗi khi xóa ngân sách', async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error('Network Error'));
      const currentBudgets = { weeklyBudget: 1000000, monthlyBudget: null, yearlyBudget: null };
      deleteBudget('weekly', currentBudgets, mockSetCurrentBudgets, mockSetWeeklyBudget, mockSetMonthlyBudget, mockSetYearlyBudget, 'testUser', mockOnBudgetSaved);

      const confirmCallback = mockedAlert.mock.calls[0][2][1].onPress;
      await confirmCallback();

      expect(mockSetCurrentBudgets).toHaveBeenCalledWith({ weeklyBudget: null, monthlyBudget: null, yearlyBudget: null });
      expect(mockSetWeeklyBudget).toHaveBeenCalledWith('');
      expect(mockedAlert).toHaveBeenCalledWith('Lỗi', 'Không thể xóa ngân sách. Vui lòng thử lại!');
    });
  });

  describe('saveBudget', () => {
    it('UTCID11 - lưu ngân sách tuần hợp lệ', async () => {
      const currentBudgets = { weeklyBudget: null, monthlyBudget: null, yearlyBudget: null };
      const spentAmounts = { weeklySpent: 600000, monthlySpent: 800000, yearlySpent: 800000 };

      await saveBudget('500000', '', '', currentBudgets, mockSetCurrentBudgets, mockTransactions, mockSetSpentAmounts, spentAmounts, 'testUser', mockOnBudgetSaved);

      expect(mockSetCurrentBudgets).toHaveBeenCalledWith({ weeklyBudget: 500000, monthlyBudget: null, yearlyBudget: null });
      expect(mockedAxios.post).toHaveBeenCalledWith('https://bambon-be.onrender.com/api/budget', {
        userId: 'testUser',
        weeklyBudget: 500000,
        monthlyBudget: null,
        yearlyBudget: null,
      });
      expect(mockedAlert).toHaveBeenCalledWith('Cảnh báo', 'Bạn đã vượt quá ngân sách tuần mới!\nĐã chi: 600.000 đ\nNgân sách: 500.000 đ');
      expect(mockedAlert).toHaveBeenCalledWith('Thành công', 'Ngân sách đã được lưu!');
    });

    it('UTCID12 - lưu ngân sách tháng hợp lệ', async () => {
      const currentBudgets = { weeklyBudget: null, monthlyBudget: null, yearlyBudget: null };
      const spentAmounts = { weeklySpent: 600000, monthlySpent: 800000, yearlySpent: 800000 };

      await saveBudget('', '1000000', '', currentBudgets, mockSetCurrentBudgets, mockTransactions, mockSetSpentAmounts, spentAmounts, 'testUser', mockOnBudgetSaved);

      expect(mockSetCurrentBudgets).toHaveBeenCalledWith({ weeklyBudget: null, monthlyBudget: 1000000, yearlyBudget: null });
      expect(mockedAxios.post).toHaveBeenCalledWith('https://bambon-be.onrender.com/api/budget', {
        userId: 'testUser',
        weeklyBudget: null,
        monthlyBudget: 1000000,
        yearlyBudget: null,
      });
      expect(mockedAlert).toHaveBeenCalledWith('Thành công', 'Ngân sách đã được lưu!');
    });

    it('UTCID13 - lưu ngân sách năm hợp lệ', async () => {
      const currentBudgets = { weeklyBudget: null, monthlyBudget: null, yearlyBudget: null };
      const spentAmounts = { weeklySpent: 600000, monthlySpent: 800000, yearlySpent: 800000 };

      await saveBudget('', '', '2000000', currentBudgets, mockSetCurrentBudgets, mockTransactions, mockSetSpentAmounts, spentAmounts, 'testUser', mockOnBudgetSaved);

      expect(mockSetCurrentBudgets).toHaveBeenCalledWith({ weeklyBudget: null, monthlyBudget: null, yearlyBudget: 2000000 });
      expect(mockedAxios.post).toHaveBeenCalledWith('https://bambon-be.onrender.com/api/budget', {
        userId: 'testUser',
        weeklyBudget: null,
        monthlyBudget: null,
        yearlyBudget: 2000000,
      });
      expect(mockedAlert).toHaveBeenCalledWith('Thành công', 'Ngân sách đã được lưu!');
    });

    it('UTCID14 - báo lỗi nếu ngân sách không hợp lệ (âm)', async () => {
      const currentBudgets = { weeklyBudget: null, monthlyBudget: null, yearlyBudget: null };
      const spentAmounts = { weeklySpent: 0, monthlySpent: 0, yearlySpent: 0 };

      await saveBudget('-500000', '', '', currentBudgets, mockSetCurrentBudgets, mockTransactions, mockSetSpentAmounts, spentAmounts, 'testUser');

      expect(mockedAlert).toHaveBeenCalledWith('Lỗi', 'Vui lòng nhập số tiền hợp lệ cho ngân sách!');
    });

    it('UTCID15 - báo lỗi nếu không có ngân sách hợp lệ', async () => {
      const currentBudgets = { weeklyBudget: null, monthlyBudget: null, yearlyBudget: null };
      const spentAmounts = { weeklySpent: 0, monthlySpent: 0, yearlySpent: 0 };

      await saveBudget('', '', '', currentBudgets, mockSetCurrentBudgets, mockTransactions, mockSetSpentAmounts, spentAmounts, 'testUser');

      expect(mockedAlert).toHaveBeenCalledWith('Lỗi', 'Vui lòng nhập ít nhất một loại ngân sách hợp lệ!');
    });

    it('UTCID16 - xử lý lỗi khi lưu ngân sách', async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error('Network Error'));
      const currentBudgets = { weeklyBudget: null, monthlyBudget: null, yearlyBudget: null };
      const spentAmounts = { weeklySpent: 0, monthlySpent: 0, yearlySpent: 0 };

      await saveBudget('500000', '', '', currentBudgets, mockSetCurrentBudgets, mockTransactions, mockSetSpentAmounts, spentAmounts, 'testUser');

      expect(mockedAlert).toHaveBeenCalledWith('Lỗi', 'Không thể lưu ngân sách. Vui lòng thử lại!');
    });
  });
});