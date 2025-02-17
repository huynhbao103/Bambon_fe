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

    console.log("Token và userId đã lưu:", token, userId);
  } catch (error) {
    console.error("Lỗi khi lưu token và userId:", error);
  }
};

export const fetchUserId = async () => {
    try {
      const userId = await AsyncStorage.getItem("userId");
      console.log("UserId từ AsyncStorage:", userId); // Kiểm tra giá trị từ AsyncStorage
      return userId;
    } catch (error) {
      console.error("Lỗi khi lấy userId từ AsyncStorage:", error);
      return null;
    }
  };