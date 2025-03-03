import { jwtDecode } from "jwt-decode";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Hàm lưu token và userId vào AsyncStorage
export const saveTokenAndUserId = async (token: string) => {
  try {
    // Giải mã token
    const decodedToken: { userId: string } = jwtDecode(token);

    if (!decodedToken.userId) {
      throw new Error("Không tìm thấy userId trong token");
    }

    const userId = decodedToken.userId;

    // Lưu token và userId vào AsyncStorage
    await AsyncStorage.setItem("token", token);
    await AsyncStorage.setItem("userId", userId);

    console.log("Token và userId đã lưu:", { token, userId });
    return userId;
  } catch (error) {
    console.error("Lỗi khi lưu token và userId:", error);
    throw error;
  }
};

// Hàm lấy userId từ AsyncStorage
export const fetchUserId = async (): Promise<string | null> => {
  try {
    const userId = await AsyncStorage.getItem("userId");
    console.log("UserId từ AsyncStorage:", userId);
    return userId;
  } catch (error) {
    console.error("Lỗi khi lấy userId từ AsyncStorage:", error);
    return null;
  }
};

// Hàm xóa token và userId khi đăng xuất (tùy chọn)
export const clearAuthData = async () => {
  try {
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("userId");
    console.log("Đã xóa token và userId");
  } catch (error) {
    console.error("Lỗi khi xóa auth data:", error);
  }
};