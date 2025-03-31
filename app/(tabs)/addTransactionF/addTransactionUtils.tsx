import { Alert } from 'react-native';
import axios from 'axios';
import { BACKEND_URL } from '../../../config';

// Hàm validateForm
export function validateForm(type: string, category: string, amount: string, items: { productName: string; quantity: string; price: string }[], setErrors: (errors: {[key: string]: string}) => void) {
  const newErrors: {[key: string]: string} = {};

  if (!type) {
    Alert.alert('Lỗi', 'Vui lòng chọn loại giao dịch.');
    return false;
  }

  if (!category) {
    Alert.alert('Lỗi', 'Vui lòng chọn danh mục.');
    return false;
  }

  if (type === 'income') {
    if (!amount || amount.trim() === '') {
      newErrors.amount = 'Vui lòng nhập số tiền';
      setErrors(newErrors);
      return false;
    }
    const parsedAmount = Math.abs(Number(amount.replace(/[^0-9]/g, ''))); // Chỉ nhận số dương
    if (parsedAmount <= 0) {
      newErrors.amount = 'Số tiền phải lớn hơn 0';
      setErrors(newErrors);
      return false;
    }
  }

  if (type === 'expense') {
    if (items.length === 0) {
      newErrors.items = 'Vui lòng thêm ít nhất một mục chi tiêu';
      setErrors(newErrors);
      return false;
    }

    const itemErrors: string[] = [];
    items.forEach((item, i) => {
      const itemIndex = i + 1;
      if (!item.productName || item.productName.trim() === '') {
        itemErrors.push(`Tên sản phẩm ${itemIndex} không được để trống`);
      }
      if (!item.quantity || item.quantity.trim() === '') {
        itemErrors.push(`Vui lòng nhập số lượng cho sản phẩm ${itemIndex}`);
      } else {
        const quantity = Math.abs(Number(item.quantity.replace(/[^0-9]/g, ''))); // Chỉ nhận số dương
        if (quantity <= 0 || !Number.isInteger(quantity)) {
          itemErrors.push(`Số lượng của sản phẩm ${itemIndex} phải là số nguyên dương`);
        }
      }
      if (!item.price || item.price.trim() === '') {
        itemErrors.push(`Vui lòng nhập đơn giá cho sản phẩm ${itemIndex}`);
      } else {
        const price = Math.abs(Number(item.price.replace(/[^0-9]/g, ''))); // Chỉ nhận số dương
        if (price <= 0) {
          itemErrors.push(`Đơn giá của sản phẩm ${itemIndex} phải lớn hơn 0`);
        }
      }
    });

    if (itemErrors.length > 0) {
      newErrors.itemDetails = itemErrors.join('\n');
      setErrors(newErrors);
      return false;
    }
  }

  setErrors({});
  return true;
}

// Hàm calculateTotalAmount
export function calculateTotalAmount(items: { productName: string; quantity: string; price: string }[]) {
  return items.reduce((total, item) => {
    const quantity = Math.abs(Number(item.quantity.replace(/[^0-9]/g, ''))) || 0; // Chỉ nhận số dương
    const price = Math.abs(Number(item.price.replace(/[^0-9]/g, ''))) || 0; // Chỉ nhận số dương
    return total + quantity * price;
  }, 0);
}

// Hàm addItem
export function addItem(items: { productName: string; quantity: string; price: string }[], setItems: (items: { productName: string; quantity: string; price: string }[]) => void) {
  setItems([...items, { productName: '', quantity: '', price: '' }]);
}

// Hàm updateItem
export function updateItem(index: number, field: string, value: string, items: { productName: string; quantity: string; price: string }[], setItems: (items: { productName: string; quantity: string; price: string }[]) => void) {
  const updatedItems = [...items];
  if (field === 'quantity' || field === 'price') {
    value = value.replace(/[^0-9]/g, ''); // Chỉ nhận số, loại bỏ tất cả ký tự không hợp lệ
  }
  updatedItems[index] = { ...updatedItems[index], [field]: value };
  setItems(updatedItems);
}

// Hàm addCustomCategory
export function addCustomCategory(
  customCategory: string,
  type: string,
  incomeCategories: { name: string; icon: string }[],
  expenseCategories: { name: string; icon: string }[],
  setIncomeCategories: (categories: { name: string; icon: string }[]) => void,
  setExpenseCategories: (categories: { name: string; icon: string }[]) => void,
  setCategory: (category: string) => void,
  setCustomCategory: (customCategory: string) => void,
  setShowCustomCategoryInput: (show: boolean) => void,
  setErrors: (errors: {[key: string]: string}) => void
) {
  if (!customCategory.trim()) {
    setErrors({ customCategory: 'Vui lòng nhập tên danh mục' });
    return;
  }

  const categories = type === 'income' ? incomeCategories : expenseCategories;
  if (categories.some(c => c.name.toLowerCase() === customCategory.trim().toLowerCase())) {
    setErrors({ customCategory: 'Danh mục này đã tồn tại' });
    return;
  }

  if (type === 'income') {
    setIncomeCategories([...incomeCategories, { name: customCategory, icon: 'tag' }]);
    setCategory(customCategory);
  } else if (type === 'expense') {
    setExpenseCategories([...expenseCategories, { name: customCategory, icon: 'tag' }]);
    setCategory(customCategory);
  }

  setCustomCategory('');
  setShowCustomCategoryInput(false);
}

// Hàm submitTransaction
export async function submitTransaction(
  userId: string | null,
  type: string,
  category: string,
  amount: string,
  items: { productName: string; quantity: string; price: string }[],
  setIsLoading: (loading: boolean) => void,
  setCategory: (category: string) => void,
  setAmount: (amount: string) => void,
  setType: (type: string) => void,
  setItems: (items: { productName: string; quantity: string; price: string }[]) => void,
  setErrors: (errors: {[key: string]: string}) => void
) {
  if (!userId) {
    Alert.alert('Lỗi', 'Vui lòng đăng nhập để thực hiện giao dịch.');
    return;
  }

  if (!type) {
    Alert.alert('Lỗi', 'Vui lòng chọn loại giao dịch.');
    return;
  }

  if (!category) {
    Alert.alert('Lỗi', 'Vui lòng chọn danh mục.');
    return;
  }

  if (type === 'income') {
    if (!amount || amount.trim() === '') {
      Alert.alert('Lỗi', 'Vui lòng nhập số tiền.');
      return;
    }
    const parsedAmount = Math.abs(Number(amount.replace(/[^0-9]/g, ''))); // Chỉ nhận số dương
    if (parsedAmount <= 0) {
      Alert.alert('Lỗi', 'Số tiền phải lớn hơn 0.');
      return;
    }
  }

  if (type === 'expense') {
    if (items.length === 0) {
      Alert.alert('Lỗi', 'Vui lòng thêm ít nhất một mục chi tiêu.');
      return;
    }

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const itemIndex = i + 1;

      if (!item.productName || item.productName.trim() === '') {
        Alert.alert('Lỗi', `Vui lòng nhập tên cho sản phẩm ${itemIndex}.`);
        return;
      }

      if (!item.quantity || item.quantity.trim() === '') {
        Alert.alert('Lỗi', `Vui lòng nhập số lượng cho sản phẩm ${itemIndex}.`);
        return;
      }
      const quantity = Math.abs(Number(item.quantity.replace(/[^0-9]/g, ''))); // Chỉ nhận số dương
      if (quantity <= 0 || !Number.isInteger(quantity)) {
        Alert.alert('Lỗi', `Số lượng của sản phẩm ${itemIndex} phải là số nguyên dương.`);
        return;
      }

      if (!item.price || item.price.trim() === '') {
        Alert.alert('Lỗi', `Vui lòng nhập đơn giá cho sản phẩm ${itemIndex}.`);
        return;
      }
      const price = Math.abs(Number(item.price.replace(/[^0-9]/g, ''))); // Chỉ nhận số dương
      if (price <= 0) {
        Alert.alert('Lỗi', `Đơn giá của sản phẩm ${itemIndex} phải lớn hơn 0.`);
        return;
      }
    }
  }

  setIsLoading(true);

  try {
    const parsedAmount = type === 'income' ? Math.abs(Number(amount.replace(/[^0-9]/g, ''))) : calculateTotalAmount(items);
    const transactionData = {
      userId,
      type,
      category,
      amount: parsedAmount,
      items: type === 'expense' ? items : undefined,
      createdAt: new Date().toISOString(),
    };

    await axios.post(`${BACKEND_URL}/transactions`, transactionData);
    Alert.alert('Thành công', 'Giao dịch đã được thêm thành công!');

    setCategory('');
    setAmount('');
    setType('');
    setItems([]);
    setErrors({});
  } catch (error) {
    console.error('Lỗi khi thêm giao dịch:', error);
    Alert.alert('Lỗi', 'Đã có lỗi xảy ra khi gửi dữ liệu.');
  } finally {
    setIsLoading(false);
  }
}