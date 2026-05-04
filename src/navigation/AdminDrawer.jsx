// navigation/AdminDrawer.js
import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Image, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons as Icon } from "@expo/vector-icons";
import { useAuth } from "../contexts/AuthContext";

import CustomerList from "../screens/CustomerList";
import CreateUser from "../screens/CreateUser";

const { width } = Dimensions.get("window");
const Drawer = createDrawerNavigator();
const logo = require("../assets/logo.png");

function CustomAdminDrawerContent(props) {
  const { state, navigation } = props;
  const currentRoute = state.routes[state.index].name;
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          onPress: async () => {
            await logout();
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#ee4705", "#e08c0e"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.logoWrapper}>
          <Image source={logo} style={styles.headerLogo} resizeMode="contain" />
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user?.name || "Administrator"}</Text>
          <Text style={styles.userAccode}>Admin Access</Text>
        </View>
      </LinearGradient>

      <View style={styles.menuSection}>
        <Text style={styles.sectionTitle}>ADMIN MENU</Text>

        <TouchableOpacity
          style={[
            styles.drawerItem,
            currentRoute === "CustomerList" && styles.activeDrawerItem,
          ]}
          onPress={() => {
            navigation.navigate("CustomerList");
            navigation.closeDrawer();
          }}
        >
          <View style={styles.drawerItemContent}>
            <Icon
              name="people"
              size={22}
              color={currentRoute === "CustomerList" ? "#cf1f1f" : "#666"}
              style={styles.itemIcon}
            />
            <Text
              style={[
                styles.drawerItemText,
                currentRoute === "CustomerList" && styles.activeDrawerItemText,
              ]}
            >
              Customer List
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.drawerItem,
            currentRoute === "CreateUser" && styles.activeDrawerItem,
          ]}
          onPress={() => {
            navigation.navigate("CreateUser");
            navigation.closeDrawer();
          }}
        >
          <View style={styles.drawerItemContent}>
            <Icon
              name="person-add"
              size={22}
              color={currentRoute === "CreateUser" ? "#DC2626" : "#666"}
              style={styles.itemIcon}
            />
            <Text
              style={[
                styles.drawerItemText,
                currentRoute === "CreateUser" && styles.activeDrawerItemText,
              ]}
            >
              Create User
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.bottomContainer}>
        <TouchableOpacity 
          style={styles.logoutButton} 
          onPress={() => {
            navigation.closeDrawer();
            handleLogout();
          }}
        >
          <Icon name="logout" size={20} color="#DC2626" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function AdminDrawer() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomAdminDrawerContent {...props} />}
      screenOptions={{
        headerStyle: { backgroundColor: "#f57600" },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "bold" },
        drawerStyle: { width: width * 0.8, backgroundColor: "#fff" },
        headerTitleAlign: "center",
      }}
    >
      <Drawer.Screen 
        name="CustomerList" 
        component={CustomerList} 
        options={{ title: "Customer List" }} 
      />
      <Drawer.Screen 
        name="CreateUser" 
        component={CreateUser} 
        options={{ title: "Create User" }} 
      />
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    paddingVertical: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  logoWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    overflow: "hidden",
  },
  headerLogo: { width: 60, height: 60 },
  userInfo: { alignItems: "center" },
  userName: { color: "#fff", fontSize: 18, fontWeight: "bold", marginBottom: 4 },
  userAccode: { color: "rgba(255,255,255,0.8)", fontSize: 12 },
  menuSection: { marginTop: 20, paddingHorizontal: 20 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#999",
    marginBottom: 10,
    letterSpacing: 1,
  },
  drawerItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginVertical: 4,
    borderRadius: 12,
  },
  drawerItemContent: { flexDirection: "row", alignItems: "center" },
  activeDrawerItem: {
    backgroundColor: "rgba(220, 38, 38, 0.1)",
    borderLeftWidth: 3,
    borderLeftColor: "#DC2626",
  },
  itemIcon: { marginRight: 15 },
  drawerItemText: { fontSize: 15, color: "#444", fontWeight: "500" },
  activeDrawerItemText: { color: "#DC2626", fontWeight: "600" },
  bottomContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    marginTop: "auto",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 15,
  },
  logoutText: { color: "#dc2626", marginLeft: 10, fontSize: 15, fontWeight: "500" },
});