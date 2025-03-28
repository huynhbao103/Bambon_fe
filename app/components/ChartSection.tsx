import React, { useMemo, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { styles } from '../styles/index_char';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

type FilterType = 'day' | 'week' | 'month' | 'year';

interface Transaction {
  date: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
}

interface ChartSectionProps {
  dailyExpenses?: Transaction[];
  filter: FilterType;
  setFilter: (filter: FilterType) => void;
  currency?: string;
}

const SCREEN_WIDTH = Dimensions.get('window').width;
const FILTERS: FilterType[] = ['day', 'week', 'month', 'year'];
const FILTER_LABELS = {
  day: 'Ngày',
  week: 'Tuần',
  month: 'Tháng',
  year: 'Năm'
};

const getDateRangeFilter = (filter: FilterType) => {
  const now = new Date();
  const startOfDay = new Date(now.setHours(0, 0, 0, 0));
  
  return (transactionDate: Date) => {
    const date = new Date(transactionDate);
    switch (filter) {
      case 'day':
        return date >= startOfDay;
      case 'week':
        const startOfWeek = new Date(startOfDay);
        startOfWeek.setDate(startOfDay.getDate() - startOfDay.getDay());
        return date >= startOfWeek;
      case 'month':
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      case 'year':
        return date.getFullYear() === now.getFullYear();
      default:
        return true;
    }
  };
};

const formatAmount = (amount: number | undefined, currency = '₫'): string => {
  if (amount === undefined || isNaN(amount)) return `0 ${currency}`;
  
  const absAmount = Math.abs(amount);
  let formatted = '';
  
  if (absAmount >= 1000000000) {
    formatted = `${(amount / 1000000000).toFixed(1)} tỷ`;
  } else if (absAmount >= 1000000) {
    formatted = `${(amount / 1000000).toFixed(1)} tr`;
  } else if (absAmount >= 1000) {
    formatted = `${(amount / 1000).toFixed(0)}k`;
  } else {
    formatted = amount.toLocaleString('vi-VN');
  }
  
  return `${formatted} ${currency}`;
};

const useChartData = (transactions: Transaction[] = [], filter: FilterType) => {
  const filteredTransactions = useMemo(() => {
    const isInRange = getDateRangeFilter(filter);
    return transactions.filter(t => isInRange(new Date(t.date)));
  }, [transactions, filter]);

  return useMemo(() => {
    const dateMap = new Map<string, { income: number; expense: number }>();
    let totalIncome = 0;
    let totalExpense = 0;

    filteredTransactions.forEach(t => {
      const dateKey = new Date(t.date).toLocaleDateString('vi-VN', {
        day: 'numeric',
        month: 'short'
      });

      if (!dateMap.has(dateKey)) {
        dateMap.set(dateKey, { income: 0, expense: 0 });
      }

      const dateData = dateMap.get(dateKey)!;
      if (t.type === 'income') {
        dateData.income += t.amount;
        totalIncome += t.amount;
      } else {
        dateData.expense += t.amount;
        totalExpense += t.amount;
      }
    });

    const sortedDates = Array.from(dateMap.keys()).sort((a, b) => {
      return new Date(a).getTime() - new Date(b).getTime();
    });

    return {
      labels: sortedDates,
      incomeData: sortedDates.map(date => dateMap.get(date)!.income),
      expenseData: sortedDates.map(date => dateMap.get(date)!.expense),
      totals: {
        income: totalIncome,
        expense: totalExpense,
        balance: totalIncome - totalExpense
      }
    };
  }, [filteredTransactions]);
};

const chartConfig = {
  backgroundGradientFrom: '#fff',
  backgroundGradientTo: '#fff',
  decimalPlaces: 0,
  barPercentage: 0.6,
  propsForBackgroundLines: {
    strokeWidth: 1,
    stroke: '#e9ecef'
  },
  propsForLabels: {
    fontSize: 10
  },
  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
};

export const ChartSection: React.FC<ChartSectionProps> = React.memo(({
  dailyExpenses = [],
  filter,
  setFilter,
  currency = '₫'
}) => {
  const { labels, incomeData, expenseData, totals } = useChartData(dailyExpenses, filter);
  const chartWidth = Math.max(SCREEN_WIDTH - 32, labels.length * 70);

  const handleFilterPress = useCallback((newFilter: FilterType) => {
    setFilter(newFilter);
  }, [setFilter]);

  const renderChart = (title: string, data: number[], color: string) => {
    if (!data.length || data.every(val => val === 0)) {
      return (
        <Animated.View entering={FadeInDown.duration(300)}>
          <Text style={styles.chartTitle}>{title}</Text>
          <Text style={styles.noDataText}>Không có dữ liệu</Text>
        </Animated.View>
      );
    }

    return (
      <Animated.View entering={FadeInDown.duration(300)}>
        <Text style={styles.chartTitle}>{title}</Text>
        <BarChart
          yAxisLabel=""
          data={{
            labels,
            datasets: [{
              data,
              colors: data.map(() => (opacity: number) => color),
            }]
          }}
          width={chartWidth}
          height={200}
          chartConfig={{
            ...chartConfig,
            fillShadowGradient: color,
            labelColor: () => '#6c757d',
          }}
          style={styles.chartCard}
          yAxisSuffix={` ${currency}`}
          fromZero
          showBarTops={false}
          withVerticalLabels={true}
          verticalLabelRotation={labels.length > 5 ? 45 : 0}
        />
      </Animated.View>
    );
  };

  return (
    <View style={styles.chartContainer}>
      {/* Summary Section */}
      <View style={styles.totalContainer}>
        <View style={styles.totalBlock}>
          <Ionicons name="arrow-up-circle" size={24} color="#2ecc71" />
          <Text style={styles.totalLabel}>Thu nhập</Text>
          <Text style={[styles.totalAmount, { color: '#2ecc71' }]}>
            {formatAmount(totals.income, currency)}
          </Text>
        </View>

        <View style={styles.totalBlock}>
          <Ionicons name="arrow-down-circle" size={24} color="#e74c3c" />
          <Text style={styles.totalLabel}>Chi tiêu</Text>
          <Text style={[styles.totalAmount, { color: '#e74c3c' }]}>
            {formatAmount(totals.expense, currency)}
          </Text>
        </View>

        <View style={styles.totalBlock}>
          <Ionicons 
            name={totals.balance >= 0 ? "wallet" : "wallet-outline"} 
            size={24} 
            color={totals.balance >= 0 ? '#2ecc71' : '#e74c3c'} 
          />
          <Text style={styles.totalLabel}>Số dư</Text>
          <Text style={[
            styles.totalAmount,
            totals.balance >= 0 ? styles.balancePositive : styles.balanceNegative
          ]}>
            {formatAmount(totals.balance, currency)}
          </Text>
        </View>
      </View>

      {/* Charts */}
    {/* Charts */}
<ScrollView 
  horizontal 
  showsHorizontalScrollIndicator={false}
  contentContainerStyle={{ paddingHorizontal: 8 }}
  snapToInterval={SCREEN_WIDTH - 32} // Snap theo chiều rộng màn hình trừ padding
  decelerationRate="fast" // Tốc độ scroll sau khi thả
  bounces={false} // Tắt hiệu ứng bật lại khi kéo quá
>
  <View style={{ flexDirection: 'row' }}>
    <View style={{ width: SCREEN_WIDTH - 32 }}>
      {renderChart('Thu nhập', incomeData, '#2ecc71')}
    </View>
    <View style={{ width: SCREEN_WIDTH - 32, marginLeft: 16 }}>
      {renderChart('Chi tiêu', expenseData, '#e74c3c')}
    </View>
  </View>
</ScrollView>

      {/* Filters */}
      <View style={styles.filterContainer}>
        {FILTERS.map((filterType) => (
          <TouchableOpacity
            key={filterType}
            onPress={() => handleFilterPress(filterType)}
            style={[
              styles.filterButton,
              filter === filterType && styles.activeFilter
            ]}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.filterText,
              filter === filterType && styles.activeFilterText
            ]}>
              {FILTER_LABELS[filterType]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
});

ChartSection.displayName = 'ChartSection';