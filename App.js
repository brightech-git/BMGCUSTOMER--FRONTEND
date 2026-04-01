// App.js
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ActivityIndicator, View } from "react-native";
import { AuthProvider, useAuth } from "./src/contexts/AuthContext";

import Login from "./src/screens/Login";
import AdminLogin from "./src/screens/AdminLogin";
import UserDrawer from "./src/navigation/UserDrawer";
import AdminDrawer from "./src/navigation/AdminDrawer";

const Stack = createNativeStackNavigator();

function LoadingScreen() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" color="#F97316" />
    </View>
  );
}

function AppNavigator() {
  const { isLoading, isLoggedIn, isAdmin, userRole } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isLoggedIn ? (
          // Auth Stack - Not logged in
          <>
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="AdminLogin" component={AdminLogin} />
          </>
        ) : isAdmin ? (
          // Admin Stack
          <Stack.Screen name="AdminApp" component={AdminDrawer} />
        ) : (
          // User Stack
          <Stack.Screen name="UserApp" component={UserDrawer} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}