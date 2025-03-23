import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BACKEND_URL } from "../../config";
import { Button } from "@ant-design/react-native";

// Định nghĩa kiểu cho props
interface BudgetScreenProps {
  onBudgetSaved?: () => void;
  totalExpense?: number; // Tổng chi tiêu từ HomeScreen
  transactions?: any[]; // Giao dịch từ HomeScreen
}

export default function BudgetScreen({ onBudgetSaved, totalExpense, transactions = [] }: BudgetScreenProps) {
  const [userId, setUserId] = useState<string | null>(null);
  const [weeklyBudget, setWeeklyBudget] = useState<string>("");
  const [monthlyBudget, setMonthlyBudget] = useState<string>("");
  const [yearlyBudget, setYearlyBudget] = useState<string>("");
  const [currentBudgets, setCurrentBudgets] = useState<{
    weeklyBudget: number | null;
    monthlyBudget: number | null;
    yearlyBudget: number | null;
  }>({
    weeklyBudget: null,
    monthlyBudget: null,
    yearlyBudget: null,
  });
  const [spentAmounts, setSpentAmounts] = useState<{
    weeklySpent: number;
    monthlySpent: number;
    yearlySpent: number;
  }>({
    weeklySpent: 0,
    monthlySpent: 0,
    yearlySpent: 0,
  });
  const [localTransactions, setLocalTransactions] = useState<any[]>(transactions);

  // Hàm format số tiền
  const formatCurrency = (value: string) => {
    // Chỉ cho phép số
    const numericValue = value.replace(/[^0-9]/g, '');
    
    // Chuyển đổi sang số và format
    const number = parseInt(numericValue) || 0;
    return number.toLocaleString('vi-VN');
  };

  // Hàm xử lý khi thay đổi giá trị input
  const handleBudgetChange = (value: string, setter: (value: string) => void) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    setter(numericValue);
  };

  // Hàm để tính toán chi tiêu trong các khoảng thời gian
  const calculateSpentAmounts = (transactions: any[]) => {
    const now = new Date();
    // Lấy ngày đầu tuần (Chủ nhật)
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    // Lấy ngày đầu tháng
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Lấy ngày đầu năm
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    
    // Lọc các giao dịch chi tiêu
    const expenseTransactions = transactions.filter(t => t.type === "expense");
    
    // Tính toán chi tiêu theo từng khoảng thời gian
    const weeklySpent = expenseTransactions
      .filter(t => new Date(t.date) >= startOfWeek)
      .reduce((sum, t) => sum + t.amount, 0);
      
    const monthlySpent = expenseTransactions
      .filter(t => new Date(t.date) >= startOfMonth)
      .reduce((sum, t) => sum + t.amount, 0);
      
    const yearlySpent = expenseTransactions
      .filter(t => new Date(t.date) >= startOfYear)
      .reduce((sum, t) => sum + t.amount, 0);
    
    setSpentAmounts({
      weeklySpent,
      monthlySpent,
      yearlySpent
    });
  };

  useEffect(() => {
    const fetchUserIdAndBudget = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem("userId");
        if (storedUserId) {
          setUserId(storedUserId);
          const response = await axios.get(`${BACKEND_URL}/budget/${storedUserId}`);
          if (response.data) {
            setCurrentBudgets({
              weeklyBudget: response.data.weeklyBudget || null,
              monthlyBudget: response.data.monthlyBudget || null,
              yearlyBudget: response.data.yearlyBudget || null,
            });
            setWeeklyBudget(response.data.weeklyBudget?.toString() || "");
            setMonthlyBudget(response.data.monthlyBudget?.toString() || "");
            setYearlyBudget(response.data.yearlyBudget?.toString() || "");
          }
          
          // Nếu không có transactions từ props, lấy dữ liệu giao dịch từ backend
          if (localTransactions.length === 0) {
            const transactionsResponse = await axios.get(`${BACKEND_URL}/transactions/${storedUserId}`);
            if (transactionsResponse.data) {
              setLocalTransactions(transactionsResponse.data);
              calculateSpentAmounts(transactionsResponse.data);
            }
          } else {
            // Nếu có transactions từ props, dùng để tính toán
            calculateSpentAmounts(localTransactions);
          }
        } else {
          throw new Error("Không tìm thấy userId");
        }
      } catch (error) {
        console.error("Lỗi khi lấy thông tin:", error);
      }
    };
    fetchUserIdAndBudget();
  }, []);

  // Sử dụng thông tin từ props khi có sự thay đổi
  useEffect(() => {
    if (transactions && transactions.length > 0) {
      setLocalTransactions(transactions);
      calculateSpentAmounts(transactions);
    }
  }, [transactions]);

  // Kiểm tra vượt ngân sách
  useEffect(() => {
    const checkBudgetOverflow = () => {
      if (currentBudgets.weeklyBudget && spentAmounts.weeklySpent > currentBudgets.weeklyBudget) {
        Alert.alert(
          "Cảnh báo",
          `Bạn đã vượt quá ngân sách tuần!\nĐã chi: ${spentAmounts.weeklySpent.toLocaleString('vi-VN')} đ\nNgân sách: ${currentBudgets.weeklyBudget.toLocaleString('vi-VN')} đ`
        );
      }
      if (currentBudgets.monthlyBudget && spentAmounts.monthlySpent > currentBudgets.monthlyBudget) {
        Alert.alert(
          "Cảnh báo",
          `Bạn đã vượt quá ngân sách tháng!\nĐã chi: ${spentAmounts.monthlySpent.toLocaleString('vi-VN')} đ\nNgân sách: ${currentBudgets.monthlyBudget.toLocaleString('vi-VN')} đ`
        );
      }
      if (currentBudgets.yearlyBudget && spentAmounts.yearlySpent > currentBudgets.yearlyBudget) {
        Alert.alert(
          "Cảnh báo",
          `Bạn đã vượt quá ngân sách năm!\nĐã chi: ${spentAmounts.yearlySpent.toLocaleString('vi-VN')} đ\nNgân sách: ${currentBudgets.yearlyBudget.toLocaleString('vi-VN')} đ`
        );
      }
    };

    checkBudgetOverflow();
  }, [spentAmounts, currentBudgets]);

  // Hàm xóa ngân sách
  const deleteBudget = (type: 'weekly' | 'monthly' | 'yearly') => {
    Alert.alert(
      "Xác nhận xóa",
      `Bạn có chắc chắn muốn xóa ngân sách ${type === 'weekly' ? 'tuần' : type === 'monthly' ? 'tháng' : 'năm'} không?`,
      [
        { text: "Hủy", style: "cancel" },
        { 
          text: "Xóa", 
          style: "destructive",
          onPress: async () => {
            try {
              // Tạo bản sao của ngân sách hiện tại
              const updatedBudgets = { ...currentBudgets };
              
              // Đặt giá trị ngân sách tương ứng thành null
              updatedBudgets[`${type}Budget`] = null;
              
              // Cập nhật state
              setCurrentBudgets(updatedBudgets);
              
              // Đặt lại giá trị input tương ứng
              if (type === 'weekly') setWeeklyBudget("");
              if (type === 'monthly') setMonthlyBudget("");
              if (type === 'yearly') setYearlyBudget("");
              
              // Gửi yêu cầu cập nhật lên server
              await axios.post(`${BACKEND_URL}/budget`, {
                userId,
                weeklyBudget: type === 'weekly' ? null : currentBudgets.weeklyBudget,
                monthlyBudget: type === 'monthly' ? null : currentBudgets.monthlyBudget,
                yearlyBudget: type === 'yearly' ? null : currentBudgets.yearlyBudget,
              });
              
              Alert.alert("Thành công", "Đã xóa ngân sách!");
              
              if (onBudgetSaved) {
                onBudgetSaved();
              }
            } catch (error) {
              console.error("Lỗi khi xóa ngân sách:", error);
              Alert.alert("Lỗi", "Không thể xóa ngân sách. Vui lòng thử lại!");
            }
          }
        }
      ]
    );
  };

  const saveBudget = async () => {
    // Chuyển đổi các giá trị sang số, nếu không nhập thì giữ nguyên giá trị cũ
    // Nếu giá trị là 0 hoặc rỗng, đặt thành null (không có ngân sách)
    const weekly = weeklyBudget ? (parseInt(weeklyBudget) || null) : currentBudgets.weeklyBudget;
    const monthly = monthlyBudget ? (parseInt(monthlyBudget) || null) : currentBudgets.monthlyBudget;
    const yearly = yearlyBudget ? (parseInt(yearlyBudget) || null) : currentBudgets.yearlyBudget;

    // Kiểm tra xem có ít nhất 1 ngân sách hợp lệ không
    if (weekly === null && monthly === null && yearly === null) {
      Alert.alert("Lỗi", "Vui lòng nhập ít nhất một loại ngân sách hợp lệ!");
      return;
    }

    // Kiểm tra tính hợp lệ của các giá trị được nhập
    if (
      (weeklyBudget && weekly !== null && weekly <= 0) ||
      (monthlyBudget && monthly !== null && monthly <= 0) ||
      (yearlyBudget && yearly !== null && yearly <= 0)
    ) {
      Alert.alert("Lỗi", "Vui lòng nhập số tiền hợp lệ cho ngân sách!");
      return;
    }

    try {
      await axios.post(`${BACKEND_URL}/budget`, {
        userId,
        weeklyBudget: weekly,
        monthlyBudget: monthly,
        yearlyBudget: yearly,
      });
      
      setCurrentBudgets({
        weeklyBudget: weekly,
        monthlyBudget: monthly,
        yearlyBudget: yearly,
      });
      
      // Cập nhật lại chi tiêu sau khi lưu ngân sách mới
      calculateSpentAmounts(localTransactions);
      
      // Kiểm tra vượt ngân sách ngay lập tức với ngân sách mới
      const newBudgets = {
        weeklyBudget: weekly,
        monthlyBudget: monthly,
        yearlyBudget: yearly,
      };
      
      if (weekly && spentAmounts.weeklySpent > weekly) {
        Alert.alert(
          "Cảnh báo",
          `Bạn đã vượt quá ngân sách tuần mới!\nĐã chi: ${spentAmounts.weeklySpent.toLocaleString('vi-VN')} đ\nNgân sách: ${weekly.toLocaleString('vi-VN')} đ`
        );
      }
      if (monthly && spentAmounts.monthlySpent > monthly) {
        Alert.alert(
          "Cảnh báo",
          `Bạn đã vượt quá ngân sách tháng mới!\nĐã chi: ${spentAmounts.monthlySpent.toLocaleString('vi-VN')} đ\nNgân sách: ${monthly.toLocaleString('vi-VN')} đ`
        );
      }
      if (yearly && spentAmounts.yearlySpent > yearly) {
        Alert.alert(
          "Cảnh báo",
          `Bạn đã vượt quá ngân sách năm mới!\nĐã chi: ${spentAmounts.yearlySpent.toLocaleString('vi-VN')} đ\nNgân sách: ${yearly.toLocaleString('vi-VN')} đ`
        );
      }
      
      Alert.alert("Thành công", "Ngân sách đã được lưu!");
      if (onBudgetSaved) {
        onBudgetSaved();
      }
    } catch (error) {
      console.error("Lỗi khi lưu ngân sách:", error);
      Alert.alert("Lỗi", "Không thể lưu ngân sách. Vui lòng thử lại!");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Đặt ngân sách chi tiêu</Text>
      
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Ngân sách hiện tại</Text>
        {(currentBudgets.weeklyBudget === null && currentBudgets.monthlyBudget === null && currentBudgets.yearlyBudget === null) ? (
          <Text style={styles.noBudgetText}>Chưa có ngân sách nào được thiết lập</Text>
        ) : (
          <>
            {currentBudgets.weeklyBudget !== null && (
              <View style={styles.budgetItem}>
                <View style={styles.budgetHeader}>
                  <Text style={styles.budgetText}>Tuần: {currentBudgets.weeklyBudget.toLocaleString('vi-VN')} đ</Text>
                  <TouchableOpacity 
                    style={styles.deleteButton} 
                    onPress={() => deleteBudget('weekly')}
                  >
                    <Icon name="trash" size={16} color="#DC3545" />
                  </TouchableOpacity>
                </View>
                <Text style={[
                  styles.spentText,
                  spentAmounts.weeklySpent > currentBudgets.weeklyBudget && styles.overBudgetText
                ]}>
                  Đã chi: {spentAmounts.weeklySpent.toLocaleString('vi-VN')} đ
                </Text>
              </View>
            )}
            {currentBudgets.monthlyBudget !== null && (
              <View style={styles.budgetItem}>
                <View style={styles.budgetHeader}>
                  <Text style={styles.budgetText}>Tháng: {currentBudgets.monthlyBudget.toLocaleString('vi-VN')} đ</Text>
                  <TouchableOpacity 
                    style={styles.deleteButton} 
                    onPress={() => deleteBudget('monthly')}
                  >
                    <Icon name="trash" size={16} color="#DC3545" />
                  </TouchableOpacity>
                </View>
                <Text style={[
                  styles.spentText,
                  spentAmounts.monthlySpent > currentBudgets.monthlyBudget && styles.overBudgetText
                ]}>
                  Đã chi: {spentAmounts.monthlySpent.toLocaleString('vi-VN')} đ
                </Text>
              </View>
            )}
            {currentBudgets.yearlyBudget !== null && (
              <View style={styles.budgetItem}>
                <View style={styles.budgetHeader}>
                  <Text style={styles.budgetText}>Năm: {currentBudgets.yearlyBudget.toLocaleString('vi-VN')} đ</Text>
                  <TouchableOpacity 
                    style={styles.deleteButton} 
                    onPress={() => deleteBudget('yearly')}
                  >
                    <Icon name="trash" size={16} color="#DC3545" />
                  </TouchableOpacity>
                </View>
                <Text style={[
                  styles.spentText,
                  spentAmounts.yearlySpent > currentBudgets.yearlyBudget && styles.overBudgetText
                ]}>
                  Đã chi: {spentAmounts.yearlySpent.toLocaleString('vi-VN')} đ
                </Text>
              </View>
            )}
          </>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Cập nhật ngân sách</Text>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Ngân sách theo tuần (VNĐ)</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập số tiền"
            value={weeklyBudget ? formatCurrency(weeklyBudget) : ""}
            onChangeText={(value) => handleBudgetChange(value, setWeeklyBudget)}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Ngân sách theo tháng (VNĐ)</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập số tiền"
            value={monthlyBudget ? formatCurrency(monthlyBudget) : ""}
            onChangeText={(value) => handleBudgetChange(value, setMonthlyBudget)}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Ngân sách theo năm (VNĐ)</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập số tiền"
            value={yearlyBudget ? formatCurrency(yearlyBudget) : ""}
            onChangeText={(value) => handleBudgetChange(value, setYearlyBudget)}
            keyboardType="numeric"
          />
        </View>

        <Button 
          type="primary" 
          style={styles.submitButton} 
          onPress={saveBudget}
        >
          Lưu ngân sách
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: "#F8F9FA",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#28A745",
    textAlign: "center",
    marginVertical: 20,
  },
  card: {
    marginBottom: 20,
    borderRadius: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    backgroundColor: "#FFF",
    padding: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#28A745",
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    color: "#495057",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#DDD",
    padding: 12,
    backgroundColor: "#FFF",
    borderRadius: 8,
    fontSize: 16,
  },
  budgetItem: {
    marginBottom: 12,
  },
  budgetText: {
    fontSize: 16,
    color: "#218838",
    marginBottom: 4,
  },
  spentText: {
    fontSize: 14,
    color: "#495057",
  },
  overBudgetText: {
    color: "#DC3545",
    fontWeight: "bold",
  },
  submitButton: {
    backgroundColor: "#28A745",
    marginTop: 8,
  },
  noBudgetText: {
    fontSize: 16,
    color: "#6C757D",
    fontStyle: "italic",
    textAlign: "center",
    marginVertical: 10,
  },
  budgetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  deleteButton: {
    padding: 5,
  },
});