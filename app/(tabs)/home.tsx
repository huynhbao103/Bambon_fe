import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
} from "react-native";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { BACKEND_URL } from "../../config";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function HomeScreen() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedTransaction, setSelectedTransaction] = useState<any | null>(
    null
  );
  const [visibleTransactions, setVisibleTransactions] = useState<any[]>([]);
  const [showMore, setShowMore] = useState<boolean>(false);
  const [showIncome, setShowIncome] = useState<boolean>(true);
  const [showExpense, setShowExpense] = useState<boolean>(true);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const userId = await AsyncStorage.getItem("userId");
        if (!userId) throw new Error("Không tìm thấy userId");
        const response = await axios.get(`${BACKEND_URL}/transactions/${userId}`);
        setTransactions(response.data);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu giao dịch:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  useEffect(() => {
    if (transactions.length > 0) {
      setVisibleTransactions(transactions.slice(0, 5));
      setShowMore(transactions.length > 5);
    }
  }, [transactions]);

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const handleTransactionPress = (transaction: any) => {
    setSelectedTransaction(transaction);
  };

  const closeModal = () => {
    setSelectedTransaction(null);
  };

  const loadMoreTransactions = () => {
    const nextTransactions = transactions.slice(
      visibleTransactions.length,
      visibleTransactions.length + 5
    );
    setVisibleTransactions((prevTransactions) => [...prevTransactions, ...nextTransactions]);
    if (visibleTransactions.length + nextTransactions.length >= transactions.length) {
      setShowMore(false);
    }
  };

  const toggleIncome = () => {
    setShowIncome(!showIncome);
  };

  const toggleExpense = () => {
    setShowExpense(!showExpense);
  };

  const filteredTransactions = transactions.filter((t) => {
    if (showIncome && showExpense) return true;
    if (showIncome) return t.type === "expense";
    if (showExpense) return t.type === "income";
    return false;
  });

  const handleExpandCollapse = () => {
    setIsExpanded(!isExpanded);
    if (!isExpanded) {
      setVisibleTransactions(transactions);
    } else {
      setVisibleTransactions(transactions.slice(0, 5));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#28a745" />
      {loading ? (
        <ActivityIndicator size="large" color="#28a745" style={styles.loader} />
      ) : (
        <FlatList
          contentContainerStyle={{ flexGrow: 1 }}
          ListHeaderComponent={
            <>
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.headerTop}>
                  <Image
                    source={{ uri: "https://randomuser.me/api/portraits/men/1.jpg" }}
                    style={styles.profileImage}
                  />
                  <View style={styles.userInfo}>
                    <Text style={styles.welcomeText}>Chào mừng,</Text>
                    <Text style={styles.userName}>User</Text>
                  </View>
                  <Ionicons name="search-outline" size={24} color="white" />
                </View>

                {/* Tổng Thu Nhập & Chi Tiêu */}
                <View style={styles.balanceContainer}>
                  <TouchableOpacity onPress={toggleIncome} style={styles.balanceBlock}>
                    <Text style={styles.balanceLabel}>Thu nhập</Text>
                    {showExpense && (
                      <Text style={styles.balanceAmount}>+{totalIncome.toLocaleString()} đ</Text>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity onPress={toggleExpense} style={styles.balanceBlock}>
                    <Text style={styles.balanceLabel}>Chi tiêu</Text>
                    {showIncome && (
                      <Text style={styles.balanceAmount}>{totalExpense.toLocaleString()} đ</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              {/* Transaction List Header */}
              <View style={styles.transactionHeader}>
                <Text style={styles.transactionTitle}>Lịch sử giao dịch</Text>
                {showMore && (
                  <TouchableOpacity onPress={handleExpandCollapse}>
                    <Text style={styles.showMoreText}>
                      {isExpanded ? "Rút gọn" : "Xem tất cả"}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </>
          }
          data={filteredTransactions.slice(0, visibleTransactions.length)}
          keyExtractor={(item) => item._id}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Không có giao dịch nào.</Text>
          }
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handleTransactionPress(item)}>
              <View style={styles.transactionItem}>
                <FontAwesome
                  name={item.type === "income" ? "arrow-up" : "arrow-down"}
                  size={24}
                  color={item.type === "income" ? "#28a745" : "#dc3545"}
                />
                <View style={styles.transactionInfo}>
                  <Text style={styles.transactionCategory}>{item.category}</Text>
                  <Text style={styles.transactionDate}>
                    {item.date ? new Date(item.date).toLocaleDateString() : "N/A"}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.transactionAmount,
                    item.type === "income" ? styles.incomeColor : styles.expenseColor,
                  ]}
                >
                  {item.amount.toLocaleString()} đ
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      {/* Modal to show transaction details */}
      {selectedTransaction && (
        <Modal animationType="slide" transparent={true} visible={!!selectedTransaction} onRequestClose={closeModal}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Chi tiết giao dịch</Text>

              <ScrollView>
                <Text style={styles.modalSubtitle}>Danh sách sản phẩm</Text>
                {selectedTransaction.items && selectedTransaction.items.length > 0 ? (
                  selectedTransaction.items.map((item: any, index: number) => (
                    <View key={index} style={styles.modalItem}>
                      <Text>{item.productName}</Text>
                      <Text>{item.quantity} x {item.price.toLocaleString()} đ</Text>
                    </View>
                  ))
                ) : (
                  <Text>Không có sản phẩm nào.</Text>
                )}
                <Text style={styles.modalTotal}>
                  Tổng cộng: {selectedTransaction.amount.toLocaleString()} đ
                </Text>
              </ScrollView>

              <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>Đóng</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f7f7f7" },
  loader: { marginTop: 10 },
  header: { backgroundColor: "#28a745", padding: 20, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  headerTop: { flexDirection: "row", alignItems: "center" },
  profileImage: { width: 50, height: 50, borderRadius: 25 },
  userInfo: { marginLeft: 10, flex: 1 },
  welcomeText: { color: "#fff" },
  userName: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  balanceContainer: { flexDirection: "row", justifyContent: "space-between", marginTop: 15 },
  balanceBlock: { flex: 1 },
  balanceLabel: { color: "#fff" },
  balanceAmount: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  transactionHeader: { flexDirection: "row", justifyContent: "space-between", padding: 15 },
  transactionTitle: { fontSize: 18, fontWeight: "bold" },
  showMoreText: { color: "#007bff" },
  emptyText: { textAlign: "center", color: "#888", marginTop: 10 },
  transactionItem: { flexDirection: "row", alignItems: "center", padding: 15 },
  transactionInfo: { flex: 1, marginLeft: 10 },
  transactionCategory: { fontWeight: "bold" },
  transactionDate: { color: "#888" },
  transactionAmount: { fontWeight: "bold" },
  incomeColor: { color: "#28a745" },
  expenseColor: { color: "#dc3545" },
  modalContainer: { flex: 1, justifyContent: "center", backgroundColor: "rgba(0,0,0,0.5)" },
  modalContent: { backgroundColor: "#fff", borderRadius: 10, margin: 20, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  modalSubtitle: { fontWeight: "bold", marginBottom: 5 },
  modalItem: { flexDirection: "row", justifyContent: "space-between", marginBottom: 5 },
  modalTotal: { fontWeight: "bold", fontSize: 16, marginTop: 10 },
  closeButton: { backgroundColor: "#28a745", padding: 10, alignItems: "center", marginTop: 15, borderRadius: 5 },
  closeButtonText: { color: "#fff", fontWeight: "bold" },
});
