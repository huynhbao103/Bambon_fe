import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { useColorScheme } from '../../hooks/useColorScheme';
import { StatusBar } from 'expo-status-bar';
import { Link } from 'expo-router';  


export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  return (
    <>
      <StatusBar style="auto" />
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
          headerShown: false,
          tabBarStyle: Platform.select({
        ios: {
          position: 'absolute',
        },
        default: {},
          }),
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
        title: 'Home',
        tabBarIcon: ({ color }) => <Ionicons size={28} name="home" color={color} />,
          }}
        />
              <Tabs.Screen
          name="scan"
          options={{
        title: 'scan',
        tabBarIcon: ({ color }) => <Ionicons size={28} name="scan" color={color} />,
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
        title: 'nhập vào ',
        tabBarIcon: ({ color }) => <Ionicons size={28} name="pencil" color={color} />,
          }}
        />
       
      </Tabs>
    </>
  );
}

const styles = StyleSheet.create({
  cameraButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.light.tint,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 20,
    zIndex: 10,
  },
});
