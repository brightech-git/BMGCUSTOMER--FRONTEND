// navigation/UserDrawer.js
import React, { useState, useEffect } from "react";
import {
  createDrawerNavigator,
  DrawerContentScrollView,
} from "@react-navigation/drawer";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons as Icon } from "@expo/vector-icons";
import { useAuth } from "../contexts/AuthContext"; // ← Import from contexts

import Customer from "../screens/Customer";
import City from "../screens/City";

const { width } = Dimensions.get("window");
const Drawer = createDrawerNavigator();
const logo = require("../assets/logo.png");

function CustomDrawerContent(props) {
  const { state, navigation } = props;
  const currentRoute = state.routes[state.index].name;
  const { user, logout } = useAuth(); // ← Use auth context
  const [userName, setUserName] = useState("User");

  useEffect(() => {
    if (user) {
      setUserName(user.name || "User");
    }
  }, [user]);

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
            // Navigation will be handled automatically
          },
        },
      ]
    );
  };

  const goToAdminLogin = () => {
    navigation.navigate("AdminLogin");
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#F97316", "#FB923C"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.logoWrapper}>
          <Image source={logo} style={styles.headerLogo} resizeMode="contain" />
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>Welcome! {userName}</Text>
          
        </View>
      </LinearGradient>

      <DrawerContentScrollView {...props} contentContainerStyle={styles.scrollContent}>
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>MAIN MENU</Text>

          <TouchableOpacity
            style={[
              styles.drawerItem,
              currentRoute === "Customer" && styles.activeDrawerItem,
            ]}
            onPress={() => {
              navigation.navigate("Customer");
              navigation.closeDrawer();
            }}
          >
            <View style={styles.drawerItemContent}>
              <Icon
                name="person-add"
                size={22}
                color={currentRoute === "Customer" ? "#F97316" : "#666"}
                style={styles.itemIcon}
              />
              <Text
                style={[
                  styles.drawerItemText,
                  currentRoute === "Customer" && styles.activeDrawerItemText,
                ]}
              >
                Create Customer
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.drawerItem,
              currentRoute === "City" && styles.activeDrawerItem,
            ]}
            onPress={() => {
              navigation.navigate("City");
              navigation.closeDrawer();
            }}
          >
            <View style={styles.drawerItemContent}>
              <Icon
                name="location-city"
                size={22}
                color={currentRoute === "City" ? "#F97316" : "#666"}
                style={styles.itemIcon}
              />
              <Text
                style={[
                  styles.drawerItemText,
                  currentRoute === "City" && styles.activeDrawerItemText,
                ]}
              >
                Create City
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </DrawerContentScrollView>

      <View style={styles.bottomContainer}>

        <TouchableOpacity 
          style={styles.logoutButton} 
          onPress={() => {
            navigation.closeDrawer();
            handleLogout();
          }}
        >
          <Icon name="logout" size={20} color="#F97316" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function UserDrawer() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerStyle: { backgroundColor: "#F97316" },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "bold" },
        drawerStyle: { width: width * 0.8, backgroundColor: "#fff" },
        headerTitleAlign: "center",
      }}
    >
      <Drawer.Screen 
        name="Customer" 
        component={Customer} 
        options={{ title: "Create Customer" }} 
      />
      <Drawer.Screen 
        name="City" 
        component={City} 
        options={{ title: "Create City" }} 
      />
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#fff" 
  },
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
  headerLogo: { 
    width: 60, 
    height: 60 
  },
  userInfo: { 
    alignItems: "center" 
  },
  userName: { 
    color: "#fff", 
    fontSize: 18, 
    fontWeight: "bold", 
    marginBottom: 4 
  },
  userAccode: { 
    color: "rgba(255,255,255,0.8)", 
    fontSize: 12 
  },
  scrollContent: { 
    paddingTop: 10,
    paddingBottom: 20,
  },
  menuSection: { 
    marginTop: 10 
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#999",
    marginLeft: 20,
    marginBottom: 10,
    letterSpacing: 1,
  },
  drawerItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginHorizontal: 10,
    marginVertical: 4,
    borderRadius: 12,
  },
  drawerItemContent: { 
    flexDirection: "row", 
    alignItems: "center" 
  },
  activeDrawerItem: {
    backgroundColor: "rgba(249, 115, 22, 0.1)",
    borderLeftWidth: 3,
    borderLeftColor: "#F97316",
  },
  itemIcon: { 
    marginRight: 15 
  },
  drawerItemText: { 
    fontSize: 15, 
    color: "#444", 
    fontWeight: "500" 
  },
  activeDrawerItemText: { 
    color: "#F97316", 
    fontWeight: "600" 
  },
  bottomContainer: { 
    paddingHorizontal: 20, 
    paddingBottom: 30,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  adminButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: "#f8f9fa",
    borderRadius: 10,
    marginBottom: 10,
  },
  adminText: { 
    color: "#F97316", 
    marginLeft: 10, 
    fontSize: 15, 
    fontWeight: "500" 
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 15,
  },
  logoutText: { 
    color: "#F97316", 
    marginLeft: 10, 
    fontSize: 15, 
    fontWeight: "500" 
  },
});