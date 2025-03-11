import { render, screen } from '@testing-library/react-native';
import Screen1 from '../../app/screen/screen1';
import { Animated } from 'react-native';
import { Link } from 'expo-router';
import images from '../../constants/images';

// Mock expo-router
jest.mock('expo-router', () => ({
  Link: jest.fn(({ children }) => <>{children}</>),
}));

// Mock Animated.timing để tránh lỗi khi test animation
jest.spyOn(Animated, 'timing').mockReturnValue({
  start: jest.fn(),
  stop: jest.fn(),
  reset: jest.fn(),
} as unknown as Animated.CompositeAnimation);

// Mock SettingsManager để tránh lỗi TurboModuleRegistry
jest.mock('react-native/Libraries/Settings/Settings', () => ({
  get: jest.fn(),
  set: jest.fn(),
}));

// Mock images
jest.mock('../../constants/images', () => ({
  handmoney: 'mocked-handmoney-image',
}));

describe('Screen1', () => {
  it('renders welcome text correctly', () => {
    render(<Screen1 />);
    expect(screen.getByText('Chào mừng bạn đến với')).toBeTruthy();
    expect(screen.getByText('BamBon')).toBeTruthy();
  });

  it('renders the animated image with correct source', () => {
    render(<Screen1 />);
    const image = screen.getByTestId('animated-image');
    expect(image.props.source).toBe('mocked-handmoney-image');
  });

  it('renders the continue link with correct text', () => {
    render(<Screen1 />);
    expect(screen.getByText('Tiếp tục')).toBeTruthy();
  });

  it('renders pagination dots', () => {
    render(<Screen1 />);
    const dots = screen.getAllByTestId('pagination-dot');
    expect(dots).toHaveLength(2);
    expect(dots[0].props.style.backgroundColor).toBe('#16A34A');
    expect(dots[1].props.style.backgroundColor).toBe('#D1D5DB');
  });

  it('triggers animation on mount', () => {
    const mockTiming = Animated.timing as jest.Mock;
    render(<Screen1 />);
    expect(mockTiming).toHaveBeenCalledWith(expect.any(Animated.Value), {
      toValue: 1,
      duration: 2000,
      useNativeDriver: true,
    });
    expect(mockTiming().start).toHaveBeenCalled();
  });
});
