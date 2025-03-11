// import React from "react";
// import { render, fireEvent, waitFor, screen } from "@testing-library/react-native";
// import LoginScreen from "../../app/pages/login";
// import axios from "axios";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { useRouter } from "expo-router";

// // Mock useRouter để kiểm tra điều hướng
// jest.mock("expo-router", () => ({
//     useRouter: () => ({
//       push: jest.fn(),
//     }),
//   }));

// // Mock AsyncStorage
// jest.mock("@react-native-async-storage/async-storage", () => ({
//     setItem: jest.fn(),
//     getItem: jest.fn(),
//     removeItem: jest.fn(),
//   }));

// // Mock axios
// jest.mock("axios");

// describe("LoginScreen", () => {
//   const mockRouterPush = jest.fn();

//   beforeEach(() => {
//     jest.clearAllMocks();
//     (useRouter as jest.Mock).mockReturnValue({ push: mockRouterPush });
//   });

//   it("renders the login screen correctly", () => {
//     render(<LoginScreen />);
    
//     expect(screen.getByPlaceholderText("Email")).toBeTruthy();
//     expect(screen.getByPlaceholderText("Password")).toBeTruthy();
//     expect(screen.getByText("Login")).toBeTruthy();
//     expect(screen.getByText("Go to Register")).toBeTruthy();
//   });

//   it("updates state when user inputs email and password", () => {
//     render(<LoginScreen />);
    
//     const emailInput = screen.getByPlaceholderText("Email");
//     const passwordInput = screen.getByPlaceholderText("Password");

//     fireEvent.changeText(emailInput, "test@example.com");
//     fireEvent.changeText(passwordInput, "password123");

//     expect(emailInput.props.value).toBe("test@example.com");
//     expect(passwordInput.props.value).toBe("password123");
//   });

//   it("logs in successfully and navigates to home", async () => {
//     (axios.post as jest.Mock).mockResolvedValue({ data: { token: "mockToken" } });

//     render(<LoginScreen />);
    
//     fireEvent.changeText(screen.getByPlaceholderText("Email"), "test@example.com");
//     fireEvent.changeText(screen.getByPlaceholderText("Password"), "password123");

//     fireEvent.press(screen.getByText("Login"));

//     await waitFor(() => expect(axios.post).toHaveBeenCalledWith(
//       expect.stringContaining("/auth/login"),
//       { email: "test@example.com", password: "password123" }
//     ));

//     await waitFor(() => expect(AsyncStorage.setItem).toHaveBeenCalledWith("token", "mockToken"));
//     await waitFor(() => expect(mockRouterPush).toHaveBeenCalledWith("/(tabs)/home"));
//   });

//   it("shows an error message when login fails", async () => {
//     (axios.post as jest.Mock).mockRejectedValue({ response: { data: { message: "Sai email hoặc mật khẩu!" } } });

//     render(<LoginScreen />);
    
//     fireEvent.changeText(screen.getByPlaceholderText("Email"), "wrong@example.com");
//     fireEvent.changeText(screen.getByPlaceholderText("Password"), "wrongpassword");

//     fireEvent.press(screen.getByText("Login"));

//     await waitFor(() => expect(screen.getByText("Sai email hoặc mật khẩu!")).toBeTruthy());
//   });
// });
