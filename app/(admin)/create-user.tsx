// app/(admin)/create-user.tsx
import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  FlatList,
  RefreshControl,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { CreateUserService } from "../../src/service/CreateUserService";

const { width } = Dimensions.get("window");

// Define User type
interface User {
  id?: number;
  name?: string;
  username?: string;
  custCount?: number;
  active?: boolean;
}

export default function CreateUser() {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [userList, setUserList] = useState<User[]>([]);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [loadingUsers, setLoadingUsers] = useState<boolean>(false);

  // Load users when screen focuses
  useFocusEffect(
    useCallback(() => {
      loadUsers();
    }, [])
  );

  // Load all users
  const loadUsers = async () => {
    try {
      setLoadingUsers(true);
      const response = await CreateUserService.getAllUsers();
      console.log("Users Response:", response);
      
      if (response && response.success) {
        setUserList(response.data || []);
      } else {
        setUserList([]);
      }
    } catch (error) {
      console.log("Error loading users:", error);
      Alert.alert("Error", "Failed to load users");
    } finally {
      setLoadingUsers(false);
    }
  };

  // Refresh users
  const onRefresh = async () => {
    setRefreshing(true);
    await loadUsers();
    setRefreshing(false);
  };

  // Save new user
  const saveUser = async () => {
    if (!username || !password) {
      Alert.alert("Validation", "Username and Password are required");
      return;
    }

    if (username.length < 3) {
      Alert.alert("Validation", "Username must be at least 3 characters");
      return;
    }

    if (password.length < 4) {
      Alert.alert("Validation", "Password must be at least 4 characters");
      return;
    }

    try {
      setLoading(true);
      const response = await CreateUserService.createUser(username, password);

      if (response.success) {
        Alert.alert("Success", response.message || "User Created Successfully");
        setUsername("");
        setPassword("");
        loadUsers();
      } else {
        Alert.alert("Error", response.message || "User creation failed");
      }
    } catch (error) {
      console.log("Create User Error:", error);
      Alert.alert("Error", "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Render each user item
  const renderUserItem = ({ item, index }: { item: User; index: number }) => (
    <View style={[styles.userRow, index % 2 === 0 ? styles.rowEven : styles.rowOdd]}>
      <View style={styles.serialCell}>
        <Text style={styles.cellText}>{index + 1}</Text>
      </View>
      <View style={styles.nameCell}>
        <Text style={styles.cellText}>{item.name || item.username || "-"}</Text>
      </View>
      <View style={styles.countCell}>
        <Text style={styles.countText}>{item.custCount || 0}</Text>
      </View>

    </View>
  );

  // Render empty list
  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <MaterialIcons name="people-outline" size={60} color="#ccc" />
      <Text style={styles.emptyText}>No Users Found</Text>
      <Text style={styles.emptySubText}>Create your first user above</Text>
    </View>
  );

  // Render list header
  const renderListHeader = () => (
    <View style={styles.tableHeader}>
      <View style={styles.serialCell}>
        <Text style={styles.headerText}>S.No</Text>
      </View>
      <View style={styles.nameCell}>
        <Text style={styles.headerText}>Username</Text>
      </View>
      <View style={styles.countCell}>
        <Text style={styles.headerText}>Customers</Text>
      </View>

    </View>
  );

  return (
    <LinearGradient colors={["#FFF3E0", "#FFFFFF"]} style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#F97316"]} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <MaterialIcons name="admin-panel-settings" size={50} color="#F97316" />
          </View>
          <Text style={styles.title}>Create New User</Text>
          <Text style={styles.subtitle}>Add a new user to the system</Text>
        </View>

        {/* Create User Form Card */}
        <View style={styles.card}>
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>USERNAME *</Text>
            <View style={styles.inputContainer}>
              <MaterialIcons name="person" size={20} color="#F97316" style={styles.inputIcon} />
              <TextInput
                placeholder="Enter username"
                placeholderTextColor="#999"
                value={username}
                onChangeText={setUsername}
                style={styles.input}
                autoCapitalize="none"
                editable={!loading}
              />
            </View>
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.label}>PASSWORD *</Text>
            <View style={styles.inputContainer}>
              <MaterialIcons name="lock" size={20} color="#F97316" style={styles.inputIcon} />
              <TextInput
                placeholder="Enter password"
                placeholderTextColor="#999"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                style={styles.input}
                editable={!loading}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <MaterialIcons
                  name={showPassword ? "visibility" : "visibility-off"}
                  size={20}
                  color="#999"
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.createButton, loading && styles.buttonDisabled]}
            onPress={saveUser}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.createButtonText}>Create User</Text>
                <MaterialIcons name="check" size={20} color="#fff" />
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Users List Section */}
        <View style={styles.listSection}>
          <View style={styles.listHeader}>
            <MaterialIcons name="people" size={22} color="#F97316" />
            <Text style={styles.listTitle}>Existing Users</Text>
            <Text style={styles.listCount}>({userList.length} users)</Text>
            {loadingUsers && <ActivityIndicator size="small" color="#F97316" />}
          </View>

          {/* User Table */}
          <View style={styles.tableContainer}>
            {renderListHeader()}
            <FlatList
              data={userList}
              keyExtractor={(item, index) => item.id?.toString() || index.toString()}
              renderItem={renderUserItem}
              ListEmptyComponent={renderEmptyList}
              scrollEnabled={false}
              nestedScrollEnabled={true}
            />
          </View>
        </View>

        {/* Info Note */}
        <View style={styles.noteCard}>
          <MaterialIcons name="info" size={20} color="#F97316" />
          <Text style={styles.noteText}>
            New users will have access to create customers only. Admin access requires separate privileges. 
            Username must be at least 3 characters and password at least 4 characters.
          </Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: { flexGrow: 1, padding: 20 },
  
  header: { alignItems: "center", marginBottom: 30 },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
    shadowColor: "#F97316",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  title: { fontSize: 28, fontWeight: "bold", color: "#333", marginBottom: 5 },
  subtitle: { fontSize: 14, color: "#666" },
  
  card: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 20,
  },
  inputWrapper: { marginBottom: 20 },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 10,
    backgroundColor: "#f8f9fa",
    paddingHorizontal: 12,
    minHeight: 50,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, color: "#333", paddingVertical: 12 },
  createButton: {
    backgroundColor: "#F97316",
    borderRadius: 10,
    paddingVertical: 15,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    shadowColor: "#F97316",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  createButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  buttonDisabled: { opacity: 0.7, backgroundColor: "#999" },
  
  listSection: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 20,
  },
  listHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    gap: 8,
  },
  listTitle: { fontSize: 18, fontWeight: "bold", color: "#333" },
  listCount: { fontSize: 14, color: "#999" },
  tableContainer: { overflow: "hidden" },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#F97316",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  headerText: { fontSize: 12, fontWeight: "bold", color: "#fff" },
  userRow: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    alignItems: "center",
  },
  rowEven: { backgroundColor: "#fff" },
  rowOdd: { backgroundColor: "#FFF8F3" },
  cellText: { fontSize: 13, color: "#555" },
  serialCell: { width: "15%", alignItems: "center" },
  nameCell: { width: "45%", paddingLeft: 5 },
  countCell: { width: "20%", alignItems: "center" },
  statusCell: { width: "20%", alignItems: "center" },
  countText: { fontSize: 13, color: "#F97316", fontWeight: "bold" },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  activeBadge: { backgroundColor: "#E8F5E9" },
  inactiveBadge: { backgroundColor: "#FFEBEE" },
  statusText: { fontSize: 11, fontWeight: "600" },
  activeText: { color: "#4CAF50" },
  inactiveText: { color: "#F44336" },
  
  emptyContainer: { alignItems: "center", paddingVertical: 40 },
  emptyText: { fontSize: 16, color: "#999", marginTop: 10 },
  emptySubText: { fontSize: 12, color: "#ccc", marginTop: 5 },
  
  noteCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: "#F97316",
    marginBottom: 20,
  },
  noteText: { flex: 1, marginLeft: 10, fontSize: 13, color: "#666", lineHeight: 18 },
});