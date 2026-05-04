// screens/Customer.js
import React, { useState, useCallback } from "react";
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
import { useFocusEffect } from "@react-navigation/native";

import { CustomerService } from "../service/CustomerService";
import { CityService } from "../service/CityService";

export default function Customer() {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [city, setCity] = useState(null);
  const [cityList, setCityList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);

  // 🔥 AUTO REFRESH WHEN SCREEN FOCUSED
  useFocusEffect(
    useCallback(() => {
      loadCities();
    }, [])
  );

  // 🔧 LOAD CITIES FUNCTION
  const loadCities = async () => {
    try {
      setLoadingCities(true);

      const response = await CityService.getCities();

      if (response && response.success) {
        const formatted = (response.data || [])
          .filter((c) => c && c.cityName)
          .map((c) => ({
            label: String(c.cityName),
            value: c.cityName,
          }));

        setCityList(formatted);
      } else {
        setCityList([]);
      }
    } catch (error) {
      console.log("City Load Error:", error);
      Alert.alert("Error", "Failed to load cities");
    } finally {
      setLoadingCities(false);
    }
  };

  // 🔧 VALIDATION
  const validateMobile = (number) => {
    return /^[0-9]{10}$/.test(number);
  };

  // 🔧 SAVE CUSTOMER
  const saveCustomer = async () => {
    if (!name) {
      Alert.alert("Validation", "Name is required");
      return;
    }

    if (!validateMobile(mobile)) {
      Alert.alert("Validation", "Enter valid 10-digit mobile number");
      return;
    }

    if (!city) {
      Alert.alert("Validation", "City is required");
      return;
    }

    const payload = {
      pname: name,
      mobile: mobile,
      city: city,
    };

    try {
      setLoading(true);

      const response = await CustomerService.saveCustomer(payload);

      if (response.success) {
        Alert.alert("Success", "Customer saved successfully");
        clearForm();
        loadCities(); // 🔥 optional reload
      } else {
        Alert.alert("Error", response.message || "Failed to save");
      }
    } catch (error) {
      console.log("Save Error:", error);
      Alert.alert("Error", "Server error");
    } finally {
      setLoading(false);
    }
  };

  const clearForm = () => {
    setName("");
    setMobile("");
    setCity(null);
  };

  return (
    <LinearGradient colors={["#FFF3E0", "#FFFFFF"]} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* HEADER */}
        <View style={styles.header}>
          <MaterialIcons name="person" size={50} color="#F97316" />
          <Text style={styles.title}>Create Customer</Text>
        </View>

        {/* FORM CARD */}
        <View style={styles.card}>
          {/* NAME */}
          <Text style={styles.label}>CUSTOMER NAME</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter name"
            value={name}
            onChangeText={setName}
          />

          {/* MOBILE */}
          <Text style={styles.label}>MOBILE</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter mobile"
            keyboardType="numeric"
            maxLength={10}
            value={mobile}
            onChangeText={setMobile}
          />

          {/* CITY DROPDOWN + REFRESH */}
          <Text style={styles.label}>CITY</Text>

          <View style={styles.dropdownRow}>
            <View style={{ flex: 1 }}>
              {loadingCities ? (
                <ActivityIndicator color="#F97316" />
              ) : (
                <Dropdown
                  style={styles.dropdown}
                  data={cityList}
                  labelField="label"
                  valueField="value"
                  placeholder="Select city"
                  value={city}
                  onChange={(item) => setCity(item.value)}
                />
              )}
            </View>

            {/* 🔄 MANUAL REFRESH BUTTON */}
            <TouchableOpacity onPress={loadCities} style={styles.refreshBtn}>
              <MaterialIcons name="refresh" size={24} color="#F97316" />
            </TouchableOpacity>
          </View>

          {/* BUTTONS */}
          <TouchableOpacity
            style={styles.saveButton}
            onPress={saveCustomer}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveText}>Save</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.clearButton} onPress={clearForm}>
            <Text>Clear</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  scrollContainer: { padding: 20 },

  header: {
    alignItems: "center",
    marginBottom: 20,
  },

  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 10,
  },

  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    elevation: 3,
  },

  label: {
    marginTop: 10,
    marginBottom: 5,
    fontSize: 12,
    color: "#666",
  },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
  },

  dropdownRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  dropdown: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
  },

  refreshBtn: {
    marginLeft: 10,
    padding: 10,
  },

  saveButton: {
    backgroundColor: "#F97316",
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
    alignItems: "center",
  },

  saveText: {
    color: "#fff",
    fontWeight: "bold",
  },

  clearButton: {
    marginTop: 10,
    alignItems: "center",
  },
});