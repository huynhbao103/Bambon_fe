import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Alert, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, StyleSheet } from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BACKEND_URL } from "../../config";
import { Button } from "@ant-design/react-native";
import Icon from 'react-native-vector-icons/FontAwesome';

export default function AddTransactionScreen() {
  const [userId, setUserId] = useState<string | null>(null);
  const [type, setType] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [items, setItems] = useState<{ productName: string; quantity: string; price: string }[]>([]);

  const expenseCategories = [
    { name: "Ăn uống", icon: "cutlery" },
    { name: "Mua sắm", icon: "shopping-cart" },
    { name: "Giải trí", icon: "gamepad" },
    { name: "Du lịch", icon: "plane" },
  ];
  const incomeCategories = [
    { name: "Lương", icon: "money" },
    { name: "Thưởng", icon: "gift" },
    { name: "Đầu tư", icon: "briefcase" },
  ];
  const transactionTypes = [
    { name: "Thu nhập", value: "income" },
    { name: "Chi tiêu", value: "expense" },
  ];

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem("userId");
        if (storedUserId) {
          setUserId(storedUserId);
        } else {
          throw new Error("Không tìm thấy userId");
        }
      } catch (error) {
        console.error(error);
        Alert.alert("Lỗi", "Không thể tải user ID");
      }
    };
    fetchUserId();
  }, []);

  const addItem = () => {
    setItems([...items, { productName: "", quantity: "", price: "" }]);
  };

  const updateItem = (index: number, field: string, value: string) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setItems(updatedItems);
  };

  const calculateTotalAmount = () => {
    return items.reduce((total, item) => {
      const quantity = parseInt(item.quantity) || 0;
      const price = parseInt(item.price) || 0;
      return total + quantity * price;
    }, 0);
  };

  const submitTransaction = async () => {
    if (!userId || !category || !type) {
      Alert.alert("Lỗi", "Vui lòng điền đầy đủ thông tin giao dịch.");
      return;
    }

    if (type === "expense" && items.length === 0) {
      Alert.alert("Lỗi", "Vui lòng thêm ít nhất một mục chi tiêu.");
      return;
    }

    const parsedAmount = type === "expense" ? calculateTotalAmount() : parseInt(amount);

    if (isNaN(parsedAmount)) {
      Alert.alert("Lỗi", "Số tiền phải là số hợp lệ.");
      return;
    }

    try {
      const transactionData = {
        userId,
        type,
        category,
        amount: parsedAmount,
        items: type === "expense" ? items : undefined,
      };

      await axios.post(`${BACKEND_URL}/transactions`, transactionData);
      Alert.alert("Thành công", "Giao dịch đã được thêm thành công!");
      setCategory("");
      setAmount("");
      setType("");
      setItems([]);
    } catch (error) {
      console.error("Lỗi khi thêm giao dịch:", error);
      Alert.alert("Lỗi", "Đã có lỗi xảy ra khi gửi dữ liệu.");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Thêm giao dịch mới</Text>

        {/* Loại giao dịch */}
        <Text style={styles.label}>Loại giao dịch</Text>
        <View style={styles.box}>
          {transactionTypes.map((typeOption, index) => (
            <TouchableOpacity
              key={index}
              style={styles.listItem}
              onPress={() => {
                setType(typeOption.value);
                setCategory("");
                setItems([]);
              }}
            >
              <Text>{typeOption.name}</Text>
              {type === typeOption.value && <Icon name="check" size={16} color="green" style={styles.iconRight} />}
            </TouchableOpacity>
          ))}
        </View>

        {/* Danh mục giao dịch */}
        <Text style={styles.label}>Danh mục</Text>
        <View style={styles.box}>
          {(type === "income" ? incomeCategories : expenseCategories).map((categoryOption, index) => (
            <TouchableOpacity
              key={index}
              style={styles.listItem}
              onPress={() => setCategory(categoryOption.name)}
            >
              <Icon name={categoryOption.icon} size={20} color="#007AFF" style={styles.iconLeft} />
              <Text>{categoryOption.name}</Text>
              {category === categoryOption.name && <Icon name="check" size={16} color="green" style={styles.iconRight} />}
            </TouchableOpacity>
          ))}
        </View>

        {/* Số tiền */}
        {type === "income" && (
          <>
            <Text style={styles.label}>Số tiền</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập số tiền"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
            />
          </>
        )}

        {/* Mục chi tiêu */}
        {type === "expense" && (
          <>
            <Text style={styles.subTitle}>Chi tiết mục chi tiêu</Text>
            {items.map((item, index) => (
              <View key={index} style={styles.itemContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Tên sản phẩm"
                  value={item.productName}
                  onChangeText={(value) => updateItem(index, "productName", value)}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Số lượng"
                  value={item.quantity}
                  onChangeText={(value) => updateItem(index, "quantity", value)}
                  keyboardType="numeric"
                />
                <TextInput
                  style={styles.input}
                  placeholder="Giá tiền"
                  value={item.price}
                  onChangeText={(value) => updateItem(index, "price", value)}
                  keyboardType="numeric"
                />
              </View>
            ))}

            <Text style={styles.totalAmount}>Tổng tiền: {calculateTotalAmount()} VND</Text>

            <Button type="ghost" style={styles.button} onPress={addItem}>
              Thêm mục chi tiêu
            </Button>
          </>
        )}

        <Button type="primary" style={styles.submitButton} onPress={submitTransaction}>
          Gửi giao dịch
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  scrollContent: {
    paddingBottom: 100,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#28A745",
    textAlign: "center",
    marginVertical: 20,
  },
  label: {
    fontSize: 16,
    color: "#218838",
    marginBottom: 8,
  },
  box: {
    padding: 12,
    backgroundColor: "#FFF",
    borderRadius: 8,
    marginBottom: 16,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  iconLeft: {
    marginRight: 10,
  },
  iconRight: {
    marginLeft: "auto",
  },
  input: {
    borderWidth: 1,
    borderColor: "#DDD",
    padding: 12,
    backgroundColor: "#FFF",
    borderRadius: 8,
    marginBottom: 10,
  },
  subTitle: {
    fontSize: 18,
    color: "#28A745",
    marginBottom: 8,
  },
  itemContainer: {
    marginBottom: 10,
  },
  totalAmount: {
    fontSize: 16,
    color: "#218838",
    marginBottom: 8,
  },
  button: {
    marginTop: 8,
  },
  submitButton: {
    marginTop: 16,
  },
});
