import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import Splash from '../screens/Splash';
import Login from '../screens/Login';
import Dashboard from '../screens/Dashboard';
import Attendance from '../screens/Attendance';
import Success from '../screens/Success';
import History from '../screens/History';
import Profile from '../screens/Profile';
import Settings from '../screens/Settings';
import NotFound from '../screens/NotFound';
import { Colors } from '../constants/Colors';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
          elevation: 0,
          shadowOpacity: 0.1,
        },
      }}
    >
      <Tab.Screen name="Dashboard" component={Dashboard} />
      <Tab.Screen name="History" component={History} />
      <Tab.Screen name="Profile" component={Profile} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Splash">
        <Stack.Screen name="Splash" component={Splash} />
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="MainTabs" component={BottomTabs} />
        <Stack.Screen name="Attendance" component={Attendance} />
        <Stack.Screen name="Success" component={Success} />
        <Stack.Screen name="Settings" component={Settings} />
        <Stack.Screen name="NotFound" component={NotFound} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
