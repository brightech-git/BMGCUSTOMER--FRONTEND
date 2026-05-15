// src/navigation/UserDrawer.js
import { Drawer } from "expo-router/drawer";
import { useRouter } from "expo-router";  // ← IMPORTANT: Import useRouter
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons as Icon } from "@expo/vector-icons";
import { useAuth } from "../contexts/AuthContext";
import CustomerList from "../../app/(user)/customer-list";

const logo = require("../../assets/logo.png");

function CustomDrawerContent(props) {
  const { navigation } = props;
  const { user, logout } = useAuth();
  const router = useRouter();  // ← Initialize router

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            try {
              // Clear auth state
              await logout();
              
              // Close drawer
              navigation.closeDrawer();
              
              // Navigate to login using expo-router
              router.replace("/login");
              
            } catch (e) {
              console.log("Logout error:", e);
              Alert.alert("Error", "Failed to logout. Please try again.");
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#F97316", "#FB923C"]}
        style={styles.header}
      >

        <Text style={styles.welcomeText}>Welcome {user?.name || "User"}</Text>
      </LinearGradient>

      <View style={styles.menuSection}>
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => {
            router.push("/customer");
            navigation.closeDrawer();
          }}
        >
          <Icon name="person" size={24} color="#F97316" />
          <Text style={styles.menuText}>Customer Creation</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => {
            router.push("/(user)/customer-list");
            navigation.closeDrawer();
          }}
        >
          <Icon name="people" size={24} color="#F97316" />
          <Text style={styles.menuText}>Customer List</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.bottomSection}>
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Icon name="logout" size={24} color="#DC2626" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function UserDrawer() {
  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerStyle: { backgroundColor: "#F97316" },
        headerTintColor: "#fff",
        headerTitleAlign: "center",
      }}
    >
      <Drawer.Screen name="customer" options={{ title: "Customer Creation" }} />
    </Drawer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    padding: 30,
    alignItems: "center",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  welcomeText: { color: "#fff", marginTop: 10, fontSize: 16, fontWeight: "bold" },
  menuSection: { marginTop: 20, paddingHorizontal: 20 },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  menuText: { marginLeft: 15, fontSize: 16, color: "#333" },
  bottomSection: {
    marginTop: "auto",
    paddingHorizontal: 20,
    paddingBottom: 30,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingTop: 20,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 10,
  },
  logoutText: { marginLeft: 15, fontSize: 16, color: "#DC2626" },
});