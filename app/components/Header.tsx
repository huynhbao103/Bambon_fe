import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { styles } from '../styles';

interface HeaderProps {
  totalIncome: number;
  totalExpense: number;
  budget: number | null;
  showIncome: boolean;
  showExpense: boolean;
  toggleIncome: () => void;
  toggleExpense: () => void;
  onSettingsPress: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  totalIncome,
  totalExpense,
  budget,
  showIncome,
  showExpense,
  toggleIncome,
  toggleExpense,
  onSettingsPress,
}) => {
  return (
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
        <TouchableOpacity onPress={onSettingsPress} style={styles.settingsButton}>
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
            Ngân sách: {budget.toLocaleString()} đ | Còn lại:{" "}
            {(budget - totalExpense).toLocaleString()} đ
          </Text>
        </View>
      )}
    </View>
  );
};