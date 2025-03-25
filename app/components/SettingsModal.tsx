import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, StyleSheet, Alert } from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { styles } from '../styles';
import BudgetScreen from '../(tabs)/BudgetScreen';
import { useRouter } from 'expo-router';

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
  totalExpense: number;
  transactions: any[];
  onBudgetSaved: () => void;
  navigation: any;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  visible,
  onClose,
  totalExpense,
  transactions,
  onBudgetSaved,
  navigation
}) => {
  const [currentScreen, setCurrentScreen] = useState<'main' | 'budget' | 'account'>('main');
  const router = useRouter();

  const handleLogout = async () => {
    Alert.alert(
      "Xác nhận đăng xuất",
      "Bạn có chắc chắn muốn đăng xuất không?",
      [
        { text: "Hủy", style: "cancel" },
        { 
          text: "Đăng xuất", 
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.removeItem("token");
              await AsyncStorage.removeItem("userId");
              // Chuyển hướng về trang đăng nhập sử dụng expo-router
              router.replace('/pages/login');
            } catch (error) {
              console.error("Lỗi khi đăng xuất:", error);
              Alert.alert("Lỗi", "Không thể đăng xuất. Vui lòng thử lại!");
            }
          }
        }
      ]
    );
  };

  const renderMainScreen = () => (
    <View style={modalStyles.container}>
      <View style={modalStyles.header}>
        <Text style={modalStyles.title}>Cài đặt</Text>
        <TouchableOpacity onPress={onClose} style={modalStyles.closeButton}>
          <Ionicons name="close" size={24} color="#28A745" />
        </TouchableOpacity>
      </View>

      <ScrollView style={modalStyles.content}>
        <TouchableOpacity 
          style={modalStyles.menuItem}
          onPress={() => setCurrentScreen('budget')}
        >
          <Ionicons name="wallet-outline" size={24} color="#28A745" style={modalStyles.menuIcon} />
          <Text style={modalStyles.menuText}>Quản lý ngân sách</Text>
          <Ionicons name="chevron-forward" size={20} color="#6C757D" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={modalStyles.menuItem}
          onPress={() => setCurrentScreen('account')}
        >
          <Ionicons name="person-outline" size={24} color="#28A745" style={modalStyles.menuIcon} />
          <Text style={modalStyles.menuText}>Thông tin tài khoản</Text>
          <Ionicons name="chevron-forward" size={20} color="#6C757D" />
        </TouchableOpacity>

        <TouchableOpacity style={modalStyles.menuItem}>
          <Ionicons name="notifications-outline" size={24} color="#28A745" style={modalStyles.menuIcon} />
          <Text style={modalStyles.menuText}>Thông báo</Text>
          <Ionicons name="chevron-forward" size={20} color="#6C757D" />
        </TouchableOpacity>

        <TouchableOpacity style={modalStyles.menuItem}>
          <Ionicons name="color-palette-outline" size={24} color="#28A745" style={modalStyles.menuIcon} />
          <Text style={modalStyles.menuText}>Giao diện</Text>
          <Ionicons name="chevron-forward" size={20} color="#6C757D" />
        </TouchableOpacity>

        <TouchableOpacity style={modalStyles.menuItem}>
          <Ionicons name="shield-checkmark-outline" size={24} color="#28A745" style={modalStyles.menuIcon} />
          <Text style={modalStyles.menuText}>Bảo mật</Text>
          <Ionicons name="chevron-forward" size={20} color="#6C757D" />
        </TouchableOpacity>

        <TouchableOpacity style={modalStyles.menuItem}>
          <Ionicons name="help-circle-outline" size={24} color="#28A745" style={modalStyles.menuIcon} />
          <Text style={modalStyles.menuText}>Trợ giúp & Hỗ trợ</Text>
          <Ionicons name="chevron-forward" size={20} color="#6C757D" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[modalStyles.menuItem, modalStyles.logoutItem]}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={24} color="#DC3545" style={modalStyles.menuIcon} />
          <Text style={[modalStyles.menuText, modalStyles.logoutText]}>Đăng xuất</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  const renderBudgetScreen = () => (
    <View style={modalStyles.container}>
      <View style={modalStyles.header}>
        <TouchableOpacity onPress={() => setCurrentScreen('main')} style={modalStyles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#28A745" />
        </TouchableOpacity>
        <Text style={modalStyles.title}>Quản lý ngân sách</Text>
        <TouchableOpacity onPress={onClose} style={modalStyles.closeButton}>
          <Ionicons name="close" size={24} color="#28A745" />
        </TouchableOpacity>
      </View>

      <BudgetScreen 
        onBudgetSaved={() => {
          onBudgetSaved();
          setCurrentScreen('main');
        }} 
        totalExpense={totalExpense}
        transactions={transactions}
      />
    </View>
  );

  const renderAccountScreen = () => (
    <View style={modalStyles.container}>
      <View style={modalStyles.header}>
        <TouchableOpacity onPress={() => setCurrentScreen('main')} style={modalStyles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#28A745" />
        </TouchableOpacity>
        <Text style={modalStyles.title}>Thông tin tài khoản</Text>
        <TouchableOpacity onPress={onClose} style={modalStyles.closeButton}>
          <Ionicons name="close" size={24} color="#28A745" />
        </TouchableOpacity>
      </View>

      <ScrollView style={modalStyles.content}>
        <View style={modalStyles.accountInfoContainer}>
          <View style={modalStyles.avatarContainer}>
            <Ionicons name="person-circle" size={80} color="#28A745" />
          </View>
          <Text style={modalStyles.userName}>Người dùng</Text>
          <Text style={modalStyles.userEmail}>user@example.com</Text>

          <TouchableOpacity style={modalStyles.editProfileButton}>
            <Text style={modalStyles.editProfileText}>Chỉnh sửa thông tin</Text>
          </TouchableOpacity>
        </View>

        <View style={modalStyles.accountSection}>
          <Text style={modalStyles.sectionTitle}>Thông tin cá nhân</Text>
          
          <View style={modalStyles.infoItem}>
            <Text style={modalStyles.infoLabel}>Họ và tên</Text>
            <Text style={modalStyles.infoValue}>Người dùng</Text>
          </View>
          
          <View style={modalStyles.infoItem}>
            <Text style={modalStyles.infoLabel}>Email</Text>
            <Text style={modalStyles.infoValue}>user@example.com</Text>
          </View>
          
          <View style={modalStyles.infoItem}>
            <Text style={modalStyles.infoLabel}>Số điện thoại</Text>
            <Text style={modalStyles.infoValue}>0123456789</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={modalStyles.modalContainer}>
        {currentScreen === 'main' && renderMainScreen()}
        {currentScreen === 'budget' && renderBudgetScreen()}
        {currentScreen === 'account' && renderAccountScreen()}
      </View>
    </Modal>
  );
};

const modalStyles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '90%',
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  backButton: {
    padding: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#28A745',
    flex: 1,
    textAlign: 'center',
  },
  closeButton: {
    padding: 5,
  },
  content: {
    flex: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  menuIcon: {
    marginRight: 15,
  },
  menuText: {
    fontSize: 16,
    color: '#212529',
    flex: 1,
  },
  logoutItem: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
  },
  logoutText: {
    color: '#DC3545',
  },
  accountInfoContainer: {
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  avatarContainer: {
    marginBottom: 10,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 14,
    color: '#6C757D',
    marginBottom: 15,
  },
  editProfileButton: {
    backgroundColor: '#28A745',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  editProfileText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  accountSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#28A745',
    marginBottom: 15,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  infoLabel: {
    fontSize: 16,
    color: '#6C757D',
  },
  infoValue: {
    fontSize: 16,
    color: '#212529',
    fontWeight: '500',
  },
});