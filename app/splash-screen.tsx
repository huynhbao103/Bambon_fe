import React, { useEffect, useRef } from "react";
import { View, Animated } from "react-native";
// eslint-disable-next-line import/no-unresolved
import images from "../constants/images";

const SplashScreen = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);
  return (
    <View testID="splash-container" className="flex-1 bg-green-300 justify-center items-center">
      <Animated.Image
        testID="splash-image"
        source={images.splash}
        resizeMode={"contain"}
        style={{
          width: "100%",
          height: "100%",
          opacity: fadeAnim,
        }}
      />
    </View>
  );
};

export default SplashScreen;
