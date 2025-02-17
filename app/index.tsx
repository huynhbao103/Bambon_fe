import React from 'react';
import { View, StyleSheet } from 'react-native';
import Screen1 from './screen/screen1';

export default function Index() {
  return (
    <View style={styles.container}>
     <Screen1/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, // Chiếm toàn bộ chiều cao màn hình
    justifyContent: 'center', // Căn giữa theo chiều dọc
  },
});
