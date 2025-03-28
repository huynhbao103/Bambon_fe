import { isDateInRange, formatAmount } from '../../app/components/list/TransactionUtils';
import { FilterType } from '../../app/types';

const mockTransactions = [
    {
      date: '2025-03-24T10:00:00Z', // Thứ Hai tuần hiện tại (ngày hiện tại)
      category: 'Lương',
      amount: 5000000,
      type: 'income',
    },
    {
      date: '2025-03-25T10:00:00Z', // Thứ Ba tuần hiện tại
      category: 'Ăn uống',
      amount: 200000,
      type: 'expense',
    },
    {
      date: '2025-02-15T10:00:00Z', // Tháng trước
      category: 'Mua sắm',
      amount: 1000000,
      type: 'expense',
    },
  ];
  
  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2025-03-24T00:00:00Z')); // Ngày hiện tại
  });
  
  afterAll(() => {
    jest.useRealTimers();
  });
  
  describe('TransactionList Functions', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
  
  describe('isDateInRange', () => {
      describe('UTCID01 -> Lọc giao dịch theo ngày (day)', () => {
        it('Chỉ hiển thị giao dịch trong ngày hiện tại', () => {
          const result = mockTransactions.filter((t) => isDateInRange(t.date, 'day'));
          expect(result).toHaveLength(1);
          expect(result[0].date).toBe('2025-03-24T10:00:00Z');
        });
      });
  
      describe('UTCID02 -> Lọc giao dịch theo tuần (week)', () => {
        it('Hiển thị giao dịch trong tuần hiện tại', () => {
          const result = mockTransactions.filter((t) => isDateInRange(t.date, 'week'));
          expect(result).toHaveLength(2);
          expect(result.map((t) => t.date)).toContain('2025-03-24T10:00:00Z');
          expect(result.map((t) => t.date)).toContain('2025-03-25T10:00:00Z');
        });
      });
  
      describe('UTCID03 -> Lọc giao dịch theo tháng (month)', () => {
        it('Hiển thị giao dịch trong tháng hiện tại', () => {
          const result = mockTransactions.filter((t) => isDateInRange(t.date, 'month'));
          expect(result).toHaveLength(2);
          expect(result.map((t) => t.date)).toContain('2025-03-24T10:00:00Z');
          expect(result.map((t) => t.date)).toContain('2025-03-25T10:00:00Z');
        });
    });

    describe('UTCID04 -> Lọc giao dịch theo năm (year)', () => {
      it('Hiển thị tất cả giao dịch trong năm hiện tại', () => {
        const result = mockTransactions.filter((t) => isDateInRange(t.date, 'year'));
        expect(result).toHaveLength(3);
      });
    });

    describe('UTCID05 -> Lọc với filter không hợp lệ', () => {
      it('Không hiển thị giao dịch khi filter không đúng', () => {
        const result = mockTransactions.filter((t) => isDateInRange(t.date, 'invalid' as FilterType));
        expect(result).toHaveLength(0);
      });
    });
  });

  describe('formatAmount', () => {
    describe('UTCID06 -> Định dạng số tiền dưới 1000', () => {
      it('Hiển thị nguyên bản khi số tiền nhỏ hơn 1000', () => {
        const result = formatAmount(500);
        expect(result).toBe('500');
      });
    });

    describe('UTCID07 -> Định dạng số tiền từ 1000 đến dưới 1 triệu', () => {
      it('Hiển thị với đơn vị "k"', () => {
        const result = formatAmount(5000);
        expect(result).toBe('5k');
      });
    });

    describe('UTCID08 -> Định dạng số tiền từ 1 triệu đến dưới 1 tỷ', () => {
      it('Hiển thị với đơn vị "triệu"', () => {
        const result = formatAmount(5000000);
        expect(result).toBe('5.0 triệu');
      });
    });

    describe('UTCID09 -> Định dạng số tiền từ 1 tỷ trở lên', () => {
      it('Hiển thị với đơn vị "tỷ"', () => {
        const result = formatAmount(1500000000);
        expect(result).toBe('1.5 tỷ');
      });
    });

    // describe('UTCID10 -> Định dạng số tiền chi tiêu với dấu trừ', () => {
    //   it('Hiển thị số tiền chi tiêu với dấu "-"', () => {
    //     const transaction = { amount: 200000, type: 'expense' };
    //     const result = ${transaction.type === 'income' ? '+' : '-'}${formatAmount(transaction.amount)};
    //     expect(result).toBe('-200k');
    //   });
    // });
  });
});