// screens/Customer.js
import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  View,
  Text,
  Animated,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
  TextInput,
  Modal,
  FlatList,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";

import { CustomerService } from "../../src/service/CustomerService";
import { LocationService } from "../../src/service/LocationService";


interface location {
  uniqueId: string;
  area: string;
  city: string;
  state: string;
  pincode: string;
  pinCode: string;
  country: string;
  branchType: string;
  deliveryStatus: string;
  circle: string;
  division: string;
  region: string;
  block: string;
  taluk: string;
}

export default function Customer() {
  // Customer form states matching DTO
  const [customerName, setCustomerName] = useState("");
  const [mobileNo, setMobileNo] = useState("");
  const [doorNoStreet, setDoorNoStreet] = useState(""); // Address1
  const [area, setArea] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [uniqueKey, setUniqueKey] = useState("");
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [fetchingLocation, setFetchingLocation] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [locations, setLocations] = useState([]);
  
  // Animation
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Auto-fetch location when 6 digits are entered
  useEffect(() => {
    if (pincode.length === 6 && LocationService.validatePincode(pincode)) {
      fetchLocationByPincode();
    } else if (pincode.length !== 6 && pincode.length > 0) {
      clearLocationData();
    }
  }, [pincode]);

  // Fetch location by PIN code
  const fetchLocationByPincode = async () => {
    setFetchingLocation(true);
    try {
      const result = await LocationService.fetchLocationByPincode(pincode);
      
      if (result.success && result.locations.length > 0) {
        setLocations(result.locations);
        
        if (result.locations.length === 1) {
          handleLocationSelect(result.locations[0]);
        } else {
          setShowLocationModal(true);
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }).start();
        }
      } else {
        Alert.alert("No Results", result.message || "No locations found for this PIN code");
        clearLocationData();
      }
    } catch (error) {
      Alert.alert("Error", "Failed to fetch location details");
      clearLocationData();
    } finally {
      setFetchingLocation(false);
    }
  };

  // Handle location selection from modal
  const handleLocationSelect = (location: location) => {
    setArea(location.area);
    setCity(location.city);
    setState(location.state);
    setUniqueKey(location.uniqueId);
    setShowLocationModal(false);
    
    // Show success message
    Alert.alert(
      "Location Found",
      `Area: ${location.area}\nCity: ${location.city}\nState: ${location.state}`,
      [{ text: "OK" }]
    );
  };

  // Clear location data
  const clearLocationData = () => {
    setArea("");
    setCity("");
    setState("");
    setUniqueKey("");
    setLocations([]);
  };

  // Validate mobile number
  const validateMobile = (number: string) => {
    return /^[0-9]{10}$/.test(number);
  };

  // Save customer
  const saveCustomer = async () => {
    // Validation
    if (!customerName) {
      Alert.alert("Validation", "Customer name is required");
      return;
    }

    if (!validateMobile(mobileNo)) {
      Alert.alert("Validation", "Enter valid 10-digit mobile number");
      return;
    }

    if (!doorNoStreet) {
      Alert.alert("Validation", "Door No & Street is required");
      return;
    }

    if (!pincode || pincode.length !== 6) {
      Alert.alert("Validation", "Please enter a valid 6-digit PIN code");
      return;
    }

    if (!uniqueKey) {
      Alert.alert("Validation", "Please fetch/verify location using PIN code");
      return;
    }

    const payload = {
      customerName: customerName,
      mobileNo: mobileNo,
      address1: doorNoStreet,
      area: area,
      city: city,
      state: state,
      pincode: pincode,
      pinCode: pincode,
      uniqueKey: uniqueKey,
    };

    try {
      setLoading(true);
      const response = await CustomerService.saveCustomer(payload);

      if (response.success) {
        Alert.alert("Success", "Customer saved successfully");
        clearForm();
      } else {
        Alert.alert("Error", response.message || "Failed to save customer");
      }
    } catch (error) {
      console.log("Save Error:", error);
      Alert.alert("Error", "Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Clear entire form
  const clearForm = () => {
    setCustomerName("");
    setMobileNo("");
    setDoorNoStreet("");

    setPincode("");
    setArea("");
    setCity("");
    setState("");
    setUniqueKey("");
    setLocations([]);
  };

  // Handle manual pincode input
  const handleManualPincodeChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    if (cleaned.length <= 6) {
      setPincode(cleaned);
    }
  };

  // Render location selection modal
  const renderLocationModal = () => (
    <Modal
      visible={showLocationModal}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowLocationModal(false)}
    >
      <View style={styles.modalOverlay}>
        <Animated.View style={[styles.modalContent, { opacity: fadeAnim }]}>
          <View style={styles.modalHeader}>
            <MaterialIcons name="location-on" size={24} color="#F97316" />
            <Text style={styles.modalTitle}>Select Your Area</Text>
            <TouchableOpacity onPress={() => setShowLocationModal(false)}>
              <MaterialIcons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.modalSubtitle}>
            Multiple areas found for PIN code: {pincode}
          </Text>
          
          <FlatList
            data={locations}
            keyExtractor={(item: location) => item.uniqueId}
            renderItem={({ item }: { item: location }) => (
              <TouchableOpacity
                style={styles.locationItem}
                onPress={() => handleLocationSelect(item)}
              >
                <View style={styles.locationIconContainer}>
                  <MaterialIcons name="location-city" size={20} color="#F97316" />
                </View>
                <View style={styles.locationDetails}>
                  <Text style={styles.locationArea}>{item.area}</Text>
                  <Text style={styles.locationInfo}>
                    {item.city}, {item.state} - {item.pincode}
                  </Text>
                </View>
                <MaterialIcons name="chevron-right" size={20} color="#999" />
              </TouchableOpacity>
            )}
            showsVerticalScrollIndicator={false}
          />
        </Animated.View>
      </View>
    </Modal>
  );

  return (
    <LinearGradient colors={["#FFF3E0", "#FFFFFF"]} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header */}


        {/* Customer Form Card */}
        <View style={styles.card}>
          {/* Customer Name */}
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>CUSTOMER NAME *</Text>
            <View style={styles.inputContainer}>
              <MaterialIcons name="person" size={20} color="#F97316" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter customer name"
                value={customerName}
                onChangeText={setCustomerName}
                editable={!loading}
              />
            </View>
          </View>

          {/* Mobile Number */}
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>MOBILE NUMBER *</Text>
            <View style={styles.inputContainer}>
              <MaterialIcons name="phone" size={20} color="#F97316" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter 10-digit mobile number"
                keyboardType="numeric"
                maxLength={10}
                value={mobileNo}
                onChangeText={setMobileNo}
                editable={!loading}
              />
            </View>
          </View>

          {/* Door No & Street (Address1) */}
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>DOOR NO & STREET *</Text>
            <View style={styles.inputContainer}>
              <MaterialIcons name="home" size={20} color="#F97316" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter door number and street"
                value={doorNoStreet}
                onChangeText={setDoorNoStreet}
                editable={!loading}
              />
            </View>
          </View>

          {/* Address Line 2 */}
          

          {/* Address Line 3 */}
        

          {/* PIN Code Input with Find Button */}
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>PIN CODE *</Text>
            <View style={styles.pincodeContainer}>
              <View style={styles.pincodeInputWrapper}>
                <MaterialIcons name="pin-drop" size={20} color="#F97316" />
                <TextInput
                  style={styles.pincodeInput}
                  placeholder="Enter 6-digit PIN code"
                  value={pincode}
                  onChangeText={handleManualPincodeChange}
                  keyboardType="numeric"
                  maxLength={6}
                  editable={!loading && !fetchingLocation}
                />
              </View>
              
              <TouchableOpacity
                style={[styles.findButton, (pincode.length !== 6 || fetchingLocation) && styles.findButtonDisabled]}
                onPress={fetchLocationByPincode}
                disabled={pincode.length !== 6 || fetchingLocation}
              >
                {fetchingLocation ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <MaterialIcons name="search" size={18} color="#fff" />
                    <Text style={styles.findButtonText}>Find</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
            {pincode.length > 0 && pincode.length !== 6 && (
              <Text style={styles.errorText}>PIN code must be 6 digits</Text>
            )}
          </View>

          {/* Area - Auto-filled (Read Only) */}
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>AREA *</Text>
            <View style={[styles.inputContainer, styles.readOnlyContainer]}>
              <MaterialIcons name="place" size={20} color="#F97316" style={styles.inputIcon} />
              <TextInput
                style={styles.readOnlyInput}
                value={area}
                placeholder="Auto-filled from PIN code"
                editable={false}
                pointerEvents="none"
              />
              {area && <MaterialIcons name="check-circle" size={16} color="#4CAF50" />}
            </View>
          </View>

          {/* City - Auto-filled (Read Only) */}
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>CITY *</Text>
            <View style={[styles.inputContainer, styles.readOnlyContainer]}>
              <MaterialIcons name="location-city" size={20} color="#F97316" style={styles.inputIcon} />
              <TextInput
                style={styles.readOnlyInput}
                value={city}
                placeholder="Auto-filled from PIN code"
                editable={false}
                pointerEvents="none"
              />
              {city && <MaterialIcons name="check-circle" size={16} color="#4CAF50" />}
            </View>
          </View>

          {/* State - Auto-filled (Read Only) */}
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>STATE *</Text>
            <View style={[styles.inputContainer, styles.readOnlyContainer]}>
              <MaterialIcons name="map" size={20} color="#F97316" style={styles.inputIcon} />
              <TextInput
                style={styles.readOnlyInput}
                value={state}
                placeholder="Auto-filled from PIN code"
                editable={false}
                pointerEvents="none"
              />
              {state && <MaterialIcons name="check-circle" size={16} color="#4CAF50" />}
            </View>
          </View>

          {/* Unique Key Info (Hidden but shown for verification) */}
          {uniqueKey ? (
            <View style={styles.infoCard}>
              <MaterialIcons name="info" size={16} color="#4CAF50" />
              <Text style={styles.infoText}>
                Location verified ✓ Unique Key: {uniqueKey.substring(0, 20)}...
              </Text>
            </View>
          ) : (
            pincode.length === 6 && (
              <View style={styles.warningCard}>
                <MaterialIcons name="warning" size={16} color="#FF9800" />
                <Text style={styles.warningText}>
                  Please click Find button to verify location
                </Text>
              </View>
            )
          )}

          {/* Action Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.saveButton, (!uniqueKey || loading) && styles.buttonDisabled]}
              onPress={saveCustomer}
              disabled={!uniqueKey || loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={styles.buttonText}>Save Customer</Text>
                  <MaterialIcons name="save" size={20} color="#fff" />
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.clearButton}
              onPress={clearForm}
              disabled={loading}
            >
              <MaterialIcons name="clear" size={20} color="#666" />
              <Text style={styles.clearButtonText}>Clear All</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Info Note */}
        <View style={styles.noteCard}>
          <MaterialIcons name="info" size={20} color="#F97316" />
          <Text style={styles.noteText}>
            Enter PIN code and click Find to automatically fill Area, City, and State. Door No & Street are required fields.
          </Text>
        </View>
      </ScrollView>

      {/* Location Selection Modal */}
      {renderLocationModal()}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: { flexGrow: 1, padding: 20 },
  
  // Header Styles
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
  
  // Card Styles
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
  
  // Input Styles
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
  readOnlyContainer: {
    backgroundColor: "#f5f5f5",
    borderColor: "#e8e8e8",
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, color: "#333", paddingVertical: 12 },
  readOnlyInput: {
    flex: 1,
    fontSize: 15,
    color: "#666",
    paddingVertical: 12,
  },
  
  // PIN Code Styles
  pincodeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  pincodeInputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 10,
    backgroundColor: "#f8f9fa",
    paddingHorizontal: 12,
    gap: 10,
    minHeight: 50,
  },
  pincodeInput: {
    flex: 1,
    fontSize: 15,
    color: "#333",
    paddingVertical: 12,
  },
  findButton: {
    backgroundColor: "#F97316",
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    minHeight: 50,
  },
  findButtonDisabled: {
    backgroundColor: "#ccc",
    opacity: 0.7,
  },
  findButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  errorText: {
    fontSize: 12,
    color: "#f44336",
    marginTop: 5,
    marginLeft: 5,
  },
  
  // Info Cards
  infoCard: {
    flexDirection: "row",
    backgroundColor: "#E8F5E9",
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
    alignItems: "center",
    gap: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: "#2E7D32",
  },
  warningCard: {
    flexDirection: "row",
    backgroundColor: "#FFF3E0",
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
    alignItems: "center",
    gap: 8,
  },
  warningText: {
    flex: 1,
    fontSize: 12,
    color: "#F97316",
  },
  
  // Button Styles
  buttonRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 10, gap: 10 },
  saveButton: {
    flex: 2,
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
  clearButton: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingVertical: 15,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  buttonDisabled: { opacity: 0.7, backgroundColor: "#999" },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  clearButtonText: { color: "#666", marginLeft: 5, fontSize: 14 },
  
  // Note Card
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
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    width: "90%",
    maxHeight: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
    marginLeft: 10,
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 15,
  },
  locationItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  locationIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFF3E0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  locationDetails: {
    flex: 1,
  },
  locationArea: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  locationInfo: {
    fontSize: 13,
    color: "#666",
  },
});

