import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, TextInput, Alert } from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { styles } from '../styles';
import { Transaction, TransactionItem } from '../types';

interface TransactionModalProps {
  selectedTransaction: Transaction | null;
  isEditing: boolean;
  editedTransaction: Transaction | null;
  onClose: () => void;
  onEdit: () => void;
  onDelete: (id: string) => void;
  onSave: () => void;
  onCancel: () => void;
  setEditedTransaction: (transaction: Transaction) => void;
  addItem: () => void;
  removeItem: (index: number) => void;
  updateItem: (index: number, field: string, value: string | number) => void;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  selectedTransaction,
  isEditing,
  editedTransaction,
  onClose,
  onEdit,
  onDelete,
  onSave,
  onCancel,
  setEditedTransaction,
  addItem,
  removeItem,
  updateItem,
}) => {
  if (!selectedTransaction || !editedTransaction) return null;
  
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const validateInput = (field: string, value: string | number): boolean => {
    let isValid = true;
    const newErrors = {...errors};
    
    if (field === 'productName') {
      if (typeof value === 'string' && value.length > 50) {
        newErrors[field] = 'Tên sản phẩm không được quá 50 ký tự';
        isValid = false;
      } else {
        delete newErrors[field];
      }
    }
    
    if (field === 'price' || field === 'amount') {
      const numValue = typeof value === 'string' ? parseFloat(value) : value;
      if (isNaN(numValue)) {
        newErrors[field] = 'Vui lòng nhập số hợp lệ';
        isValid = false;
      } else if (numValue < 0) {
        newErrors[field] = 'Giá trị không được âm';
        isValid = false;
      } else if (numValue > 1000000000) {
        newErrors[field] = 'Giá trị không được quá 1 tỷ đồng';
        isValid = false;
      } else {
        delete newErrors[field];
      }
    }
    
    if (field === 'quantity') {
      const numValue = typeof value === 'string' ? parseFloat(value) : value;
      if (isNaN(numValue)) {
        newErrors[field] = 'Vui lòng nhập số hợp lệ';
        isValid = false;
      } else if (numValue < 0) {
        newErrors[field] = 'Số lượng không được âm';
        isValid = false;
      } else {
        delete newErrors[field];
      }
    }
    
    setErrors(newErrors);
    return isValid;
  };

  const calculateTotal = () => {
    let total = 0;
    if (editedTransaction.items && editedTransaction.items.length > 0) {
      total = editedTransaction.items.reduce((sum, item) => {
        return sum + (item.quantity * item.price);
      }, 0);
      
      // Cập nhật tổng tiền
      setEditedTransaction({
        ...editedTransaction,
        amount: total
      });
    }
  };

  const handleTypeChange = (text: string) => {
    if (text === 'income' || text === 'expense') {
      setEditedTransaction({ ...editedTransaction, type: text });
    }
  };

  const handleSave = () => {
    // Kiểm tra tất cả các trường trước khi lưu
    let hasError = false;
    
    // Kiểm tra số tiền chính
    if (!validateInput('amount', editedTransaction.amount)) {
      hasError = true;
    }
    
    // Kiểm tra từng mục sản phẩm
    if (editedTransaction.items) {
      editedTransaction.items.forEach((item, index) => {
        if (!validateInput(`productName_${index}`, item.productName)) {
          hasError = true;
        }
        if (!validateInput(`price_${index}`, item.price)) {
          hasError = true;
        }
        if (!validateInput(`quantity_${index}`, item.quantity)) {
          hasError = true;
        }
      });
    }
    
    if (hasError) {
      Alert.alert('Lỗi', 'Vui lòng kiểm tra lại thông tin nhập vào');
      return;
    }
    
    onSave();
  };

  const handleUpdateItem = (index: number, field: string, value: string | number) => {
    const fieldId = `${field}_${index}`;
    if (field === "productName") {
      if (validateInput('productName', value)) {
        updateItem(index, field, value);
      }
    } else if (field === "price") {
      const numValue = typeof value === 'string' ? parseFloat(value) || 0 : value;
      if (validateInput('price', numValue)) {
        updateItem(index, field, numValue);
        setTimeout(calculateTotal, 0); // Tính tổng tiền sau khi cập nhật giá
      }
    } else if (field === "quantity") {
      const numValue = typeof value === 'string' ? parseFloat(value) || 0 : value;
      if (validateInput('quantity', numValue)) {
        updateItem(index, field, numValue);
        setTimeout(calculateTotal, 0); // Tính tổng tiền sau khi cập nhật số lượng
      }
    }
  };

  const handleAmountChange = (text: string) => {
    const numValue = parseFloat(text) || 0;
    if (validateInput('amount', numValue)) {
      setEditedTransaction({
        ...editedTransaction,
        amount: numValue,
      });
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={!!selectedTransaction}
      onRequestClose={onClose}
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
                    onChangeText={handleTypeChange}
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
                    style={[styles.input, errors['amount'] ? styles.inputError : null]}
                    value={editedTransaction.amount.toString()}
                    keyboardType="numeric"
                    onChangeText={handleAmountChange}
                    placeholder="Nhập số tiền"
                    maxLength={10}
                  />
                  {errors['amount'] && <Text style={styles.errorText}>{errors['amount']}</Text>}
                </View>
                <Text style={styles.sectionTitle}>Danh sách sản phẩm</Text>
                {editedTransaction.items?.map((item: TransactionItem, index: number) => (
                  <View key={index} style={styles.itemCard}>
                    <View style={styles.itemField}>
                      <Text style={styles.itemLabel}>Tên sản phẩm</Text>
                      <TextInput
                        style={[styles.itemInput, errors[`productName_${index}`] ? styles.inputError : null]}
                        value={item.productName}
                        onChangeText={(text) => handleUpdateItem(index, "productName", text)}
                        placeholder="Tên sản phẩm"
                        maxLength={50}
                      />
                      {errors[`productName_${index}`] && <Text style={styles.errorText}>{errors[`productName_${index}`]}</Text>}
                    </View>
                    <View style={styles.itemField}>
                      <Text style={styles.itemLabel}>Số lượng</Text>
                      <TextInput
                        style={[styles.itemInput, errors[`quantity_${index}`] ? styles.inputError : null]}
                        value={item.quantity.toString()}
                        keyboardType="numeric"
                        onChangeText={(text) =>
                          handleUpdateItem(index, "quantity", text)
                        }
                        placeholder="Số lượng"
                      />
                      {errors[`quantity_${index}`] && <Text style={styles.errorText}>{errors[`quantity_${index}`]}</Text>}
                    </View>
                    <View style={styles.itemField}>
                      <Text style={styles.itemLabel}>Giá (VNĐ)</Text>
                      <TextInput
                        style={[styles.itemInput, errors[`price_${index}`] ? styles.inputError : null]}
                        value={item.price.toString()}
                        keyboardType="numeric"
                        onChangeText={(text) => handleUpdateItem(index, "price", text)}
                        placeholder="Giá"
                        maxLength={10}
                      />
                      {errors[`price_${index}`] && <Text style={styles.errorText}>{errors[`price_${index}`]}</Text>}
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
                  selectedTransaction.items.map((item: TransactionItem, index: number) => (
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
                <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
                  <Text style={styles.buttonText}>Lưu</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={onCancel} style={styles.cancelButton}>
                  <Text style={styles.buttonText}>Hủy</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity onPress={onEdit} style={styles.editButton}>
                  <Text style={styles.buttonText}>Sửa</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => onDelete(selectedTransaction._id)}
                  style={styles.deleteButton}
                >
                  <Text style={styles.buttonText}>Xóa</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <Text style={styles.closeButtonText}>Đóng</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}; 