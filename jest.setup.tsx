import { NativeModules } from 'react-native';

// Mock SettingsManager cho Expo
NativeModules.SettingsManager = {
  getConstants: () => ({
    settings: {},
  }),
};
jest.mock("expo-font", () => ({
  loadAsync: jest.fn(),
}));
jest.mock("react-native-vector-icons/FontAwesome", () => "Icon");

// Mock Appearance với kiểm tra an toàn
const mockAppearance = {
  getColorScheme: jest.fn(() => 'light'),
  addChangeListener: jest.fn(),
};

jest.spyOn(require('react-native').Appearance || {}, 'getColorScheme').mockImplementation(mockAppearance.getColorScheme);
jest.spyOn(require('react-native').Appearance || {}, 'addChangeListener').mockImplementation(mockAppearance.addChangeListener);

// Mock AsyncStorage
const mockAsyncStorage = {
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  multiSet: jest.fn(),
  multiGet: jest.fn(),
  multiRemove: jest.fn(),
  flushGetRequests: jest.fn(),
};

jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

// Optional: Log để debug
console.log('jest.setup.ts loaded, Appearance mock:', require('react-native').Appearance);