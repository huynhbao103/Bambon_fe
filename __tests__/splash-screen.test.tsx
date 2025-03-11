import React from "react";
import { render } from "@testing-library/react-native";
import SplashScreen from "../app/splash-screen";
import { Animated, ImageBackground } from "react-native";

jest.spyOn(Animated, "timing").mockImplementation(() => ({
    start: jest.fn(),
    stop: jest.fn(),
    reset: jest.fn(),
  }));
  
describe("SplashScreen", () => {
    it("starts fade-in animation with correct duration", () => {
      render(<SplashScreen />);
  
      expect(Animated.timing).toHaveBeenCalledWith(expect.any(Object), {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      });
    });
    it("renders splash image correctly", () => {
        const { toJSON } = render(<SplashScreen />);
        expect(toJSON()).toMatchSnapshot();
    });
}); 