import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { styles } from '../../styles';
import { FilterType } from '../../types';
import { isDateInRange, formatAmount } from './TransactionUtils';

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
  onRefresh,
}) => {
  const filteredTransactions = transactions.filter((t) => isDateInRange(t.date, filter));

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
              transaction.type === 'income' ? styles.incomeColor : styles.expenseColor,
            ]}
          >
            {transaction.type === 'income' ? '+' : '-'}{formatAmount(transaction.amount)}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};
