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

interface BudgetScreenProps {
  onBudgetSaved?: () => void;
  totalExpense?: number;
  transactions?: any[];
}

// Hàm định dạng tiền tệ
export const formatCurrency = (value: string, testID: string = "formatCurrency"): string => {
  const numericValue = value.replace(/[^0-9]/g, '');
  const number = parseInt(numericValue) || 0;
  return number.toLocaleString('vi-VN');
};

// Hàm xử lý thay đổi input ngân sách
export const handleBudgetChange = (
  value: string,
  setter: (value: string) => void,
  testID: string = "handleBudgetChange"
): void => {
  const numericValue = value.replace(/[^0-9]/g, '');
  setter(numericValue);
};

// Hàm tính toán số tiền đã chi
export const calculateSpentAmounts = (
  transactions: any[],
  setSpentAmounts: (amounts: { weeklySpent: number; monthlySpent: number; yearlySpent: number }) => void,
  testID: string = "calculateSpentAmounts"
): void => {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  const expenseTransactions = transactions.filter(t => t.type === "expense");

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
    yearlySpent,
  });
};

// Hàm xóa ngân sách
export const deleteBudget = (
  type: 'weekly' | 'monthly' | 'yearly',
  currentBudgets: { weeklyBudget: number | null; monthlyBudget: number | null; yearlyBudget: number | null },
  setCurrentBudgets: (budgets: { weeklyBudget: number | null; monthlyBudget: number | null; yearlyBudget: number | null }) => void,
  setWeeklyBudget: (value: string) => void,
  setMonthlyBudget: (value: string) => void,
  setYearlyBudget: (value: string) => void,
  userId: string | null,
  onBudgetSaved?: () => void,
  testID: string = "deleteBudget"
): void => {
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
            const updatedBudgets = { ...currentBudgets };
            updatedBudgets[`${type}Budget`] = null;
            setCurrentBudgets(updatedBudgets);

            if (type === 'weekly') setWeeklyBudget("");
            if (type === 'monthly') setMonthlyBudget("");
            if (type === 'yearly') setYearlyBudget("");

            await axios.post(`${BACKEND_URL}/budget`, {
              userId,
              weeklyBudget: type === 'weekly' ? null : currentBudgets.weeklyBudget,
              monthlyBudget: type === 'monthly' ? null : currentBudgets.monthlyBudget,
              yearlyBudget: type === 'yearly' ? null : currentBudgets.yearlyBudget,
            });

            Alert.alert("Thành công", "Đã xóa ngân sách!");
            if (onBudgetSaved) onBudgetSaved();
          } catch (error) {
            console.error("Lỗi khi xóa ngân sách:", error);
            Alert.alert("Lỗi", "Không thể xóa ngân sách. Vui lòng thử lại!");
          }
        },
      },
    ]
  );
};

// Hàm lưu ngân sách
export const saveBudget = async (
  weeklyBudget: string,
  monthlyBudget: string,
  yearlyBudget: string,
  currentBudgets: { weeklyBudget: number | null; monthlyBudget: number | null; yearlyBudget: number | null },
  setCurrentBudgets: (budgets: { weeklyBudget: number | null; monthlyBudget: number | null; yearlyBudget: number | null }) => void,
  localTransactions: any[],
  setSpentAmounts: (amounts: { weeklySpent: number; monthlySpent: number; yearlySpent: number }) => void,
  spentAmounts: { weeklySpent: number; monthlySpent: number; yearlySpent: number },
  userId: string | null,
  onBudgetSaved?: () => void,
  testID: string = "saveBudget"
): Promise<void> => {
  const weekly = weeklyBudget ? (parseInt(weeklyBudget) || null) : currentBudgets.weeklyBudget;
  const monthly = monthlyBudget ? (parseInt(monthlyBudget) || null) : currentBudgets.monthlyBudget;
  const yearly = yearlyBudget ? (parseInt(yearlyBudget) || null) : currentBudgets.yearlyBudget;

  if (weekly === null && monthly === null && yearly === null) {
    Alert.alert("Lỗi", "Vui lòng nhập ít nhất một loại ngân sách hợp lệ!");
    return;
  }
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
    setCurrentBudgets({ weeklyBudget: weekly, monthlyBudget: monthly, yearlyBudget: yearly });
    calculateSpentAmounts(localTransactions, setSpentAmounts);
    if (weekly && spentAmounts.weeklySpent > weekly) {
      Alert.alert(
        "Cảnh báo",
        `Bạn đã vượt quá ngân sách tuần mới!\nĐã chi: ${spentAmounts.weeklySpent.toLocaleString('vi-VN')} đ\nNgân sách: ${weekly.toLocaleString('vi-VN')} đ`
      );
    }
    Alert.alert("Thành công", "Ngân sách đã được lưu!");
    if (onBudgetSaved) onBudgetSaved();
  } catch (error) {
    console.error("Lỗi khi lưu ngân sách:", error);
    Alert.alert("Lỗi", "Không thể lưu ngân sách. Vui lòng thử lại!");
  }
};

// Component chính
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
          if (localTransactions.length === 0) {
            const transactionsResponse = await axios.get(`${BACKEND_URL}/transactions/${storedUserId}`);
            if (transactionsResponse.data) {
              setLocalTransactions(transactionsResponse.data);
              calculateSpentAmounts(transactionsResponse.data, setSpentAmounts);
            }
          } else {
            calculateSpentAmounts(localTransactions, setSpentAmounts);
          }
        }
      } catch (error) {
        console.error("Lỗi khi lấy thông tin:", error);
      }
    };
    fetchUserIdAndBudget();
  }, []);

  const handleSaveBudget = () => {
    saveBudget(
      weeklyBudget,
      monthlyBudget,
      yearlyBudget,
      currentBudgets,
      setCurrentBudgets,
      localTransactions,
      setSpentAmounts,
      spentAmounts,
      userId,
      onBudgetSaved
    );
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
                    onPress={() => deleteBudget(
                      'weekly',
                      currentBudgets,
                      setCurrentBudgets,
                      setWeeklyBudget,
                      setMonthlyBudget,
                      setYearlyBudget,
                      userId,
                      onBudgetSaved
                    )}
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
                    onPress={() => deleteBudget(
                      'monthly',
                      currentBudgets,
                      setCurrentBudgets,
                      setWeeklyBudget,
                      setMonthlyBudget,
                      setYearlyBudget,
                      userId,
                      onBudgetSaved
                    )}
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
                    onPress={() => deleteBudget(
                      'yearly',
                      currentBudgets,
                      setCurrentBudgets,
                      setWeeklyBudget,
                      setMonthlyBudget,
                      setYearlyBudget,
                      userId,
                      onBudgetSaved
                    )}
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
          onPress={handleSaveBudget}
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