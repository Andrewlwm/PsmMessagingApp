/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-native/no-inline-styles */
import React, {useEffect, useState, useContext} from 'react';
import {View, ActivityIndicator} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import auth from '@react-native-firebase/auth';
import Converstations, {Details} from './Conversations';
import Login from './Login';
import Chat from './Chat';
import {AuthenticatedUserContext} from './Contexts';

const Stack = createNativeStackNavigator();

const AuthenticatedUserProvider = ({children}) => {
  const [user, setUser] = useState(null);
  return (
    <AuthenticatedUserContext.Provider value={{user, setUser}}>
      {children}
    </AuthenticatedUserContext.Provider>
  );
};

function ChatStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Converstations" component={Converstations} />
      <Stack.Screen name="Details" component={Details} />
      <Stack.Screen
        name="Chat"
        screenOptions={{headerShown: false}}
        component={Chat}
      />
    </Stack.Navigator>
  );
}

function RootNavigator() {
  const {user, setUser} = useContext(AuthenticatedUserContext);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const unsubscribeAuth = auth().onAuthStateChanged(authenticatedUser => {
      authenticatedUser ? setUser(authenticatedUser) : setUser(null);
      setIsLoading(false);
    });
    return unsubscribeAuth;
  }, [user]);
  if (isLoading) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? <ChatStack /> : <Login />}
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthenticatedUserProvider>
      <RootNavigator />
    </AuthenticatedUserProvider>
  );
}
