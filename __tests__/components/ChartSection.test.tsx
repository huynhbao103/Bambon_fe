// import React from 'react';
// import { render, fireEvent } from '@testing-library/react-native';
// import { ChartSection, useFilteredTransactions, useCategoryData, ChartTitle, formatAmount } from '../../app/components/ChartSection'; // Điều chỉnh đường dẫn
// import { FilterType } from '../../app/types';

// // Mock các thư viện
// jest.mock('react-native-chart-kit', () => ({
//   PieChart: () => <></>,
// }));

// // Mock dữ liệu giao dịch
// const mockDailyExpenses = [
//   { date: '2025-03-24T10:00:00Z', amount: 5000000, type: 'income', category: 'Lương' },
//   { date: '2025-03-25T10:00:00Z', amount: 200000, type: 'expense', category: 'Ăn uống' },
//   { date: '2025-02-15T10:00:00Z', amount: 1000000, type: 'expense', category: 'Mua sắm' },
// ];

// // Mock setFilter
// const mockSetFilter = jest.fn();

// describe('ChartSection Functions', () => {
//   beforeAll(() => {
//     jest.useFakeTimers();
//     jest.setSystemTime(new Date('2025-03-24T00:00:00Z')); // Ngày hiện tại
//   });

//   afterAll(() => {
//     jest.useRealTimers();
//   });

//   beforeEach(() => {
//     jest.clearAllMocks();
//   });

//   describe('useFilteredTransactions', () => {
//     it('UTCID01 -> Lọc giao dịch theo ngày', () => {
//       const result = useFilteredTransactions(mockDailyExpenses, 'day');
//       expect(result).toHaveLength(1);
//       expect(result[0].date).toBe('2025-03-24T10:00:00Z');
//     });

//     it('UTCID02 -> Lọc giao dịch theo tuần', () => {
//       const result = useFilteredTransactions(mockDailyExpenses, 'week');
//       expect(result).toHaveLength(2);
//       expect(result.map(t => t.date)).toContain('2025-03-24T10:00:00Z');
//       expect(result.map(t => t.date)).toContain('2025-03-25T10:00:00Z');
//     });

//     it('UTCID03 -> Lọc giao dịch theo tháng', () => {
//       const result = useFilteredTransactions(mockDailyExpenses, 'month');
//       expect(result).toHaveLength(2);
//       expect(result.map(t => t.date)).toContain('2025-03-24T10:00:00Z');
//       expect(result.map(t => t.date)).toContain('2025-03-25T10:00:00Z');
//     });

//     it('UTCID04 -> Lọc giao dịch theo năm', () => {
//       const result = useFilteredTransactions(mockDailyExpenses, 'year');
//       expect(result).toHaveLength(3);
//     });

//     it('UTCID05 -> Lọc với filter không hợp lệ', () => {
//       const result = useFilteredTransactions(mockDailyExpenses, 'invalid' as FilterType);
//       expect(result).toHaveLength(0);
//     });
//   });

//   describe('useCategoryData', () => {
//     const filteredTransactions = useFilteredTransactions(mockDailyExpenses, 'month');

//     it('UTCID06 -> Tính toán dữ liệu thu nhập', () => {
//       const result = useCategoryData(filteredTransactions, 'income');
//       expect(result.total).toBe(5000000);
//       expect(result.data).toHaveLength(1);
//       expect(result.data[0]).toMatchObject({
//         name: 'Lương',
//         amount: 5000000,
//         percentage: '100.0',
//         color: '#2ecc71',
//       });
//     });

//     it('UTCID07 -> Tính toán dữ liệu chi tiêu', () => {
//       const result = useCategoryData(filteredTransactions, 'expense');
//       expect(result.total).toBe(200000);
//       expect(result.data).toHaveLength(1);
//       expect(result.data[0]).toMatchObject({
//         name: 'Ăn uống',
//         amount: 200000,
//         percentage: '100.0',
//         color: '#e74c3c',
//       });
//     });

//     it('UTCID08 -> Không có giao dịch cho loại', () => {
//       const emptyTransactions = filteredTransactions.filter(t => t.type === 'income');
//       const result = useCategoryData(emptyTransactions, 'expense');
//       expect(result.total).toBe(0);
//       expect(result.data).toHaveLength(0);
//     });
//   });

//   describe('ChartTitle', () => {
//     it('UTCID09 -> Hiển thị tiêu đề cho filter "day"', () => {
//       const { getByText } = render(<ChartTitle filter="day" />);
//       expect(getByText('Thu chi trong ngày')).toBeTruthy();
//     });

//     it('UTCID10 -> Hiển thị tiêu đề cho filter "week"', () => {
//       const { getByText } = render(<ChartTitle filter="week" />);
//       expect(getByText('Thu chi trong tuần')).toBeTruthy();
//     });

//     it('UTCID11 -> Hiển thị tiêu đề cho filter "month"', () => {
//       const { getByText } = render(<ChartTitle filter="month" />);
//       expect(getByText('Thu chi trong tháng')).toBeTruthy();
//     });

//     it('UTCID12 -> Hiển thị tiêu đề cho filter "year"', () => {
//       const { getByText } = render(<ChartTitle filter="year" />);
//       expect(getByText('Thu chi trong năm')).toBeTruthy();
//     });
//   });

//   describe('formatAmount', () => {
//     it('UTCID13 -> Định dạng số tiền dưới 1000', () => {
//       expect(formatAmount(500)).toBe('500');
//     });

//     it('UTCID14 -> Định dạng số tiền từ 1000 đến dưới 1 triệu', () => {
//       expect(formatAmount(5000)).toBe('5k');
//     });

//     it('UTCID15 -> Định dạng số tiền từ 1 triệu đến dưới 1 tỷ', () => {
//       expect(formatAmount(5000000)).toBe('5.0 triệu');
//     });

//     it('UTCID16 -> Định dạng số tiền từ 1 tỷ trở lên', () => {
//       expect(formatAmount(1500000000)).toBe('1.5 tỷ');
//     });
//   });

//   describe('ChartSection', () => {
//     it('UTCID17 -> Hiển thị tổng thu và tổng chi', () => {
//       const { getByText } = render(
//         <ChartSection dailyExpenses={mockDailyExpenses} filter="month" setFilter={mockSetFilter} />
//       );
//       expect(getByText('Tổng thu')).toBeTruthy();
//       expect(getByText('5.0 triệu đ')).toBeTruthy();
//       expect(getByText('Tổng chi')).toBeTruthy();
//       expect(getByText('200k đ')).toBeTruthy();
//     });

//     it('UTCID18 -> Hiển thị biểu đồ thu nhập và chi tiêu', () => {
//       const { getByText } = render(
//         <ChartSection dailyExpenses={mockDailyExpenses} filter="month" setFilter={mockSetFilter} />
//       );
//       expect(getByText('Thu nhập theo danh mục')).toBeTruthy();
//       expect(getByText('Chi tiêu theo danh mục')).toBeTruthy();
//       expect(getByText('Lương')).toBeTruthy();
//       expect(getByText('Ăn uống')).toBeTruthy();
//     });

//     it('UTCID19 -> Thay đổi filter khi nhấn nút', () => {
//       const { getByText } = render(
//         <ChartSection dailyExpenses={mockDailyExpenses} filter="day" setFilter={mockSetFilter} />
//       );
//       fireEvent.press(getByText('Tuần'));
//       expect(mockSetFilter).toHaveBeenCalledWith('week');
//     });
//   });
// });