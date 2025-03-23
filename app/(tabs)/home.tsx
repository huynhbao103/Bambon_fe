import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  ActivityIndicator,
  Modal,
  SafeAreaView,
  StatusBar,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { BACKEND_URL } from "../../config";
import { styles } from "../styles";
import { HomeScreenProps, Transaction, FilterType } from "../types";
import { Header } from "../components/Header";
import { ChartSection } from "../components/ChartSection";
import { TransactionList } from "../components/TransactionList";
import { TransactionModal } from "../components/TransactionModal";
import { SettingsModal } from "../components/SettingsModal";

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const ITEMS_PER_PAGE = 10;
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [visibleTransactions, setVisibleTransactions] = useState<Transaction[]>([]);
  const [showMore, setShowMore] = useState<boolean>(false);
  const [showIncome, setShowIncome] = useState<boolean>(true);
  const [showExpense, setShowExpense] = useState<boolean>(true);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editedTransaction, setEditedTransaction] = useState<Transaction | null>(null);
  const [budget, setBudget] = useState<number | null>(null);
  const [budgetWarningShown, setBudgetWarningShown] = useState<boolean>(false);
  const [isSettingsModalVisible, setIsSettingsModalVisible] = useState<boolean>(false);
  const [filter, setFilter] = useState<FilterType>("month");
  const [dailyExpenses, setDailyExpenses] = useState<{ date: string; amount: number; type: 'income' | 'expense', category: string }[]>([]);

  const fetchTransactionsAndBudget = async (pageNumber = 1, shouldRefresh = false) => {
    try {
      const token = await AsyncStorage.getItem("token");
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) throw new Error("Không tìm thấy userId");

      const transactionsResponse = await axios.get(`${BACKEND_URL}/transactions/${userId}?page=${pageNumber}&limit=${ITEMS_PER_PAGE}`);
      
      if (shouldRefresh) {
        setTransactions(transactionsResponse.data);
      } else {
        setTransactions(prev => [...prev, ...transactionsResponse.data]);
      }
      
      setHasMore(transactionsResponse.data.length === ITEMS_PER_PAGE);

      if (pageNumber === 1) {
        const budgetResponse = await axios.get(`${BACKEND_URL}/budget/${userId}`);
        if (budgetResponse.data.budget) {
          setBudget(budgetResponse.data.budget);
        }
      }
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  const filterTransactionsByTime = (transactions: Transaction[]) => {
    const now = new Date();
    return transactions.filter((t) => {
      const transactionDate = new Date(t.date);
      switch (filter) {
        case "day":
          return (
            transactionDate.getDate() === now.getDate() &&
            transactionDate.getMonth() === now.getMonth() &&
            transactionDate.getFullYear() === now.getFullYear()
          );
        case "week":
          const startOfWeek = new Date(now);
          startOfWeek.setDate(now.getDate() - now.getDay());
          return transactionDate >= startOfWeek;
        case "month":
          return (
            transactionDate.getMonth() === now.getMonth() &&
            transactionDate.getFullYear() === now.getFullYear()
          );
        case "year":
          return transactionDate.getFullYear() === now.getFullYear();
        default:
          return true;
      }
    });
  };

  const filteredTransactions = filterTransactionsByTime(transactions).filter((t) => {
    if (showIncome && showExpense) return true;
    if (showIncome) return t.type === "expense";
    if (showExpense) return t.type === "income";
    return false;
  });

  useEffect(() => {
    fetchTransactionsAndBudget();
  }, []);

  useEffect(() => {
    if (transactions.length > 0) {
      const filteredData = filterTransactionsByTime(transactions).filter((t) => {
        if (showIncome && showExpense) return true;
        if (showIncome) return t.type === "expense";
        if (showExpense) return t.type === "income";
        return false;
      });

      if (isExpanded) {
        setVisibleTransactions(filteredData);
      } else {
        setVisibleTransactions(filteredData.slice(0, 5));
      }
      setShowMore(filteredData.length > 5);

      if (budget && !budgetWarningShown) {
        const totalExpense = filteredData
          .filter((t) => t.type === "expense")
          .reduce((sum, t) => sum + t.amount, 0);
        const budgetThreshold = budget * 0.8;
        if (totalExpense >= budgetThreshold) {
          Alert.alert(
            "Cảnh báo ngân sách",
            `Bạn đã chi ${totalExpense.toLocaleString()} đ, sắp đạt giới hạn ngân sách (${budget.toLocaleString()} đ)!`,
            [{ text: "OK", onPress: () => setBudgetWarningShown(true) }]
          );
        }
      }
    }
  }, [transactions, budget, budgetWarningShown, filter, showIncome, showExpense, isExpanded]);

  const onRefresh = () => {
    setRefreshing(true);
    setPage(1);
    fetchTransactionsAndBudget(1, true);
  };

  const loadMoreTransactions = () => {
    if (!loadingMore && hasMore) {
      setLoadingMore(true);
      const nextPage = page + 1;
      setPage(nextPage);
      fetchTransactionsAndBudget(nextPage);
    }
  };

  const totalIncome = filteredTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = filteredTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const savings = budget ? budget - totalExpense : totalIncome - totalExpense;

  const handleTransactionPress = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setEditedTransaction({ ...transaction, items: transaction.items || [] });
    setIsEditing(false);
  };

  const closeModal = () => {
    setSelectedTransaction(null);
    setIsEditing(false);
  };

  const handleExpandCollapse = () => {
    setIsExpanded(!isExpanded);
  };

  const toggleIncome = () => {  

    setShowIncome(!showIncome);
  };

  const toggleExpense = () => {
    setShowExpense(!showExpense);

  };

  const updateTransaction = async () => {
    try {
      if (!editedTransaction) return;
      const response = await axios.put(
        `${BACKEND_URL}/transactions/${editedTransaction._id}`,
        editedTransaction
      );
      const updatedTransaction = response.data;
      setTransactions((prev) =>
        prev.map((t) => (t._id === updatedTransaction._id ? updatedTransaction : t))
      );
      setSelectedTransaction(updatedTransaction);
      setIsEditing(false);
      Alert.alert("Thành công", "Giao dịch đã được cập nhật!");
      fetchTransactionsAndBudget();
    } catch (error) {
      console.error("Lỗi khi sửa giao dịch:", error);
      Alert.alert("Lỗi", "Không thể cập nhật giao dịch. Vui lòng thử lại!");
    }
  };

  const deleteTransaction = async (transactionId: string) => {
    Alert.alert(
      "Xác nhận xóa",
      "Bạn có chắc muốn xóa giao dịch này?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            try {
              await axios.delete(`${BACKEND_URL}/transactions/${transactionId}`);
              setTransactions((prev) => prev.filter((t) => t._id !== transactionId));
              setSelectedTransaction(null);
              Alert.alert("Thành công", "Giao dịch đã được xóa!");
              fetchTransactionsAndBudget();
            } catch (error) {
              console.error("Lỗi khi xóa giao dịch:", error);
              Alert.alert("Lỗi", "Không thể xóa giao dịch. Vui lòng thử lại!");
            }
          },
        },
      ]
    );
  };

  const addItem = () => {
    if (!editedTransaction) return;
    setEditedTransaction({
      ...editedTransaction,
      items: [...(editedTransaction.items || []), { productName: "", quantity: 0, price: 0 }],
    });
  };

  const removeItem = (index: number) => {
    if (!editedTransaction) return;
    const newItems = editedTransaction.items?.filter((_, i) => i !== index) || [];
    setEditedTransaction({ ...editedTransaction, items: newItems });
  };

  const updateItem = (index: number, field: string, value: string | number) => {
    if (!editedTransaction) return;
    const newItems = [...(editedTransaction.items || [])];
    newItems[index] = { ...newItems[index], [field]: value };
    setEditedTransaction({ ...editedTransaction, items: newItems });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#28a745" />
      {loading ? (
        <ActivityIndicator size="large" color="#28a745" style={styles.loader} />
      ) : (
        <ScrollView 
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#28a745"]}
              tintColor="#28a745"
            />
          }
        >
          <Header
            totalIncome={totalIncome}
            totalExpense={totalExpense}
            budget={budget}
            showIncome={showIncome}
            showExpense={showExpense}
            toggleIncome={toggleIncome}
            toggleExpense={toggleExpense}
            onSettingsPress={() => setIsSettingsModalVisible(true)}
          />
          <ChartSection
            dailyExpenses={transactions.map(t => ({
              date: t.date,
              amount: t.amount,
              type: t.type,
              category: t.category
            }))}
            filter={filter}
            setFilter={setFilter}
          />
          <View style={styles.transactionListContainer}>
            <View style={styles.transactionHeader}>
              <Text style={styles.transactionTitle}>Giao dịch gần đây</Text>
              <TouchableOpacity onPress={() => setIsExpanded(!isExpanded)}>
                <Text style={styles.showMoreText}>{isExpanded ? 'Thu gọn' : 'Xem thêm'}</Text>
              </TouchableOpacity>
            </View>

            <TransactionList
              transactions={visibleTransactions}
              onTransactionPress={handleTransactionPress}
              showMore={showMore}
              isExpanded={isExpanded}
              handleExpandCollapse={handleExpandCollapse}
              refreshing={refreshing}
              onRefresh={onRefresh}
              onLoadMore={loadMoreTransactions}
              loadingMore={loadingMore}
              filter={filter}
            />
          </View>
          <TransactionModal
            selectedTransaction={selectedTransaction}
            isEditing={isEditing}
            editedTransaction={editedTransaction}
            onClose={closeModal}
            onEdit={() => setIsEditing(true)}
            onDelete={deleteTransaction}
            onSave={updateTransaction}
            onCancel={() => setIsEditing(false)}
            setEditedTransaction={setEditedTransaction}
            addItem={addItem}
            removeItem={removeItem}
            updateItem={updateItem}
          />
          {/* Settings Modal */}
          <SettingsModal
            visible={isSettingsModalVisible}
            onClose={() => setIsSettingsModalVisible(false)}
            totalExpense={totalExpense}
            transactions={transactions}
            onBudgetSaved={() => {
              fetchTransactionsAndBudget(1, true);
            }}
            navigation={navigation}
          />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}