import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';

import Splash from '../screens/Splash';
import Login from '../screens/Login';
import Dashboard from '../screens/Dashboard';
import ClassesList from '../screens/ClassesList';
import StudentDirectoryList from '../screens/StudentDirectoryList';
import StudentProfile from '../screens/StudentProfile';
import Attendance from '../screens/Attendance';
import AttendanceReport from '../screens/AttendanceReport';
import FacultyTimetable from '../screens/FacultyTimetable';
import Success from '../screens/Success';
import History from '../screens/History';
import Notify from '../screens/Notify';
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


export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Splash">
        <Stack.Screen name="Splash" component={Splash} />
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Dashboard" component={Dashboard} />
        <Stack.Screen name="ClassesList" component={ClassesList} />
        <Stack.Screen name="StudentDirectoryList" component={StudentDirectoryList} />
        <Stack.Screen name="StudentProfile" component={StudentProfile} />
        <Stack.Screen name="History" component={History} />
        <Stack.Screen name="Notify" component={Notify} />
        <Stack.Screen name="Profile" component={Profile} />
        <Stack.Screen name="Attendance" component={Attendance} />
        <Stack.Screen name="FacultyTimetable" component={FacultyTimetable} />
        <Stack.Screen name="AttendanceReport" component={AttendanceReport} />
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
