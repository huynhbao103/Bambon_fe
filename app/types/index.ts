import { StackNavigationProp } from "@react-navigation/stack";

export type RootStackParamList = {
  HomeScreen: undefined;
  BudgetScreen: undefined;
};

export type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, "HomeScreen">;

export interface HomeScreenProps {
  navigation: HomeScreenNavigationProp;
}

export interface Transaction {
  _id: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  date: string;
  items?: TransactionItem[];
}

export interface TransactionItem {
  productName: string;
  quantity: number;
  price: number;
}

export interface FilterOption {
  day: string;
  week: string;
  month: string;
  year: string;
}

export type FilterType = keyof FilterOption; 