import { NativeModules } from 'react-native';

// Mock SettingsManager cho Expo
NativeModules.SettingsManager = {
  getConstants: () => ({
    settings: {},
  }),
};

// Mock Appearance với kiểm tra an toàn
const mockAppearance = {
  getColorScheme: jest.fn(() => 'light'),
  addChangeListener: jest.fn(),
};

jest.spyOn(require('react-native').Appearance || {}, 'getColorScheme').mockImplementation(mockAppearance.getColorScheme);
jest.spyOn(require('react-native').Appearance || {}, 'addChangeListener').mockImplementation(mockAppearance.addChangeListener);

// Optional: Log để debug
console.log('jest.setup.ts loaded, Appearance mock:', require('react-native').Appearance);