import 'react-native-gesture-handler/jestSetup';

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

// Mock Appearance
const mockAppearance = {
  getColorScheme: jest.fn(() => 'light'),
  addChangeListener: jest.fn(),
};

jest.spyOn(require('react-native').Appearance || {}, 'getColorScheme').mockImplementation(mockAppearance.getColorScheme);
jest.spyOn(require('react-native').Appearance || {}, 'addChangeListener').mockImplementation(mockAppearance.addChangeListener);