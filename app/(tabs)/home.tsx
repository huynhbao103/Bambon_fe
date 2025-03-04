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
  TextInput,
  Alert,
  Dimensions,
} from "react-native";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { BACKEND_URL } from "../../config";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StackNavigationProp } from "@react-navigation/stack";
import { BarChart } from "react-native-chart-kit";
import BudgetScreen from "./BudgetScreen";
import { AbstractChartConfig } from "react-native-chart-kit/dist/AbstractChart";

type RootStackParamList = {
  HomeScreen: undefined;
  BudgetScreen: undefined;
};

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, "HomeScreen">;

interface HomeScreenProps {
  navigation: HomeScreenNavigationProp;
}

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any | null>(null);
  const [visibleTransactions, setVisibleTransactions] = useState<any[]>([]);
  const [showMore, setShowMore] = useState<boolean>(false);
  const [showIncome, setShowIncome] = useState<boolean>(true);
  const [showExpense, setShowExpense] = useState<boolean>(true);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editedTransaction, setEditedTransaction] = useState<any>(null);
  const [budget, setBudget] = useState<number | null>(null);
  const [budgetWarningShown, setBudgetWarningShown] = useState<boolean>(false);
  const [isBudgetModalVisible, setIsBudgetModalVisible] = useState<boolean>(false);
  const [filter, setFilter] = useState<"day" | "week" | "month" | "year">("month");

  const fetchTransactionsAndBudget = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) throw new Error("Không tìm thấy userId");

      const transactionsResponse = await axios.get(`${BACKEND_URL}/transactions/${userId}`);
      setTransactions(transactionsResponse.data);

      const budgetResponse = await axios.get(`${BACKEND_URL}/budget/${userId}`);
      if (budgetResponse.data.budget) {
        setBudget(budgetResponse.data.budget);
      }
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterTransactionsByTime = (transactions: any[]) => {
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
      setVisibleTransactions(filteredTransactions.slice(0, 5));
      setShowMore(filteredTransactions.length > 5);

      if (budget && !budgetWarningShown) {
        const totalExpense = filteredTransactions
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
  }, [transactions, budget, budgetWarningShown, filter]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTransactionsAndBudget();
  };

  const totalIncome = filteredTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = filteredTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const savings = budget ? budget - totalExpense : totalIncome - totalExpense;

  const handleTransactionPress = (transaction: any) => {
    setSelectedTransaction(transaction);
    setEditedTransaction({ ...transaction, items: transaction.items || [] });
    setIsEditing(false);
  };

  const closeModal = () => {
    setSelectedTransaction(null);
    setIsEditing(false);
  };

  const loadMoreTransactions = () => {
    const nextTransactions = filteredTransactions.slice(
      visibleTransactions.length,
      visibleTransactions.length + 5
    );
    setVisibleTransactions((prevTransactions) => [...prevTransactions, ...nextTransactions]);
    if (visibleTransactions.length + nextTransactions.length >= filteredTransactions.length) {
      setShowMore(false);
    }
  };

  const toggleIncome = () => {
    setShowIncome(!showIncome);
  };

  const toggleExpense = () => {
    setShowExpense(!showExpense);
  };

  const handleExpandCollapse = () => {
    setIsExpanded(!isExpanded);
    if (!isExpanded) {
      setVisibleTransactions(filteredTransactions);
    } else {
      setVisibleTransactions(filteredTransactions.slice(0, 5));
    }
  };

  // Sửa updateTransaction
  const updateTransaction = async () => {
    try {
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
      fetchTransactionsAndBudget(); // Làm mới danh sách giao dịch
    } catch (error) {
      console.error("Lỗi khi sửa giao dịch:");
      Alert.alert(
        "Lỗi",
       "Không thể cập nhật giao dịch. Vui lòng thử lại!"
      );
    }
  };

  // Sửa deleteTransaction
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
              fetchTransactionsAndBudget(); // Làm mới danh sách giao dịch
            } catch (error) {
              console.error("Lỗi khi xóa giao dịch:");
              Alert.alert(
                "Lỗi",
                 "Không thể xóa giao dịch. Vui lòng thử lại!"
              );
            }
          },
        },
      ]
    );
  };

  const addItem = () => {
    setEditedTransaction({
      ...editedTransaction,
      items: [...(editedTransaction.items || []), { productName: "", quantity: 0, price: 0 }],
    });
  };

  const removeItem = (index: number) => {
    const newItems = editedTransaction.items.filter((_: any, i: number) => i !== index);
    setEditedTransaction({ ...editedTransaction, items: newItems });
  };

  const updateItem = (index: number, field: string, value: string | number) => {
    const newItems = [...editedTransaction.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setEditedTransaction({ ...editedTransaction, items: newItems });
  };

  const handleBudgetSaved = () => {
    setIsBudgetModalVisible(false);
    fetchTransactionsAndBudget();
  };

  const chartData = {
    labels: ["Thu nhập", "Chi tiêu", "Tiết kiệm"],
    datasets: [
      {
        data: [totalIncome, totalExpense, savings > 0 ? savings : 0],
      },
    ],
  };

  const chartConfig: AbstractChartConfig = {
    backgroundColor: "#fff",
    backgroundGradientFrom: "#fff",
    backgroundGradientTo: "#fff",
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(40, 167, 69, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
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
                  <TouchableOpacity onPress={() => setIsBudgetModalVisible(true)}>
                    <Ionicons name="settings-outline" size={24} color="white" />
                  </TouchableOpacity>
                </View>
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
                {budget && (
                  <View style={styles.budgetContainer}>
                    <Text style={styles.budgetText}>
                      Ngân sách: {budget.toLocaleString()} đ | Còn lại: {(budget - totalExpense).toLocaleString()} đ
                    </Text>
                  </View>
                )}
                <View style={styles.chartContainer}>
                  <Text style={styles.chartTitle}>Tổng quan tài chính ({filter})</Text>
                  <BarChart
                    data={chartData}
                    width={Dimensions.get("window").width - 60}
                    height={220}
                    yAxisLabel="đ"
                    yAxisSuffix=""
                    chartConfig={chartConfig}
                    style={styles.chart}
                  />
                </View>
                <View style={styles.filterContainer}>
                  <TouchableOpacity
                    onPress={() => setFilter("day")}
                    style={[styles.filterButton, filter === "day" && styles.activeFilter]}
                  >
                    <Text style={styles.filterText}>Ngày</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setFilter("week")}
                    style={[styles.filterButton, filter === "week" && styles.activeFilter]}
                  >
                    <Text style={styles.filterText}>Tuần</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setFilter("month")}
                    style={[styles.filterButton, filter === "month" && styles.activeFilter]}
                  >
                    <Text style={styles.filterText}>Tháng</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setFilter("year")}
                    style={[styles.filterButton, filter === "year" && styles.activeFilter]}
                  >
                    <Text style={styles.filterText}>Năm</Text>
                  </TouchableOpacity>
                </View>
              </View>
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
          data={visibleTransactions}
          keyExtractor={(item) => item._id}
          ListEmptyComponent={<Text style={styles.emptyText}>Không có giao dịch nào.</Text>}
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
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={isBudgetModalVisible}
        onRequestClose={() => setIsBudgetModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <BudgetScreen onBudgetSaved={handleBudgetSaved} />
          <TouchableOpacity
            style={styles.closeModalButton}
            onPress={() => setIsBudgetModalVisible(false)}
          >
            <Text style={styles.closeModalText}>Đóng</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {selectedTransaction && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={!!selectedTransaction}
          onRequestClose={closeModal}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                {isEditing ? "Sửa giao dịch" : "Chi tiết giao dịch"}
              </Text>
              <ScrollView>
                {isEditing ? (
                  <View style={styles.editContainer}>
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Loại giao dịch</Text>
                      <TextInput
                        style={styles.input}
                        value={editedTransaction.type}
                        onChangeText={(text) =>
                          setEditedTransaction({ ...editedTransaction, type: text })
                        }
                        placeholder="Nhập loại (income/expense)"
                      />
                    </View>
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Danh mục</Text>
                      <TextInput
                        style={styles.input}
                        value={editedTransaction.category}
                        onChangeText={(text) =>
                          setEditedTransaction({ ...editedTransaction, category: text })
                        }
                        placeholder="Nhập danh mục"
                      />
                    </View>
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Số tiền (VNĐ)</Text>
                      <TextInput
                        style={styles.input}
                        value={editedTransaction.amount.toString()}
                        keyboardType="numeric"
                        onChangeText={(text) =>
                          setEditedTransaction({ ...editedTransaction, amount: parseInt(text) || 0 })
                        }
                        placeholder="Nhập số tiền"
                      />
                    </View>
                    <Text style={styles.sectionTitle}>Danh sách sản phẩm</Text>
                    {editedTransaction.items.map((item: any, index: number) => (
                      <View key={index} style={styles.itemCard}>
                        <View style={styles.itemField}>
                          <Text style={styles.itemLabel}>Tên sản phẩm</Text>
                          <TextInput
                            style={styles.itemInput}
                            value={item.productName}
                            onChangeText={(text) => updateItem(index, "productName", text)}
                            placeholder="Tên sản phẩm"
                          />
                        </View>
                        <View style={styles.itemField}>
                          <Text style={styles.itemLabel}>Số lượng</Text>
                          <TextInput
                            style={styles.itemInput}
                            value={item.quantity.toString()}
                            keyboardType="numeric"
                            onChangeText={(text) =>
                              updateItem(index, "quantity", parseInt(text) || 0)
                            }
                            placeholder="Số lượng"
                          />
                        </View>
                        <View style={styles.itemField}>
                          <Text style={styles.itemLabel}>Giá (VNĐ)</Text>
                          <TextInput
                            style={styles.itemInput}
                            value={item.price.toString()}
                            keyboardType="numeric"
                            onChangeText={(text) =>
                              updateItem(index, "price", parseInt(text) || 0)
                            }
                            placeholder="Giá"
                          />
                        </View>
                        <TouchableOpacity
                          onPress={() => removeItem(index)}
                          style={styles.removeItemButton}
                        >
                          <Ionicons name="trash-outline" size={20} color="#fff" />
                        </TouchableOpacity>
                      </View>
                    ))}
                    <TouchableOpacity onPress={addItem} style={styles.addItemButton}>
                      <Text style={styles.buttonText}>+ Thêm sản phẩm</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <>
                    <Text style={styles.sectionTitle}>Danh sách sản phẩm</Text>
                    {selectedTransaction.items && selectedTransaction.items.length > 0 ? (
                      selectedTransaction.items.map((item: any, index: number) => (
                        <View key={index} style={styles.modalItem}>
                          <Text style={styles.itemText}>{item.productName}</Text>
                          <Text style={styles.itemText}>
                            {item.quantity} x {item.price.toLocaleString()} đ
                          </Text>
                        </View>
                      ))
                    ) : (
                      <Text style={styles.noItemsText}>Không có sản phẩm nào.</Text>
                    )}
                    <Text style={styles.modalTotal}>
                      Tổng cộng: {selectedTransaction.amount.toLocaleString()} đ
                    </Text>
                  </>
                )}
              </ScrollView>
              <View style={styles.modalButtons}>
                {isEditing ? (
                  <>
                    <TouchableOpacity onPress={updateTransaction} style={styles.saveButton}>
                      <Text style={styles.buttonText}>Lưu</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setIsEditing(false)}
                      style={styles.cancelButton}
                    >
                      <Text style={styles.buttonText}>Hủy</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <TouchableOpacity
                      onPress={() => setIsEditing(true)}
                      style={styles.editButton}
                    >
                      <Text style={styles.buttonText}>Sửa</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => deleteTransaction(selectedTransaction._id)}
                      style={styles.deleteButton}
                    >
                      <Text style={styles.buttonText}>Xóa</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                      <Text style={styles.closeButtonText}>Đóng</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
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
  budgetContainer: { marginTop: 10, alignItems: "center" },
  budgetText: { color: "#fff", fontSize: 14, fontWeight: "500" },
  chartContainer: { marginTop: 20, alignItems: "center" },
  chartTitle: { fontSize: 16, fontWeight: "bold", color: "#fff", marginBottom: 10 },
  chart: { borderRadius: 16 },
  filterContainer: { flexDirection: "row", justifyContent: "space-around", marginTop: 15, marginBottom: 10 },
  filterButton: { paddingVertical: 8, paddingHorizontal: 15, borderRadius: 20, backgroundColor: "#e9ecef" },
  activeFilter: { backgroundColor: "#fff" },
  filterText: { color: "#333", fontWeight: "500" },
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
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 15,
    margin: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 15, color: "#333" },
  sectionTitle: { fontSize: 16, fontWeight: "600", marginBottom: 10, color: "#444" },
  editContainer: { paddingBottom: 10 },
  inputGroup: { marginBottom: 15 },
  inputLabel: { fontSize: 14, fontWeight: "500", color: "#555", marginBottom: 5 },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
    fontSize: 16,
  },
  itemCard: {
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  itemField: { marginBottom: 10 },
  itemLabel: { fontSize: 14, fontWeight: "500", color: "#555", marginBottom: 5 },
  itemInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#fff",
    fontSize: 16,
  },
  modalItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  itemText: { fontSize: 14, color: "#333" },
  modalTotal: { fontWeight: "bold", fontSize: 16, marginTop: 15, color: "#333" },
  noItemsText: { fontSize: 14, color: "#888", textAlign: "center" },
  modalButtons: { flexDirection: "row", justifyContent: "space-between", marginTop: 20 },
  saveButton: { backgroundColor: "#28a745", paddingVertical: 12, paddingHorizontal: 20, borderRadius: 8, flex: 1, marginRight: 5 },
  cancelButton: { backgroundColor: "#6c757d", paddingVertical: 12, paddingHorizontal: 20, borderRadius: 8, flex: 1, marginLeft: 5 },
  editButton: { backgroundColor: "#007bff", paddingVertical: 12, paddingHorizontal: 20, borderRadius: 8, flex: 1, marginRight: 5 },
  deleteButton: { backgroundColor: "#dc3545", paddingVertical: 12, paddingHorizontal: 20, borderRadius: 8, flex: 1, marginHorizontal: 5 },
  closeButton: { backgroundColor: "#28a745", paddingVertical: 12, paddingHorizontal: 20, borderRadius: 8, flex: 1, marginLeft: 5 },
  addItemButton: {
    backgroundColor: "#17a2b8",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  removeItemButton: {
    backgroundColor: "#dc3545",
    padding: 8,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 5,
  },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16, textAlign: "center" },
  closeButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  closeModalButton: {
    backgroundColor: "#dc3545",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    margin: 20,
  },
  closeModalText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});