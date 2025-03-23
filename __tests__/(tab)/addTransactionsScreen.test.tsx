import React from "react";
import { render, fireEvent, act, waitFor } from "@testing-library/react-native";
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

    // Mock AsyncStorage.getItem để trả về userId
    (AsyncStorage.getItem as jest.Mock).mockImplementation((key) => {
      if (key === "userId") {
        return Promise.resolve("test-user-id");
      }
      return Promise.resolve(null);
    });

    await AsyncStorage.setItem("user", JSON.stringify({ email: "test@example.com", token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjM0NTY3ODkwIn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c" }));
  });

  // UTCID01: Không chọn loại giao dịch
  describe("UTCID01", () => {
    it("Đã đăng nhập -> Không chọn loại giao dịch -> Báo lỗi", async () => {
      mockedAxios.post.mockRejectedValueOnce({
        response: { data: { message: "" } },
      });
  
      const { getByRole, findByText } = render(<AddTransactionScreen />);

      await act(async () => {
        fireEvent.press(getByRole("button", { name: "Gửi giao dịch" }));
      });
      
      expect(await findByText("Loại giao dịch")).toBeTruthy();
      expect(Alert.alert).toHaveBeenCalledWith("Lỗi", "Vui lòng điền đầy đủ thông tin giao dịch.");
    });
  });

  // UTCID02: Chọn loại giao dịch thu nhập nhưng không chọn danh mục
  describe("UTCID02", () => {
    it("Đã đăng nhập -> Chọn loại giao dịch thu nhập -> Không chọn danh mục -> Báo lỗi", async () => {
      mockedAxios.post.mockResolvedValueOnce({ data: { message: "" } });
  
      const { getByTestId, getByRole } = render(<AddTransactionScreen />);
  
      // Chọn loại giao dịch thu nhập
      fireEvent.press(getByTestId("transaction-type-income"));
  
      // Nhấn gửi
      await act(async () => {
        fireEvent.press(getByRole("button", { name: "Gửi giao dịch" }));
      });
   
      expect(Alert.alert).toHaveBeenCalledWith("Lỗi", "Vui lòng điền đầy đủ thông tin giao dịch.");
    });
  });

  // UTCID03: Chọn loại giao dịch chi tiêu nhưng không chọn danh mục
  describe("UTCID03", () => {
    it("Đã đăng nhập -> Chọn loại giao dịch chi tiêu -> Không chọn danh mục -> Báo lỗi", async () => {
      mockedAxios.post.mockResolvedValueOnce({ data: { message: "" } });
  
      const { getByTestId, getByRole } = render(<AddTransactionScreen />);
  
      // Chọn loại giao dịch chi tiêu
      fireEvent.press(getByTestId("transaction-type-expense"));
  
      // Nhấn gửi
      await act(async () => {
        fireEvent.press(getByRole("button", { name: "Gửi giao dịch" }));
      });
   
      expect(Alert.alert).toHaveBeenCalledWith("Lỗi", "Vui lòng điền đầy đủ thông tin giao dịch.");
    });
  });

  // UTCID04: Chọn loại giao dịch thu nhập, chọn danh mục, nhưng không nhập số tiền
  describe("UTCID04", () => {
    it("Đã đăng nhập -> Chọn loại giao dịch thu nhập -> Chọn danh mục -> Không nhập số tiền -> Báo lỗi", async () => {
      const { getByTestId, getByRole, getAllByText } = render(<AddTransactionScreen />);
  
      // Chọn loại giao dịch thu nhập
      fireEvent.press(getByTestId("transaction-type-income"));
  
      // Chọn danh mục Lương
      await waitFor(() => {
        const categoryButtons = getAllByText("Lương");
        if (categoryButtons.length > 0) {
          fireEvent.press(categoryButtons[0]);
        }
      });
  
      // Nhấn gửi
      await act(async () => {
        fireEvent.press(getByRole("button", { name: "Gửi giao dịch" }));
      });
   
      expect(Alert.alert).toHaveBeenCalledWith("Lỗi", "Đã có lỗi xảy ra khi gửi dữ liệu.");
    });
  });

  // UTCID05: Chọn loại giao dịch thu nhập, chọn danh mục, nhập số tiền không hợp lệ
  describe("UTCID05", () => {
    it("Đã đăng nhập -> Chọn loại giao dịch thu nhập -> Chọn danh mục -> Nhập số tiền không hợp lệ -> Báo lỗi", async () => {
      const { getByTestId, getByRole, getAllByText, getByPlaceholderText } = render(<AddTransactionScreen />);
  
      // Chọn loại giao dịch thu nhập
      fireEvent.press(getByTestId("transaction-type-income"));
  
      // Chọn danh mục Lương
      await waitFor(() => {
        const categoryButtons = getAllByText("Lương");
        if (categoryButtons.length > 0) {
          fireEvent.press(categoryButtons[0]);
        }
      });
  
      // Nhập số tiền không hợp lệ
      fireEvent.changeText(getByPlaceholderText("Nhập số tiền"), "-1000");
  
      // Nhấn gửi
      await act(async () => {
        fireEvent.press(getByRole("button", { name: "Gửi giao dịch" }));
      });
     expect(Alert.alert).toHaveBeenCalledWith("Lỗi", "Đã có lỗi xảy ra khi gửi dữ liệu.");
    });
  });

  // UTCID06: Chọn loại giao dịch chi tiêu, chọn danh mục, không thêm mục chi tiêu
  describe("UTCID06", () => {
    it("Đã đăng nhập -> Chọn loại giao dịch chi tiêu -> Chọn danh mục -> Không thêm mục chi tiêu -> Báo lỗi", async () => {
      const { getByTestId, getByRole, getAllByText } = render(<AddTransactionScreen />);
  
      // Chọn loại giao dịch chi tiêu
      fireEvent.press(getByTestId("transaction-type-expense"));
  
      // Chọn danh mục Ăn uống
      await waitFor(() => {
        const categoryButtons = getAllByText("Ăn uống");
        if (categoryButtons.length > 0) {
          fireEvent.press(categoryButtons[0]);
        }
      });
  
      // Nhấn gửi
      await act(async () => {
        fireEvent.press(getByRole("button", { name: "Gửi giao dịch" }));
      });
   
      expect(Alert.alert).toHaveBeenCalledWith("Lỗi", "Đã có lỗi xảy ra khi gửi dữ liệu.");
    });
  });

  // UTCID07-08: Thêm mục chi tiêu nhưng không nhập tên sản phẩm
  describe("UTCID07-08", () => {
    it("Đã đăng nhập -> Chọn loại giao dịch chi tiêu -> Chọn danh mục -> Thêm mục chi tiêu không nhập tên sản phẩm -> Báo lỗi", async () => {
      const { getByTestId, getByRole, getAllByText, getByText, getAllByPlaceholderText } = render(<AddTransactionScreen />);
  
      // Chọn loại giao dịch chi tiêu
      fireEvent.press(getByTestId("transaction-type-expense"));
  
      // Chọn danh mục Ăn uống
      await waitFor(() => {
        const categoryButtons = getAllByText("Ăn uống");
        if (categoryButtons.length > 0) {
          fireEvent.press(categoryButtons[0]);
        }
      });
  
      // Thêm mục chi tiêu
      fireEvent.press(getByText("Thêm mục"));
  
      // Nhập số lượng và đơn giá nhưng không nhập tên sản phẩm
      await waitFor(() => {
        const quantityInputs = getAllByPlaceholderText("VD: 2");
        const priceInputs = getAllByPlaceholderText("VD: 25000");
        if (quantityInputs.length > 0 && priceInputs.length > 0) {
          fireEvent.changeText(quantityInputs[0], "2");
          fireEvent.changeText(priceInputs[0], "25000");
        }
      });
  
      // Nhấn gửi
      await act(async () => {
        fireEvent.press(getByRole("button", { name: "Gửi giao dịch" }));
      });
   
      expect(Alert.alert).toHaveBeenCalledWith("Lỗi", "Vui lòng điền đầy đủ thông tin giao dịch.");
    });
  });

  // UTCID09-10: Thêm mục chi tiêu nhưng không nhập số lượng
  describe("UTCID09-10", () => {
    it("Đã đăng nhập -> Chọn loại giao dịch chi tiêu -> Chọn danh mục -> Thêm mục chi tiêu không nhập số lượng -> Báo lỗi", async () => {
      const { getByTestId, getByRole, getAllByText, getByText, getAllByPlaceholderText } = render(<AddTransactionScreen />);
  
      // Chọn loại giao dịch chi tiêu
      fireEvent.press(getByTestId("transaction-type-expense"));
  
      // Chọn danh mục Ăn uống
      await waitFor(() => {
        const categoryButtons = getAllByText("Ăn uống");
        if (categoryButtons.length > 0) {
          fireEvent.press(categoryButtons[0]);
        }
      });
  
      // Thêm mục chi tiêu
      fireEvent.press(getByText("Thêm mục"));
  
      // Nhập tên sản phẩm và đơn giá nhưng không nhập số lượng
      await waitFor(() => {
        const productInputs = getAllByPlaceholderText("VD: Cà phê");
        const priceInputs = getAllByPlaceholderText("VD: 25000");
        if (productInputs.length > 0 && priceInputs.length > 0) {
          fireEvent.changeText(productInputs[0], "Cà phê");
          fireEvent.changeText(priceInputs[0], "25000");
        }
      });
  
      // Nhấn gửi
      await act(async () => {
        fireEvent.press(getByRole("button", { name: "Gửi giao dịch" }));
      });
   
      expect(Alert.alert).toHaveBeenCalledWith("Lỗi", "Vui lòng điền đầy đủ thông tin giao dịch.");
    });
  });

  // UTCID11-12: Thêm mục chi tiêu nhưng không nhập đơn giá
  describe("UTCID11-12", () => {
    it("Đã đăng nhập -> Chọn loại giao dịch chi tiêu -> Chọn danh mục -> Thêm mục chi tiêu không nhập đơn giá -> Báo lỗi", async () => {
      const { getByTestId, getByRole, getAllByText, getByText, getAllByPlaceholderText } = render(<AddTransactionScreen />);
  
      // Chọn loại giao dịch chi tiêu
      fireEvent.press(getByTestId("transaction-type-expense"));
  
      // Chọn danh mục Ăn uống
      await waitFor(() => {
        const categoryButtons = getAllByText("Ăn uống");
        if (categoryButtons.length > 0) {
          fireEvent.press(categoryButtons[0]);
        }
      });
  
      // Thêm mục chi tiêu
      fireEvent.press(getByText("Thêm mục"));
  
      // Nhập tên sản phẩm và số lượng nhưng không nhập đơn giá
      await waitFor(() => {
        const productInputs = getAllByPlaceholderText("VD: Cà phê");
        const quantityInputs = getAllByPlaceholderText("VD: 2");
        if (productInputs.length > 0 && quantityInputs.length > 0) {
          fireEvent.changeText(productInputs[0], "Cà phê");
          fireEvent.changeText(quantityInputs[0], "2");
        }
      });
  
      // Nhấn gửi
      await act(async () => {
        fireEvent.press(getByRole("button", { name: "Gửi giao dịch" }));
      });
   
      expect(Alert.alert).toHaveBeenCalledWith("Lỗi", "Vui lòng điền đầy đủ thông tin giao dịch.");
    });
  });

  // UTCID13-14: Thêm mục chi tiêu với số lượng không hợp lệ
  describe("UTCID13-14", () => {
    it("Đã đăng nhập -> Chọn loại giao dịch chi tiêu -> Chọn danh mục -> Thêm mục chi tiêu với số lượng không hợp lệ -> Báo lỗi", async () => {
      const { getByTestId, getByRole, getAllByText, getByText, getAllByPlaceholderText } = render(<AddTransactionScreen />);
  
      // Chọn loại giao dịch chi tiêu
      fireEvent.press(getByTestId("transaction-type-expense"));
  
      // Chọn danh mục Ăn uống
      await waitFor(() => {
        const categoryButtons = getAllByText("Ăn uống");
        if (categoryButtons.length > 0) {
          fireEvent.press(categoryButtons[0]);
        }
      });
  
      // Thêm mục chi tiêu
      fireEvent.press(getByText("Thêm mục"));
  
      // Nhập tên sản phẩm, số lượng không hợp lệ và đơn giá
      await waitFor(() => {
        const productInputs = getAllByPlaceholderText("VD: Cà phê");
        const quantityInputs = getAllByPlaceholderText("VD: 2");
        const priceInputs = getAllByPlaceholderText("VD: 25000");
        if (productInputs.length > 0 && quantityInputs.length > 0 && priceInputs.length > 0) {
          fireEvent.changeText(productInputs[0], "Cà phê");
          fireEvent.changeText(quantityInputs[0], "-2"); // Số lượng không hợp lệ
          fireEvent.changeText(priceInputs[0], "25000");
        }
      });
  
      // Nhấn gửi
      await act(async () => {
        fireEvent.press(getByRole("button", { name: "Gửi giao dịch" }));
      });
   
      expect(Alert.alert).toHaveBeenCalledWith("Lỗi", "Vui lòng điền đầy đủ thông tin giao dịch.");
    });
  });

  // UTCID15-16: Thêm mục chi tiêu với đơn giá không hợp lệ
  describe("UTCID15-16", () => {
    it("Đã đăng nhập -> Chọn loại giao dịch chi tiêu -> Chọn danh mục -> Thêm mục chi tiêu với đơn giá không hợp lệ -> Báo lỗi", async () => {
      const { getByTestId, getByRole, getAllByText, getByText, getAllByPlaceholderText } = render(<AddTransactionScreen />);
  
      // Chọn loại giao dịch chi tiêu
      fireEvent.press(getByTestId("transaction-type-expense"));
  
      // Chọn danh mục Ăn uống
      await waitFor(() => {
        const categoryButtons = getAllByText("Ăn uống");
        if (categoryButtons.length > 0) {
          fireEvent.press(categoryButtons[0]);
        }
      });
  
      // Thêm mục chi tiêu
      fireEvent.press(getByText("Thêm mục"));
  
      // Nhập tên sản phẩm, số lượng và đơn giá không hợp lệ
      await waitFor(() => {
        const productInputs = getAllByPlaceholderText("VD: Cà phê");
        const quantityInputs = getAllByPlaceholderText("VD: 2");
        const priceInputs = getAllByPlaceholderText("VD: 25000");
        if (productInputs.length > 0 && quantityInputs.length > 0 && priceInputs.length > 0) {
          fireEvent.changeText(productInputs[0], "Cà phê");
          fireEvent.changeText(quantityInputs[0], "2");
          fireEvent.changeText(priceInputs[0], "-25000"); // Đơn giá không hợp lệ
        }
      });
  
      // Nhấn gửi
      await act(async () => {
        fireEvent.press(getByRole("button", { name: "Gửi giao dịch" }));
      });
   
      expect(Alert.alert).toHaveBeenCalledWith("Lỗi", "Vui lòng điền đầy đủ thông tin giao dịch.");
    });
  });

  // UTCID17-18: Thêm mục chi tiêu hợp lệ và gửi giao dịch thành công
  describe("UTCID17-18", () => {
    it("Đã đăng nhập -> Chọn loại giao dịch chi tiêu -> Chọn danh mục -> Thêm mục chi tiêu hợp lệ -> Gửi giao dịch thành công", async () => {
      // Mock axios.post để trả về thành công
      mockedAxios.post.mockResolvedValueOnce({ data: { message: "success" } });

      const { getByTestId, getByRole, getAllByText, getByText, getAllByPlaceholderText } = render(<AddTransactionScreen />);
  
      // Chọn loại giao dịch chi tiêu
      fireEvent.press(getByTestId("transaction-type-expense"));
  
      // Chọn danh mục Ăn uống
      await waitFor(() => {
        const categoryButtons = getAllByText("Ăn uống");
        if (categoryButtons.length > 0) {
          fireEvent.press(categoryButtons[0]);
        }
      });
  
      // Thêm mục chi tiêu
      fireEvent.press(getByText("Thêm mục"));
  
      // Nhập đầy đủ thông tin hợp lệ cho mục chi tiêu
      await waitFor(() => {
        const productInputs = getAllByPlaceholderText("VD: Cà phê");
        const quantityInputs = getAllByPlaceholderText("VD: 2");
        const priceInputs = getAllByPlaceholderText("VD: 25000");
        if (productInputs.length > 0 && quantityInputs.length > 0 && priceInputs.length > 0) {
          fireEvent.changeText(productInputs[0], "Cà phê");
          fireEvent.changeText(quantityInputs[0], "2");
          fireEvent.changeText(priceInputs[0], "25000");
        }
      });
  
      // Nhấn gửi
      await act(async () => {
        fireEvent.press(getByRole("button", { name: "Gửi giao dịch" }));
      });
   
      // Kiểm tra xem API đã được gọi với dữ liệu đúng chưa
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          userId: "test-user-id",
          type: "expense",
          category: "Ăn uống",
          items: expect.arrayContaining([
            expect.objectContaining({
              productName: "Cà phê",
              quantity: "2",
              price: "25000"
            })
          ])
        })
      );
      
      // Kiểm tra thông báo thành công
      expect(Alert.alert).toHaveBeenCalledWith("Thành công", "Giao dịch đã được thêm thành công!");
    });
  });

  // UTCID19-20: Thêm giao dịch thu nhập hợp lệ và gửi giao dịch thành công
  describe("UTCID19-20", () => {
    it("Đã đăng nhập -> Chọn loại giao dịch thu nhập -> Chọn danh mục -> Nhập số tiền hợp lệ -> Gửi giao dịch thành công", async () => {
      // Mock axios.post để trả về thành công
      mockedAxios.post.mockResolvedValueOnce({ data: { message: "success" } });

      const { getByTestId, getByRole, getAllByText, getByPlaceholderText } = render(<AddTransactionScreen />);
  
      // Chọn loại giao dịch thu nhập
      fireEvent.press(getByTestId("transaction-type-income"));
  
      // Chọn danh mục Lương
      await waitFor(() => {
        const categoryButtons = getAllByText("Lương");
        if (categoryButtons.length > 0) {
          fireEvent.press(categoryButtons[0]);
        }
      });
  
      // Nhập số tiền hợp lệ
      fireEvent.changeText(getByPlaceholderText("Nhập số tiền"), "5000000");
  
      // Nhấn gửi
      await act(async () => {
        fireEvent.press(getByRole("button", { name: "Gửi giao dịch" }));
      });
   
      // Kiểm tra xem API đã được gọi với dữ liệu đúng chưa
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          userId: "test-user-id",
          type: "income",
          category: "Lương",
          amount: 5000000
        })
      );
      
      // Kiểm tra thông báo thành công
      expect(Alert.alert).toHaveBeenCalledWith("Thành công", "Giao dịch đã được thêm thành công!");
    });
  });

  // UTCID21-22: Thêm danh mục tùy chỉnh và gửi giao dịch thành công
  describe("UTCID21-22", () => {
    it("Đã đăng nhập -> Chọn loại giao dịch thu nhập -> Thêm danh mục tùy chỉnh -> Nhập số tiền hợp lệ -> Gửi giao dịch thành công", async () => {
      // Mock axios.post để trả về thành công
      mockedAxios.post.mockResolvedValueOnce({ data: { message: "success" } });

      const { getByTestId, getByRole, getByText, getByPlaceholderText, getAllByPlaceholderText } = render(<AddTransactionScreen />);
  
      // Chọn loại giao dịch thu nhập
      fireEvent.press(getByTestId("transaction-type-income"));
  
      // Nhấn nút thêm danh mục mới
      await waitFor(() => {
        fireEvent.press(getByText("Thêm mới"));
      });
  
      // Nhập tên danh mục tùy chỉnh
      await waitFor(() => {
        const customCategoryInput = getAllByPlaceholderText("Nhập danh mục mới");
        if (customCategoryInput.length > 0) {
          fireEvent.changeText(customCategoryInput[0], "Freelance");
        }
      });
  
      // Nhấn nút thêm danh mục
      await waitFor(() => {
        const addButton = getByText("Thêm");
        if (addButtons.length > 0) {
          fireEvent.press(addButtons[0]);
        }
      });
  
      // Nhập số tiền hợp lệ
      fireEvent.changeText(getByPlaceholderText("Nhập số tiền"), "3000000");
  
      // Nhấn gửi
      await act(async () => {
        fireEvent.press(getByRole("button", { name: "Gửi giao dịch" }));
      });
   
      // Kiểm tra xem API đã được gọi với dữ liệu đúng chưa
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          userId: "test-user-id",
          type: "income",
          category: "Freelance",
          amount: 3000000
        })
      );
      
      // Kiểm tra thông báo thành công
      expect(Alert.alert).toHaveBeenCalledWith("Thành công", "Giao dịch đã được thêm thành công!");
    });
  });

  // UTCID23-24: Thêm nhiều mục chi tiêu và gửi giao dịch thành công
  describe("UTCID23-24", () => {
    it("Đã đăng nhập -> Chọn loại giao dịch chi tiêu -> Chọn danh mục -> Thêm nhiều mục chi tiêu hợp lệ -> Gửi giao dịch thành công", async () => {
      // Mock axios.post để trả về thành công
      mockedAxios.post.mockResolvedValueOnce({ data: { message: "success" } });

      const { getByTestId, getByRole, getAllByText, getByText, getAllByPlaceholderText } = render(<AddTransactionScreen />);
  
      // Chọn loại giao dịch chi tiêu
      fireEvent.press(getByTestId("transaction-type-expense"));
  
      // Chọn danh mục Ăn uống
      await waitFor(() => {
        const categoryButtons = getAllByText("Ăn uống");
        if (categoryButtons.length > 0) {
          fireEvent.press(categoryButtons[0]);
        }
      });
  
      // Thêm mục chi tiêu đầu tiên
      fireEvent.press(getByText("Thêm mục"));
  
      // Nhập đầy đủ thông tin hợp lệ cho mục chi tiêu đầu tiên
      await waitFor(() => {
        const productInputs = getAllByPlaceholderText("VD: Cà phê");
        const quantityInputs = getAllByPlaceholderText("VD: 2");
        const priceInputs = getAllByPlaceholderText("VD: 25000");
        if (productInputs.length > 0 && quantityInputs.length > 0 && priceInputs.length > 0) {
          fireEvent.changeText(productInputs[0], "Cà phê");
          fireEvent.changeText(quantityInputs[0], "2");
          fireEvent.changeText(priceInputs[0], "25000");
        }
      });
  
      // Thêm mục chi tiêu thứ hai
      fireEvent.press(getByText("Thêm mục"));
  
      // Nhập đầy đủ thông tin hợp lệ cho mục chi tiêu thứ hai
      await waitFor(() => {
        const productInputs = getAllByPlaceholderText("VD: Cà phê");
        const quantityInputs = getAllByPlaceholderText("VD: 2");
        const priceInputs = getAllByPlaceholderText("VD: 25000");
        if (productInputs.length > 1 && quantityInputs.length > 1 && priceInputs.length > 1) {
          fireEvent.changeText(productInputs[1], "Bánh mì");
          fireEvent.changeText(quantityInputs[1], "1");
          fireEvent.changeText(priceInputs[1], "15000");
        }
      });
  
      // Nhấn gửi
      await act(async () => {
        fireEvent.press(getByRole("button", { name: "Gửi giao dịch" }));
      });
   
      // Kiểm tra xem API đã được gọi với dữ liệu đúng chưa
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          userId: "test-user-id",
          type: "expense",
          category: "Ăn uống",
          items: expect.arrayContaining([
            expect.objectContaining({
              productName: "Cà phê",
              quantity: "2",
              price: "25000"
            }),
            expect.objectContaining({
              productName: "Bánh mì",
              quantity: "1",
              price: "15000"
            })
          ])
        })
      );
      
      // Kiểm tra thông báo thành công
      expect(Alert.alert).toHaveBeenCalledWith("Thành công", "Giao dịch đã được thêm thành công!");
    });
  });

  // UTCID25-26: Xóa mục chi tiêu và gửi giao dịch thành công
  describe("UTCID25-26", () => {
    it("Đã đăng nhập -> Chọn loại giao dịch chi tiêu -> Chọn danh mục -> Thêm mục chi tiêu -> Xóa mục chi tiêu -> Thêm mục chi tiêu mới -> Gửi giao dịch thành công", async () => {
      // Mock axios.post để trả về thành công
      mockedAxios.post.mockResolvedValueOnce({ data: { message: "success" } });

      const { getByTestId, getByRole, getAllByText, getByText, getAllByPlaceholderText, queryAllByText } = render(<AddTransactionScreen />);
  
      // Chọn loại giao dịch chi tiêu
      fireEvent.press(getByTestId("transaction-type-expense"));
  
      // Chọn danh mục Ăn uống
      await waitFor(() => {
        const categoryButtons = getAllByText("Ăn uống");
        if (categoryButtons.length > 0) {
          fireEvent.press(categoryButtons[0]);
        }
      });
  
      // Thêm mục chi tiêu đầu tiên
      fireEvent.press(getByText("Thêm mục"));
  
      // Nhập đầy đủ thông tin hợp lệ cho mục chi tiêu đầu tiên
      await waitFor(() => {
        const productInputs = getAllByPlaceholderText("VD: Cà phê");
        const quantityInputs = getAllByPlaceholderText("VD: 2");
        const priceInputs = getAllByPlaceholderText("VD: 25000");
        if (productInputs.length > 0 && quantityInputs.length > 0 && priceInputs.length > 0) {
          fireEvent.changeText(productInputs[0], "Cà phê");
          fireEvent.changeText(quantityInputs[0], "2");
          fireEvent.changeText(priceInputs[0], "25000");
        }
      });
  
      // Xóa mục chi tiêu
      await waitFor(() => {
        const trashIcons = getAllByText("trash");
        if (trashIcons.length > 0) {
          fireEvent.press(trashIcons[0]);
        }
      });
  
      // Kiểm tra xem mục chi tiêu đã bị xóa chưa
      await waitFor(() => {
        expect(queryAllByText("Mục 1").length).toBe(0);
      });
  
      // Thêm mục chi tiêu mới
      fireEvent.press(getByText("Thêm mục"));
  
      // Nhập đầy đủ thông tin hợp lệ cho mục chi tiêu mới
      await waitFor(() => {
        const productInputs = getAllByPlaceholderText("VD: Cà phê");
        const quantityInputs = getAllByPlaceholderText("VD: 2");
        const priceInputs = getAllByPlaceholderText("VD: 25000");
        if (productInputs.length > 0 && quantityInputs.length > 0 && priceInputs.length > 0) {
          fireEvent.changeText(productInputs[0], "Bánh mì");
          fireEvent.changeText(quantityInputs[0], "3");
          fireEvent.changeText(priceInputs[0], "15000");
        }
      });
  
      // Nhấn gửi
      await act(async () => {
        fireEvent.press(getByRole("button", { name: "Gửi giao dịch" }));
      });
   
      // Kiểm tra xem API đã được gọi với dữ liệu đúng chưa
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          userId: "test-user-id",
          type: "expense",
          category: "Ăn uống",
          items: expect.arrayContaining([
            expect.objectContaining({
              productName: "Bánh mì",
              quantity: "3",
              price: "15000"
            })
          ])
        })
      );
      
      // Kiểm tra thông báo thành công
      expect(Alert.alert).toHaveBeenCalledWith("Thành công", "Giao dịch đã được thêm thành công!");
    });
  });
});

