import React, { useMemo, useCallback } from 'react';
import { View, Text, TouchableOpacity, Dimensions, ScrollView, Animated } from 'react-native';
import { PieChart } from "react-native-chart-kit";
import { AbstractChartConfig } from "react-native-chart-kit/dist/AbstractChart";
import { styles } from '../styles/index';
import { FilterType } from '../types';

interface ChartSectionProps {
  dailyExpenses: { date: string; amount: number; type: 'income' | 'expense', category: string }[];
  filter: FilterType;
  setFilter: (filter: FilterType) => void;
}

const useFilteredTransactions = (dailyExpenses: ChartSectionProps['dailyExpenses'], filter: FilterType) => {
  return useMemo(() => {
    const isDateInRange = (transactionDate: Date) => {
      const now = new Date();
      const date = new Date(transactionDate);
      
      switch (filter) {
        case "day":
          return date.getDate() === now.getDate() &&
            date.getMonth() === now.getMonth() &&
            date.getFullYear() === now.getFullYear();
        case "week":
          const startOfWeek = new Date(now);
          startOfWeek.setDate(now.getDate() - now.getDay());
          return date >= startOfWeek;
        case "month":
          return date.getMonth() === now.getMonth() &&
            date.getFullYear() === now.getFullYear();
        case "year":
          return date.getFullYear() === now.getFullYear();
        default:
          return false;
      }
    };

    return dailyExpenses.filter(transaction => 
      isDateInRange(new Date(transaction.date))
    );
  }, [dailyExpenses, filter]);
};

const useCategoryData = (filteredTransactions: ReturnType<typeof useFilteredTransactions>, type: 'income' | 'expense') => {
  return useMemo(() => {
    const transactions = filteredTransactions.filter(t => t.type === type);
    const categoryMap = new Map<string, number>();
    const total = transactions.reduce((sum, t) => sum + t.amount, 0);

    transactions.forEach(transaction => {
      const currentAmount = categoryMap.get(transaction.category) || 0;
      categoryMap.set(transaction.category, currentAmount + transaction.amount);
    });

    const colors = type === 'income' 
      ? [
          '#2ecc71', // Xanh lá tươi
          '#3498db', // Xanh dương
          '#9b59b6', // Tím
          '#f1c40f', // Vàng
          '#1abc9c', // Ngọc lục bảo
          '#e67e22', // Cam
          '#34495e', // Xám đậm
          '#16a085', // Xanh lá đậm
          '#2980b9', // Xanh dương đậm
          '#8e44ad', // Tím đậm
        ]
      : [
          '#e74c3c', // Đỏ
          '#e91e63', // Hồng
          '#f44336', // Đỏ tươi
          '#d32f2f', // Đỏ đậm
          '#c2185b', // Hồng đậm
          '#b71c1c', // Đỏ sẫm
          '#ff1744', // Đỏ tươi
          '#ff4081', // Hồng tươi
          '#ff5252', // Đỏ nhạt
          '#ff867c', // Đỏ cam
        ];

    const chartData = Array.from(categoryMap.entries()).map(([category, amount], index) => ({
      name: category,
      amount,
      percentage: ((amount / total) * 100).toFixed(1),
      color: colors[index % colors.length],
      legendFontColor: "#333",
      legendFontSize: 12,
      legendFontWeight: "600"
    }));

    return {
      data: chartData,
      total,
      categories: chartData
    };
  }, [filteredTransactions, type]);
};

const ChartTitle: React.FC<{ filter: FilterType }> = ({ filter }) => {
  const title = useMemo(() => {
    switch (filter) {
      case "day": return "Thu chi trong ngày";
      case "week": return "Thu chi trong tuần";
      case "month": return "Thu chi trong tháng";
      case "year": return "Thu chi trong năm";
      default: return "Thu chi";
    }
  }, [filter]);

  return <Text style={styles.chartTitle}>{title}</Text>;
};

const formatAmount = (amount: number) => {
  if (amount >= 1000000000) {
    return (amount / 1000000000).toFixed(1) + ' tỷ';
  }
  if (amount >= 1000000) {
    return (amount / 1000000).toFixed(1) + ' triệu';
  }
  if (amount >= 1000) {
    return (amount / 1000).toFixed(0) + 'k';
  }
  return amount.toString();
};

export const ChartSection: React.FC<ChartSectionProps> = ({
  dailyExpenses,
  filter,
  setFilter,
}) => {
  const chartConfig: AbstractChartConfig = {
    backgroundColor: "#fff",
    backgroundGradientFrom: "#fff",
    backgroundGradientTo: "#fff",
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16
    },
    propsForLabels: {
      fontSize: 14,
      fontWeight: '600'
    },
    propsForDots: {
      r: "6",
      strokeWidth: "2",
      stroke: "#28a745"
    },
    propsForBackgroundLines: {
      strokeDasharray: "", // solid line
      strokeWidth: 1,
      stroke: "#e0e0e0"
    }
  };

  const filteredTransactions = useFilteredTransactions(dailyExpenses, filter);
  const incomeData = useCategoryData(filteredTransactions, 'income');
  const expenseData = useCategoryData(filteredTransactions, 'expense');

  const handleFilterPress = useCallback((newFilter: FilterType) => {
    setFilter(newFilter);
  }, [setFilter]);

  return (
    <>
      <View style={styles.chartContainer}>
        <ChartTitle filter={filter} />
        
        <View style={styles.totalContainer}>
          <View style={styles.totalBlock}>
            <Text style={styles.totalLabel}>Tổng thu</Text>
            <Text style={[styles.totalAmount, { color: '#2ecc71' }]}>
              {formatAmount(incomeData.total)} đ
            </Text>
          </View>
          <View style={styles.totalBlock}>
            <Text style={styles.totalLabel}>Tổng chi</Text>
            <Text style={[styles.totalAmount, { color: '#e74c3c' }]}>
              {formatAmount(expenseData.total)} đ
            </Text>
          </View>
        </View>

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          nestedScrollEnabled={true}
          contentContainerStyle={{ paddingHorizontal: 5, flexGrow: 1 }}
        >
          <View style={{ flexDirection: 'row', paddingVertical: 10, justifyContent: 'space-between' }}>
            {incomeData.data.length > 0 && (
              <View style={{ marginRight: 20, width: 400 }}>
                <Text style={styles.chartSubtitle}>Thu nhập theo danh mục</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <PieChart
                    data={incomeData.data}
                    width={250}
                    height={250}
                    chartConfig={{
                      ...chartConfig,
                      propsForLabels: {
                        ...chartConfig.propsForLabels,
                        fontSize: 14,
                        fontWeight: 'bold'
                      }
                    }}
                    accessor="amount"
                    backgroundColor="transparent"
                    paddingLeft="50"
                    absolute
                    hasLegend={false}
                    avoidFalseZero
                
                  />
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    {incomeData.categories.map((item, index) => (
                      <View key={index} style={[styles.legendItem, { marginBottom: 8 }]}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <View style={[styles.legendColor, { 
                            backgroundColor: item.color,
                            width: 12,
                            height: 12,
                            borderRadius: 6,
                            marginRight: 8
                          }]} />
                          <View style={{ flex: 1 }}>
                            <Text style={[styles.legendCategory, { fontSize: 10, fontWeight: '600' }]}>
                              {item.name}
                            </Text>
                            <Text style={[styles.legendAmount, { fontSize: 10   , color: '#666', marginTop: 1 }]}>
                              {formatAmount(item.amount)}đ ({item.percentage}%)
                            </Text>
                          </View>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            )}
            
            {expenseData.data.length > 0 && (
              <View style={{ width: 400 }}>
                <Text style={styles.chartSubtitle}>Chi tiêu theo danh mục</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <PieChart
                    data={expenseData.data}
                    width={250}
                    height={250}
                    chartConfig={{
                      ...chartConfig,
                      propsForLabels: {
                        ...chartConfig.propsForLabels,
                        fontSize: 12,
                        fontWeight: 'bold'
                      }
                    }}
                    accessor="amount"
                    backgroundColor="transparent"
                    paddingLeft="90"
                    absolute
                    hasLegend={false}
                    avoidFalseZero
                   
                  />
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    {expenseData.categories.map((item, index) => (
                      <View key={index} style={[styles.legendItem, { marginBottom: 8 }]}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <View style={[styles.legendColor, { 
                            backgroundColor: item.color,
                            width: 10,
                            height: 10,
                            borderRadius: 6,
                          
                          }]} />
                          <View style={{ flex: 1 }}>
                            <Text style={[styles.legendCategory, { fontSize: 10, fontWeight: '600' }]}>
                              {item.name}
                            </Text>
                            <Text style={[styles.legendAmount, { fontSize: 10, color: '#666', marginTop: 1 }]}>
                              {formatAmount(item.amount)}đ ({item.percentage}%)
                            </Text>
                          </View>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            )}
          </View>
        </ScrollView>
      </View>

      <View style={styles.filterContainer}>
        {(['day', 'week', 'month', 'year'] as FilterType[]).map((filterType) => (
          <TouchableOpacity
            key={filterType}
            onPress={() => handleFilterPress(filterType)}
            style={[styles.filterButton, filter === filterType && styles.activeFilter]}
          >
            <Text style={[
              styles.filterText,
              filter === filterType && styles.activeFilterText
            ]}>
              {filterType === 'day' ? 'Ngày' :
               filterType === 'week' ? 'Tuần' :
               filterType === 'month' ? 'Tháng' : 'Năm'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </>
  );
}; 
