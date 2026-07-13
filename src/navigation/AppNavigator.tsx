import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';

import Splash from '../screens/Splash';
import Login from '../screens/Login';
import Dashboard from '../screens/Dashboard';
import Attendance from '../screens/Attendance';
import Success from '../screens/Success';
import History from '../screens/History';
import Profile from '../screens/Profile';
import Settings from '../screens/Settings';
import PersonalDetails from '../screens/PersonalDetails';
import DepartmentInfo from '../screens/DepartmentInfo';
import SecurityPassword from '../screens/SecurityPassword';
import HelpSupport from '../screens/HelpSupport';
import About from '../screens/About';
import Notifications from '../screens/Notifications';
import NotFound from '../screens/NotFound';
import { Colors } from '../constants/Colors';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
          elevation: 0,
          shadowOpacity: 0.1,
          height: 70,
          paddingBottom: 12,
          paddingTop: 12,
        },
        tabBarIcon: ({ color, size }) => {
          let iconName = '';
          if (route.name === 'Dashboard') iconName = 'dashboard';
          else if (route.name === 'History') iconName = 'history';
          else if (route.name === 'Profile') iconName = 'person';
          return <Icon name={iconName} size={size + 2} color={color} />;
        },
      })}
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
        <Stack.Screen name="Notifications" component={Notifications} />
        <Stack.Screen name="Settings" component={Settings} />
        <Stack.Screen name="PersonalDetails" component={PersonalDetails} />
        <Stack.Screen name="DepartmentInfo" component={DepartmentInfo} />
        <Stack.Screen name="SecurityPassword" component={SecurityPassword} />
        <Stack.Screen name="HelpSupport" component={HelpSupport} />
        <Stack.Screen name="About" component={About} />
        <Stack.Screen name="NotFound" component={NotFound} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
