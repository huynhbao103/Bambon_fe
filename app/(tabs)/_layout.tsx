import { Tabs } from 'expo-router';
import React from 'react';
import { Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { useColorScheme } from '../../hooks/useColorScheme';
import { StatusBar } from 'expo-status-bar';


const WINDOW_WIDTH = Dimensions.get('window').width;

export default function TabLayout() {
  const colorScheme = useColorScheme();
  
  return (
    <>
      <StatusBar style="auto" />
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
          headerShown: false,
          tabBarStyle: {
          
            bottom: 0,
            left: 20,
            right: 20,
            elevation: 4,
            // backgroundColor:  "#FFFFFF" ? '#1F1F1F' : '#FFFFFF',
            borderRadius: 25,
            height: 70,
            paddingBottom: 10,
            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: 4,
            },
            shadowOpacity: 0.25,
            shadowRadius: 10,
            borderTopWidth: 0,
          },
          tabBarItemStyle: {
            padding: 5,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
          },
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: 'Trang chủ',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons 
                size={focused ? 32 : 28} 
                name={focused ? "home" : "home-outline"} 
                color={color} 
              />
            ),
          }}
        />
        <Tabs.Screen
          name="BudgetScreen"
          options={{
            title: 'Chi tiêu',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons 
                size={focused ? 32 : 28} 
                name={focused ? "wallet" : "wallet-outline"} 
                color={color} 
              />
            ),
          }}
        />
        <Tabs.Screen
          name="scan"
          options={{
            title: 'Quét',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons 
                size={focused ? 32 : 28} 
                name={focused ? "scan-circle" : "scan-circle-outline"} 
                color={color} 
              />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Nhập',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons 
                size={focused ? 32 : 28} 
                name={focused ? "create" : "create-outline"} 
                color={color} 
              />
            ),
          }}
        />
      </Tabs>
    </>
  );
}

// const styles = StyleSheet.create({
//   cameraButton: {
//     width: 60,
//     height: 60,
//     borderRadius: 30,
//     backgroundColor: Colors.light.tint,
//     justifyContent: 'center',
//     alignItems: 'center',
//     position: 'absolute',
//     bottom: 20,
//     zIndex: 10,
//   },
// });
