// Screen2.tsx
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  View,
  Text,
  Image,
  Dimensions,
  Animated,
} from "react-native";
import { Link } from "expo-router";
import images from "../../constants/images";

const { width, height } = Dimensions.get("window");

const Screen2: React.FC = () => {
  const [fadeAnim] = useState(new Animated.Value(0));
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);
  return (
    <ScrollView
      contentContainerStyle={{
        alignItems: "center",
        justifyContent: "center",
        padding: -20,
        backgroundColor: "#6EE7B7",
        flexGrow: 1,
      }}
    >
      <Text
        style={{
          fontSize: 30,
          fontWeight: "bold",
          color: "black",
          marginBottom: 8,
          paddingTop: 100,
        }}
      >
        Bạn đã sẵn sàng
      </Text>
      <Text className="text-2xl text-black text-center">
        Kiểm soát tài chính của bạn?
      </Text>
      <Animated.Image
        source={images.handphone}
        style={{
          width: width - 40,
          height: height / 3,
          opacity: fadeAnim,
        }}
        resizeMode="contain"
      />
      <Link
        href="/pages/login" // Điều hướng về màn hình home
        style={{
          backgroundColor: "#16A34A",
          paddingHorizontal: 32,
          paddingVertical: 16,
          borderRadius: 8,
          marginTop: 20,
        }}
      >
        <Text className="text-white text-lg font-bold">Tiếp tục</Text>
      </Link>
      <View className="flex-row mt-5">
        <View className="w-3 h-3 rounded-full bg-gray-300 mx-1" />
        <View className="w-3 h-3 rounded-full bg-green-700 mx-1" />
      </View>
    </ScrollView>
  );
};

export default Screen2;