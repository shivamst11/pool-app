import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from '../screens/Login';
import SignUp from '../screens/SignUp';
import { AuthStackParamList } from './types';

const Stack = createNativeStackNavigator<AuthStackParamList>();

const AuthNavigation = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen key={'Login'} name="Login" component={Login} />
      <Stack.Screen
        key="SignUp"
        name="SignUp"
        component={SignUp}
        options={{ headerShown: true }}
      />
    </Stack.Navigator>
  );
};

export default AuthNavigation;
