import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Alert,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BACKEND_URL } from "../../config";
import { Button } from "@ant-design/react-native";
import Icon from "react-native-vector-icons/FontAwesome";

export default function AddTransactionScreen() {
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [type, setType] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [items, setItems] = useState<{ productName: string; quantity: string; price: string }[]>([]);
  const [customCategory, setCustomCategory] = useState<string>("");
  const [showCustomCategoryInput, setShowCustomCategoryInput] = useState<boolean>(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  
  const [expenseCategories, setExpenseCategories] = useState([
    { name: "Ăn uống", icon: "cutlery" },
    { name: "Mua sắm", icon: "shopping-cart" },
    { name: "Giải trí", icon: "gamepad" },
    { name: "Du lịch", icon: "plane" },
    { name: "Y tế", icon: "medkit" },
    { name: "Giáo dục", icon: "book" },
  ]);
  
  const [incomeCategories, setIncomeCategories] = useState([
    { testId:"lương", name: "Lương", icon: "money" },
    { name: "Thưởng", icon: "gift" },
    { name: "Đầu tư", icon: "briefcase" },
    { name: "Tiền lãi", icon: "bank" },
    { name: "Khác", icon: "plus-circle" },
  ]);

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

  // Cập nhật lại amount khi tính tổng từ items
  useEffect(() => {
    if (type === "expense" && items.length > 0) {
      setAmount(calculateTotalAmount().toString());
    }
  }, [items, type]);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!type) {
      newErrors.type = "Vui lòng chọn loại giao dịch";
    }
    
    if (!category) {
      newErrors.category = "Vui lòng chọn danh mục";
    }
    
    if (type === "income") {
      if (!amount) {
        newErrors.amount = "Vui lòng nhập số tiền";
      } else if (isNaN(Number(amount)) || Number(amount) <= 0) {
        newErrors.amount = "Số tiền phải là số dương";
      }
    }
    
    if (type === "expense" && items.length === 0) {
      newErrors.items = "Vui lòng thêm ít nhất một mục chi tiêu";
    }
    
    if (type === "expense" && items.length > 0) {
      const itemErrors: string[] = [];
      
      items.forEach((item, index) => {
        if (!item.productName.trim()) {
          itemErrors.push(`Tên sản phẩm ${index + 1} không được để trống`);
        }
        
        if (!item.quantity || isNaN(Number(item.quantity)) || Number(item.quantity) <= 0) {
          itemErrors.push(`Số lượng của sản phẩm ${index + 1} phải là số dương`);
        }
        
        if (!item.price || isNaN(Number(item.price)) || Number(item.price) <= 0) {
          itemErrors.push(`Giá tiền của sản phẩm ${index + 1} phải là số dương`);
        }
      });
      
      if (itemErrors.length > 0) {
        newErrors.itemDetails = itemErrors.join('\n');
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const addItem = () => {
    setItems([...items, { productName: "", quantity: "", price: "" }]);
  };

  const removeItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
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

  const formatCurrency = (amount: number) => {
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const addCustomCategory = () => {
    if (!customCategory.trim()) {
      setErrors({...errors, customCategory: "Vui lòng nhập tên danh mục"});
      return;
    }
    
    // Kiểm tra xem danh mục đã tồn tại chưa
    const categories = type === "income" ? incomeCategories : expenseCategories;
    if (categories.some(c => c.name.toLowerCase() === customCategory.trim().toLowerCase())) {
      setErrors({...errors, customCategory: "Danh mục này đã tồn tại"});
      return;
    }
    
    if (type === "income") {
      setIncomeCategories([...incomeCategories, { name: customCategory, icon: "tag" }]);
      setCategory(customCategory);
    } else if (type === "expense") {
      setExpenseCategories([...expenseCategories, { name: customCategory, icon: "tag" }]);
      setCategory(customCategory);
    }
    
    setCustomCategory("");
    setShowCustomCategoryInput(false);
    setErrors({...errors, customCategory: "", category: ""});
  };

  const submitTransaction = async () => {
    if (!userId || !category || !type) {
      Alert.alert("Lỗi", "Vui lòng điền đầy đủ thông tin giao dịch.");
      return;
    }

    setIsLoading(true);
    
    try {
      const parsedAmount = parseInt(amount);
      
      const transactionData = {
        userId,
        type,
        category,
        amount: parsedAmount,
        items: type === "expense" ? items : undefined,
        createdAt: new Date().toISOString(),
      };

      await axios.post(`${BACKEND_URL}/transactions`, transactionData);
      Alert.alert("Thành công", "Giao dịch đã được thêm thành công!");
      
      // Reset form
      setCategory("");
      setAmount("");
      setType("");
      setItems([]);
      setErrors({});
    } catch (error) {
      console.error("Lỗi khi thêm giao dịch:", error);
      Alert.alert("Lỗi", "Đã có lỗi xảy ra khi gửi dữ liệu.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setType("");
    setCategory("");
    setAmount("");
    setItems([]);
    setCustomCategory("");
    setShowCustomCategoryInput(false);
    setErrors({});
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
      testID="keyboard-avoiding-view"
    >
      <ScrollView contentContainerStyle={styles.scrollContent} testID="scroll-view">
        <Text style={styles.title} testID="title-text">Thêm giao dịch mới</Text>
  
        {/* Loại giao dịch */}
        <Text style={styles.label}>Loại giao dịch</Text>
        <View style={styles.typeContainer}>
          {transactionTypes.map((typeOption, index) => (
            <TouchableOpacity
            testID={`transaction-type-${typeOption.value}`}
              key={index}
              style={[styles.typeButton, type === typeOption.value && styles.selectedType]}
              onPress={() => {
                setType(typeOption.value);
                setCategory("");
                setItems([]);
                setShowCustomCategoryInput(false);
                setErrors({...errors, type: ""});
              }}
            >
              <Icon name={typeOption.value === 'income' ? 'plus' : 'minus'} size={20} color={type === typeOption.value ? "#FFF" : "#28A745"} />
              <Text style={[styles.typeText, type === typeOption.value && styles.selectedTypeText]}>
                {typeOption.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
  
        {/* Danh mục giao dịch */}
        {type && (
          <>
            <Text style={styles.label}>Danh mục</Text>
            <View style={styles.categoriesContainer}>
              {(type === "income" ? incomeCategories : expenseCategories).map((categoryOption, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.categoryButton, category === categoryOption.name && styles.selectedCategory]}
                  onPress={() => setCategory(categoryOption.name)}
                >
                  <Icon 
                    name={categoryOption.icon} 
                    size={24} 
                    color={category === categoryOption.name ? "#FFF" : "#28A745"} 
                    style={styles.categoryIcon}
                  />
                  <Text style={[
                    styles.categoryText,
                    category === categoryOption.name && styles.selectedCategoryText
                  ]}>
                    {categoryOption.name}
                  </Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={styles.addCategoryButton}
                onPress={() => setShowCustomCategoryInput(!showCustomCategoryInput)}
              >
                <Icon name="plus-circle" size={24} color="#28A745" />
                <Text style={styles.addCategoryText}>Thêm mới</Text>
              </TouchableOpacity>
            </View>
  
            {/* Ô nhập danh mục tùy chỉnh */}
            {showCustomCategoryInput && (
              <View style={styles.customCategoryContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Nhập danh mục mới"
                  value={customCategory}
                  onChangeText={setCustomCategory}
                />
                <Button type="primary" style={styles.addCategoryButton} onPress={addCustomCategory}>
                  Thêm
                </Button>
              </View>
            )}
          </>
        )}

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
        {/* Expense Items Section */}
        {type === "expense" && (
          <View style={styles.container}>
            <View style={styles.sectionHeader}>
              <Text style={styles.label}>Chi tiết mục chi tiêu</Text>
              <TouchableOpacity
                style={styles.addItemButton}
                onPress={addItem}
              >
                <Icon name="plus" size={20} color="#FFFFFF" />
                <Text style={styles.addItemButtonText}>Thêm mục</Text>
              </TouchableOpacity>
            </View>
            
            {items.map((item, index) => (
              <View key={index} style={styles.itemCard}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemTitle}>Mục {index + 1}</Text>
                  <TouchableOpacity
                    onPress={() => removeItem(index)}
                    style={styles.removeButton}
                  >
                    <Icon name="trash" size={20} color="#DC3545" />
                  </TouchableOpacity>
                </View>
                
                <View style={styles.itemInputGroup}>
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Tên sản phẩm</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="VD: Cà phê"
                      value={item.productName}
                      onChangeText={(value) => updateItem(index, "productName", value)}
                    />
                  </View>
                  
                  <View style={styles.inputRow}>
                    <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
                      <Text style={styles.inputLabel}>Số lượng</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="VD: 2"
                        value={item.quantity}
                        onChangeText={(value) => updateItem(index, "quantity", value)}
                        keyboardType="numeric"
                      />
                    </View>
                    <View style={[styles.inputContainer, { flex: 1 }]}>
                      <Text style={styles.inputLabel}>Đơn giá</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="VD: 25000"
                        value={item.price}
                        onChangeText={(value) => updateItem(index, "price", value)}
                        keyboardType="numeric"
                      />
                    </View>
                  </View>
                  
                  <Text style={styles.itemTotal}>
                    Thành tiền: {formatCurrency(parseInt(item.quantity || "0") * parseInt(item.price || "0"))} VND
                  </Text>
                </View>
              </View>
            ))}
            
            {items.length > 0 && (
              <View style={styles.totalContainer}>
                <Text style={styles.totalLabel}>Tổng cộng</Text>
                <Text style={styles.totalAmount}>{formatCurrency(calculateTotalAmount())} VND</Text>
              </View>
            )}
          </View>
        )}
        
        <Button type="primary" style={styles.submitButton} onPress={submitTransaction}>
          Gửi giao dịch
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  addItemButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#28A745",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  addItemButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  itemCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E9ECEF",
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#28A745",
  },
  removeButton: {
    padding: 8,
  },
  itemInputGroup: {
    gap: 12,
  },
  inputContainer: {
    gap: 4,
  },
  inputLabel: {
    fontSize: 14,
    color: "#6C757D",
    fontWeight: "500",
  },
  input: {
    borderWidth: 1,
    borderColor: "#CED4DA",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#FFFFFF",
  },
  inputRow: {
    flexDirection: "row",
    gap: 12,
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: "600",
    color: "#28A745",
    textAlign: "right",
  },
  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F0FFF4",
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "600",
    color: "#218838",
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#28A745",
  },
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
    fontWeight: "600",
    color: "#218838",
    marginBottom: 8,
  },
  errorText: {
    color: "#DC3545",
    fontSize: 14,
    marginBottom: 8,
  },
  typeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  typeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#F0FFF4",
    borderWidth: 1,
    borderColor: "#28A745",
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
  },
  selectedType: {
    backgroundColor: "#28A745",
  },
  typeText: {
    color: "#28A745",
    fontWeight: "600",
    marginLeft: 8,
  },
  selectedTypeText: {
    color: "#FFF",
  },
  categoriesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 20,
  },
  categoryButton: {
    alignItems: "center",
    justifyContent: "center",
    width: '30%',
    paddingVertical: 12,
    backgroundColor: "#F0FFF4",
    borderWidth: 1,
    borderColor: "#28A745",
    borderRadius: 8,
    margin: 4,
  },
  selectedCategory: {
    backgroundColor: "#28A745",
  },
  categoryIcon: {
    marginBottom: 4,
  },
  categoryText: {
    color: "#28A745",
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
  },
  selectedCategoryText: {
    color: "#FFF",
  },
  addCategoryButton: {
    alignItems: "center",
    justifyContent: "center",
    width: '30%',
    color: "#000",
    paddingVertical: 12,
    backgroundColor: "#F0FFF4",
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: "#28A745",
    borderRadius: 8,
    margin: 4,
  },
  addCategoryText: {
    color: "#28A745",
    fontSize: 12,
    marginTop: 4,
  },
  customCategoryContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  customCategoryInputContainer: {
    flex: 1,
  },
  customCategoryInput: {
    borderWidth: 1,
    borderColor: "#28A745",
    padding: 12,
    backgroundColor: "#FFF",
    borderRadius: 8,
    fontSize: 16,
  },
  customCategoryButton: {
    backgroundColor: "#28A745",
    borderRadius: 8,
    padding: 12,
    marginLeft: 8,
    alignItems: "center",
    justifyContent: "center",
    width: 48,
    height: 48,
  },
  amountContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  amountInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#28A745",
    padding: 12,
    backgroundColor: "#FFF",
    borderRadius: 8,
    fontSize: 16,
  },
  currencyText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "600",
    color: "#218838",
  },
  subTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#28A745",
    marginBottom: 12,
  },
  itemContainer: {
    marginBottom: 15,
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },


  inputGroup: {
    marginBottom: 8,
  },

  itemInput: {
    borderWidth: 1,
    borderColor: "#DDD",
    padding: 10,
    backgroundColor: "#FFF",
    borderRadius: 8,
    fontSize: 14,
  },

  addItemText: {
    color: "#FFF",
    fontWeight: "600",
    marginLeft: 8,
  },

  buttonGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  resetButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#6C757D",
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
    marginRight: 8,
  },
  resetButtonText: {
    color: "#6C757D",
    fontWeight: "600",
  },
  submitButton: {
    flex: 2,
    flexDirection: "row",
    backgroundColor: "#28A745",
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonText: {
    color: "#FFF",
    fontWeight: "600",
  },
  disabledButton: {
    backgroundColor: "#74C687",
    opacity: 0.7,
  },
});