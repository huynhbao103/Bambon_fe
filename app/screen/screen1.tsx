import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  Text,
  Animated,
  Image,
  Dimensions,
  View,
} from 'react-native';
import { Link } from 'expo-router';
import images from '../../constants/images';

const { width, height } = Dimensions.get('window');

const Screen1: React.FC = () => {
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
        height: height,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        backgroundColor: '#6EE7B7',
        flexGrow: 1,
      }}
    >
      <Text
        style={{
          fontSize: 30,
          fontWeight: 'bold',
          color: 'black',
          marginBottom: 8,
          paddingTop: 100,
        }}
      >
        Chào mừng bạn đến với
      </Text>
      <Text
        style={{
          fontSize: 24,
          textAlign: 'center',
          color: 'black',
          marginBottom: 20,
        }}
      >
        BamBon
      </Text>

      <Animated.Image
        testID="animated-image" // Thêm testID
        source={images.handmoney}
        resizeMode="contain"
        style={{
          width: width - 40,
          height: height / 3,
          opacity: fadeAnim,
        }}
      />

      <Link
        href="/screen/screen2"
        style={{
          backgroundColor: '#16A34A',
          paddingHorizontal: 32,
          paddingVertical: 16,
          borderRadius: 8,
          marginTop: 20,
        }}
      >
        <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>
          Tiếp tục
        </Text>
      </Link>

      <View style={{ flexDirection: 'row', marginTop: 20 }}>
        <View
          testID="pagination-dot" // Thêm testID
          style={{
            width: 12,
            height: 12,
            borderRadius: 6,
            backgroundColor: '#16A34A',
            marginHorizontal: 4,
          }}
        />
        <View
          testID="pagination-dot" // Thêm testID
          style={{
            width: 12,
            height: 12,
            borderRadius: 6,
            backgroundColor: '#D1D5DB',
            marginHorizontal: 4,
          }}
        />
      </View>
    </ScrollView>
  );
};

export default Screen1;