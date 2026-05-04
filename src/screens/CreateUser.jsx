// screens/CreateUser.js
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";
import { CreateUserService } from "../service/CreateUserService";

export default function CreateUser() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
      } else {
        Alert.alert("Error", response.message || "User creation failed");
      }
    } catch (error) {
      Alert.alert("Error", "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={["#FFF3E0", "#FFFFFF"]} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <MaterialIcons name="person-add" size={50} color="#F97316" />
          </View>
          <Text style={styles.title}>Create New User</Text>
          <Text style={styles.subtitle}>Add a new user to the system</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>USERNAME</Text>
            <View style={styles.inputContainer}>
              <MaterialIcons name="person" size={20} color="#F97316" style={styles.inputIcon} />
              <TextInput
                placeholder="Enter username"
                value={username}
                onChangeText={setUsername}
                style={styles.input}
                autoCapitalize="none"
                editable={!loading}
              />
            </View>
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.label}>PASSWORD</Text>
            <View style={styles.inputContainer}>
              <MaterialIcons name="lock" size={20} color="#F97316" style={styles.inputIcon} />
              <TextInput
                placeholder="Enter password"
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
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={saveUser}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.buttonText}>Create User</Text>
                <MaterialIcons name="check" size={20} color="#fff" />
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.noteCard}>
          <MaterialIcons name="info" size={20} color="#F97316" />
          <Text style={styles.noteText}>
            New users will have access to create customers and cities only. Admin access requires separate privileges.
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
  button: {
    backgroundColor: "#F97316",
    borderRadius: 10,
    paddingVertical: 15,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#F97316",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonDisabled: { opacity: 0.7, backgroundColor: "#999" },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold", marginRight: 10 },
  noteCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#F97316",
  },
  noteText: { flex: 1, marginLeft: 10, fontSize: 13, color: "#666", lineHeight: 18 },
});