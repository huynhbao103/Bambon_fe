import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Alert,
  ScrollView,
  StyleSheet,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BACKEND_URL } from "../../config";
import { Button } from "@ant-design/react-native";

// Định nghĩa kiểu cho props
interface BudgetScreenProps {
  onBudgetSaved?: () => void; // Callback khi lưu thành công
}

export default function BudgetScreen({ onBudgetSaved }: BudgetScreenProps) {
  const [userId, setUserId] = useState<string | null>(null);
  const [budget, setBudget] = useState<string>("");
  const [currentBudget, setCurrentBudget] = useState<number | null>(null);

  useEffect(() => {
    const fetchUserIdAndBudget = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem("userId");
        if (storedUserId) {
          setUserId(storedUserId);
          const response = await axios.get(`${BACKEND_URL}/budget/${storedUserId}`);
          if (response.data.budget) {
            setCurrentBudget(response.data.budget);
            setBudget(response.data.budget.toString());
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

  const saveBudget = async () => {
    if (!budget || isNaN(parseInt(budget)) || parseInt(budget) <= 0) {
      Alert.alert("Lỗi", "Vui lòng nhập số tiền hợp lệ cho ngân sách!");
      return;
    }

    try {
      const budgetAmount = parseInt(budget);
      await axios.post(`${BACKEND_URL}/budget`, { userId, budget: budgetAmount });
      setCurrentBudget(budgetAmount);
      Alert.alert("Thành công", "Ngân sách đã được lưu!");
      if (onBudgetSaved) {
        onBudgetSaved(); // Gọi callback để thông báo cho màn hình cha
      }
    } catch (error) {
      console.error("Lỗi khi lưu ngân sách:", error);
      Alert.alert("Lỗi", "Không thể lưu ngân sách. Vui lòng thử lại!");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Đặt ngân sách chi tiêu</Text>
      {currentBudget !== null && (
        <Text style={styles.currentBudget}>Ngân sách hiện tại: {currentBudget.toLocaleString()} đ</Text>
      )}
      <Text style={styles.label}>Ngân sách tháng này (VNĐ)</Text>
      <TextInput
        style={styles.input}
        placeholder="Nhập số tiền ngân sách"
        value={budget}
        onChangeText={setBudget}
        keyboardType="numeric"
      />
      <Button type="primary" style={styles.submitButton} onPress={saveBudget}>
        Lưu ngân sách
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#F8F9FA",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#28A745",
    textAlign: "center",
    marginVertical: 20,
  },
  currentBudget: {
    fontSize: 16,
    color: "#218838",
    textAlign: "center",
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: "#218838",
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#DDD",
    padding: 12,
    backgroundColor: "#FFF",
    borderRadius: 8,
    marginBottom: 20,
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: "#28A745",
  },
});