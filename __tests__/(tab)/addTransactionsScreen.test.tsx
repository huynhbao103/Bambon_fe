import React from "react";
import { render, fireEvent, act } from "@testing-library/react-native";
import AddTransactionScreen from "../../app/(tabs)/settings";
import axios from "axios";
import * as ExpoRouter from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";

// Mock axios
jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock expo-router
jest.mock("expo-router", () => ({
  ...jest.requireActual("expo-router"),
  useRouter: jest.fn(),
}));

jest.spyOn(Alert, "alert");

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () => ({
  setItem: jest.fn(),
  getItem: jest.fn(() => Promise.resolve(JSON.stringify({ email: "test@example.com", token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjM0NTY3ODkwIn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c" }))),
  removeItem: jest.fn(),
}));

const mockUseRouter = ExpoRouter.useRouter as jest.Mock;

describe("AddTransactionScreen", () => {
  const mockRouter = { push: jest.fn() };
  const mockUserData = {
    email: "test@example.com",
    password: "correctpassword",
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue(mockRouter);

    await AsyncStorage.setItem("user", JSON.stringify({ email: "test@example.com", token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjM0NTY3ODkwIn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c" }));
  });
  describe("UTCID01", ()=>{
    it("Đã đăng nhập -> Không chọn loại giao dịch -> Báo lỗi", async () => {
        mockedAxios.post.mockRejectedValueOnce({
          response: { data: { message: "" } },
        });
    
        const { getByPlaceholderText, getByText, getByTestId, getByRole, findByText } = render(<AddTransactionScreen />);

        await act(async () => {
          fireEvent.press(getByRole("button", { name: "Gửi giao dịch" }));
        });
        expect(await findByText("Loại giao dịch")).toBeTruthy();
      });
    });
 describe("UTCID02", ()=>{
    it("Đã đăng nhập -> Chọn loại giao dịch %s -> Gửi giao dịch", async () => {
        mockedAxios.post.mockResolvedValueOnce({ data: { message: "" } });
    
        const { getByTestId, getByRole, findByText } = render(<AddTransactionScreen />);
    
        // Chọn loại giao dịch
        fireEvent.press(getByTestId(`transaction-type-income`));
    
        // Nhấn gửi
        await act(async () => {
          fireEvent.press(getByRole("button", { name: "Gửi giao dịch" }));
        });
     
        expect(Alert.alert).toHaveBeenCalledWith("Lỗi", "Vui lòng điền đầy đủ thông tin giao dịch.");
      });
    });
    it("Đã đăng nhập -> Chọn loại giao dịch %s -> Gửi giao dịch", async () => {
      mockedAxios.post.mockResolvedValueOnce({ data: { message: "" } });
  
      const { getByTestId, getByRole, findByText } = render(<AddTransactionScreen />);
  
      // Chọn loại giao dịch
      fireEvent.press(getByTestId(`transaction-type-expense`));
  
      // Nhấn gửi
      await act(async () => {
        fireEvent.press(getByRole("button", { name: "Gửi giao dịch" }));
      });
   
      expect(Alert.alert).toHaveBeenCalledWith("Lỗi", "Vui lòng điền đầy đủ thông tin giao dịch.");
    });
  });

