import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { styles } from '../styles';
import { FilterType } from '../types';

interface TransactionListProps {
  transactions: any[];
  onTransactionPress: (transaction: any) => void;
  filter: FilterType;
  onLoadMore?: () => void;
  loadingMore?: boolean;
  showMore: boolean;
  isExpanded: boolean;
  handleExpandCollapse: () => void;
  refreshing: boolean;
  onRefresh: () => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  onTransactionPress,
  filter,
  onLoadMore,
  loadingMore,
  showMore,
  isExpanded,
  handleExpandCollapse,
  refreshing,
  onRefresh
}) => {
  const isDateInRange = (transactionDate: string) => {
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

  const filteredTransactions = transactions
    .filter(t => isDateInRange(t.date))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

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

  if (filteredTransactions.length === 0) {
    return (
      <View style={{ padding: 20 }}>
        <Text style={styles.emptyText}>Không có giao dịch nào trong khoảng thời gian này</Text>
      </View>
    );
  }

  return (
    <ScrollView
      nestedScrollEnabled={true}
      showsVerticalScrollIndicator={false}
      onScroll={({ nativeEvent }) => {
        const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
        const isEndReached = layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;
        
        if (isEndReached && onLoadMore && !loadingMore) {
          onLoadMore();
        }
      }}
      scrollEventThrottle={400}
    >
      {filteredTransactions.map((transaction, index) => (
        <TouchableOpacity
          key={index}
          style={styles.transactionItem}
          onPress={() => onTransactionPress(transaction)}
        >
          <View style={styles.transactionInfo}>
            <Text style={styles.transactionCategory}>{transaction.category}</Text>
            <Text style={styles.transactionDate}>
              {new Date(transaction.date).toLocaleDateString('vi-VN')}
            </Text>
          </View>
          <Text
            style={[
              styles.transactionAmount,
              transaction.type === 'income' ? styles.incomeColor : styles.expenseColor
            ]}
          >
            {transaction.type === 'income' ? '+' : '-'}{formatAmount(transaction.amount)}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};