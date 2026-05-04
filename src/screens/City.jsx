// screens/City.js
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Dropdown } from "react-native-element-dropdown";
import { MaterialIcons } from "@expo/vector-icons";
import { CityService } from "../service/CityService";

const districts = [
  { label: "Ariyalur", value: "Ariyalur" },
  { label: "Chengalpattu", value: "Chengalpattu" },
  { label: "Chennai", value: "Chennai" },
  { label: "Coimbatore", value: "Coimbatore" },
  { label: "Cuddalore", value: "Cuddalore" },
  { label: "Dharmapuri", value: "Dharmapuri" },
  { label: "Dindigul", value: "Dindigul" },
  { label: "Erode", value: "Erode" },
  { label: "Kallakurichi", value: "Kallakurichi" },
  { label: "Kancheepuram", value: "Kancheepuram" },
  { label: "Karur", value: "Karur" },
  { label: "Krishnagiri", value: "Krishnagiri" },
  { label: "Madurai", value: "Madurai" },
  { label: "Mayiladuthurai", value: "Mayiladuthurai" },
  { label: "Nagapattinam", value: "Nagapattinam" },
  { label: "Namakkal", value: "Namakkal" },
  { label: "Nilgiris", value: "Nilgiris" },
  { label: "Perambalur", value: "Perambalur" },
  { label: "Pudukkottai", value: "Pudukkottai" },
  { label: "Ramanathapuram", value: "Ramanathapuram" },
  { label: "Ranipet", value: "Ranipet" },
  { label: "Salem", value: "Salem" },
  { label: "Sivagangai", value: "Sivagangai" },
  { label: "Tenkasi", value: "Tenkasi" },
  { label: "Thanjavur", value: "Thanjavur" },
  { label: "Theni", value: "Theni" },
  { label: "Thoothukudi", value: "Thoothukudi" },
  { label: "Tiruchirappalli", value: "Tiruchirappalli" },
  { label: "Tirunelveli", value: "Tirunelveli" },
  { label: "Tirupattur", value: "Tirupattur" },
  { label: "Tiruppur", value: "Tiruppur" },
  { label: "Tiruvallur", value: "Tiruvallur" },
  { label: "Tiruvannamalai", value: "Tiruvannamalai" },
  { label: "Tiruvarur", value: "Tiruvarur" },
  { label: "Vellore", value: "Vellore" },
  { label: "Viluppuram", value: "Viluppuram" },
  { label: "Virudhunagar", value: "Virudhunagar" }
];

export default function City() {
  const [cityName, setCityName] = useState("");
  const [district, setDistrict] = useState("Madurai");
  const [loading, setLoading] = useState(false);

  const saveCity = async () => {
    if (!cityName) {
      Alert.alert("Validation", "City Name is required");
      return;
    }

    if (cityName.length < 2) {
      Alert.alert("Validation", "City name must be at least 2 characters");
      return;
    }

    const payload = {
      cityName,
      district
    };

    try {
      setLoading(true);
      const response = await CityService.saveCity(payload);

      if (response.success) {
        Alert.alert("Success", response.message || "City saved successfully");
        clearCity();
      } else {
        Alert.alert("Error", response.message || "Failed to save city");
      }
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Server Error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const clearCity = () => {
    setCityName("");
    setDistrict("Madurai");
  };

  return (
    <LinearGradient colors={["#FFF3E0", "#FFFFFF"]} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <MaterialIcons name="location-city" size={50} color="#F97316" />
          </View>
          <Text style={styles.title}>Create City</Text>
          <Text style={styles.subtitle}>Add new city to the system</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>CITY NAME</Text>
            <View style={styles.inputContainer}>
              <MaterialIcons name="place" size={20} color="#F97316" style={styles.inputIcon} />
              <TextInput
                placeholder="Enter city name"
                style={styles.input}
                value={cityName}
                onChangeText={setCityName}
                editable={!loading}
              />
            </View>
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.label}>DISTRICT</Text>
            <View style={styles.dropdownContainer}>
              <Dropdown
                style={styles.dropdown}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                inputSearchStyle={styles.inputSearchStyle}
                iconStyle={styles.iconStyle}
                data={districts}
                search
                maxHeight={300}
                labelField="label"
                valueField="value"
                placeholder="Select district"
                searchPlaceholder="Search district..."
                value={district}
                onChange={item => setDistrict(item.value)}
                renderLeftIcon={() => (
                  <MaterialIcons name="map" size={20} color="#F97316" style={styles.dropdownIcon} />
                )}
                disable={loading}
              />
            </View>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.saveButton, loading && styles.buttonDisabled]}
              onPress={saveCity}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={styles.buttonText}>Save City</Text>
                  <MaterialIcons name="save" size={20} color="#fff" />
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.clearButton}
              onPress={clearCity}
              disabled={loading}
            >
              <MaterialIcons name="clear" size={20} color="#666" />
              <Text style={styles.clearButtonText}>Clear</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.noteCard}>
          <MaterialIcons name="info" size={20} color="#F97316" />
          <Text style={styles.noteText}>
            Cities are linked to districts. Select the appropriate district for accurate location mapping.
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
  dropdownContainer: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 10,
    backgroundColor: "#f8f9fa",
    minHeight: 50,
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  dropdown: { width: "100%" },
  placeholderStyle: { fontSize: 15, color: "#999" },
  selectedTextStyle: { fontSize: 15, color: "#333" },
  inputSearchStyle: { height: 40, fontSize: 14 },
  iconStyle: { width: 20, height: 20 },
  dropdownIcon: { marginRight: 10 },
  buttonRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  saveButton: {
    flex: 2,
    backgroundColor: "#F97316",
    borderRadius: 10,
    paddingVertical: 15,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    shadowColor: "#F97316",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  clearButton: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingVertical: 15,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  buttonDisabled: { opacity: 0.7, backgroundColor: "#999" },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold", marginRight: 10 },
  clearButtonText: { color: "#666", marginLeft: 5, fontSize: 14 },
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