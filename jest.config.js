module.exports = {
  collectCoverage: true,
  collectCoverageFrom: [
    "**/*.{ts,tsx,js,jsx}",
    "!**/coverage/**",
    "!**/node_modules/**",
    "!**/babel.config.js",
    "!**/expo-env.d.ts",
    "!**/.expo/**"
  ],
  preset: 'jest-expo',
  transformIgnorePatterns: [
    "node_modules/(?!(jest-)?react-native" +
    "|@react-native" +
    "|@react-navigation" +
    "|expo(nent)?|@expo(nent)?/.*" +
    "|expo-modules-core" +
    "|expo-constants" +
    "|@expo-google-fonts/.*" +
    "|react-navigation" +
    "|@react-navigation/.*" +
    "|@sentry/react-native" +
    "|native-base" +
    "|react-native-svg" +
    "|@bang88/react-native-ultimate-listview" +
    ")"
  ],
  setupFiles: ['./jest.setup.tsx'],
  setupFilesAfterEnv: ["@testing-library/jest-native/extend-expect"]
};