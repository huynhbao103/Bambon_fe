import React from "react";
import {  render, screen, waitFor, act} from "@testing-library/react-native";
import Screen2 from "../../app/screen/screen2";
import {jest} from '@jest/globals'
describe("Screen2", () => {
  it("renders the welcome text correctly", () => {
    render(<Screen2 />);
    expect(screen.getByText("Bạn đã sẵn sàng")).toBeTruthy();
    expect(screen.getByText("Kiểm soát tài chính của bạn?")).toBeTruthy();
  });

  it("renders the animated image", async () => {
    render(<Screen2 />);
  
    await waitFor(() => {
      expect(screen.getByTestId("animated-image")).toBeTruthy();
    });
});
  it("renders pagination dots correctly", () => {
    render(<Screen2 />);
    const inactiveDot = screen.getByTestId("pagination-dot-inactive");
    const activeDot = screen.getByTestId("pagination-dot-active");

    expect(inactiveDot).toBeTruthy();
    expect(activeDot).toBeTruthy();
  });

  it("renders the continue link with correct text", () => {
    render(<Screen2 />);
    expect(screen.getByText("Tiếp tục")).toBeTruthy();
  });
});
