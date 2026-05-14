// app/(admin)/customer-list.tsx
// Add this at the top of the file to disable TypeScript strict checking for this file
// @ts-nocheck

import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  Dimensions,
  RefreshControl,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";
import * as XLSX from "xlsx";
import { CustomerService } from "../../src/service/CustomerService";

const { width } = Dimensions.get("window");

// Filter Key Mapping for API
const FILTER_KEY_MAP = {
  name: "N",
  mobile: "M",
  city: "C",
  area: "A",
  pincode: "P",
  createdby: "U",
};

export default function CustomerList() {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [searchField, setSearchField] = useState("name");
  const [pdfLoading, setPdfLoading] = useState(false);
  const [excelLoading, setExcelLoading] = useState(false);

  // Load customers with API filter
  const loadCustomers = useCallback(async (filterKey = null, filterValue = null) => {
    try {
      setLoading(true);
      const key = filterKey ? FILTER_KEY_MAP[filterKey] : null;
      const value = filterValue || null;
      
      const res = await CustomerService.getCustomers(key, value);
      console.log("API Response:", res);
      
      if (res && res.success && Array.isArray(res.data)) {
        const mappedData = res.data.map((item) => ({
          sno: item.sno,
          customerName: item.customerName || "-",
          mobileNo: item.mobileNo || "-",
          area: item.area || "-",
          address1: item.address1 || "-",
          address2: item.address2 || "-",
          address3: item.address3 || "-",
          city: item.city || "-",
          state: item.state || "-",
          pinCode: item.pinCode || item.PinCode || "-",
          uniqueKey: item.uniqueKey || "-",
          acName: item.acName || item.acctCode || "-",
        }));
        setCustomers(mappedData);
        setFilteredCustomers(mappedData);
      } else {
        setCustomers([]);
        setFilteredCustomers([]);
      }
    } catch (err) {
      console.log("Load Error:", err);
      Alert.alert("Error", "Failed to load customers");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCustomers();
  }, []);

  // Pull to refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadCustomers();
    setRefreshing(false);
  }, [loadCustomers]);

  // Handle Search Button Press
  const handleSearch = () => {
    if (!searchText.trim()) {
      loadCustomers();
    } else {
      loadCustomers(searchField, searchText);
    }
  };

  // Clear search and reload all
  const clearSearch = () => {
    setSearchText("");
    loadCustomers();
  };

  // Excel Export
  const generateExcel = async () => {
    const dataToExport = filteredCustomers.length > 0 ? filteredCustomers : customers;
    
    if (dataToExport.length === 0) {
      Alert.alert("No Data", "There are no customers to export.");
      return;
    }

    try {
      setExcelLoading(true);

      const excelData = dataToExport.map((item, index) => ({
        "S.No": index + 1,
        "Customer Name": item.customerName || "-",
        "Mobile No": item.mobileNo || "-",
        "Area": item.area || "-",
        "Address": [item.address1, item.address2, item.address3].filter(Boolean).join(", ") || "-",
        "City": item.city || "-",
        "State": item.state || "-",
        "Pin Code": item.pinCode || "-",
        "Created By": item.acName || "-",
      }));

      const ws = XLSX.utils.json_to_sheet(excelData);
      ws['!cols'] = [
        { wch: 8 }, { wch: 25 }, { wch: 15 }, { wch: 20 },
        { wch: 40 }, { wch: 20 }, { wch: 20 }, { wch: 12 }, { wch: 20 },
      ];

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Customers");

      const wbout = XLSX.write(wb, { type: "base64", bookType: "xlsx" });
      const fileName = `Customers_${new Date().toISOString().split('T')[0]}.xlsx`;
      const fileUri = FileSystem.documentDirectory + fileName;
      
      await FileSystem.writeAsStringAsync(fileUri, wbout, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(fileUri, {
          mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          dialogTitle: "Export Customer List",
        });
      } else {
        Alert.alert("Saved", `Excel file saved to:\n${fileUri}`);
      }
    } catch (err) {
      console.log("Excel Error:", err);
      Alert.alert("Error", "Failed to generate Excel file. Please try again.");
    } finally {
      setExcelLoading(false);
    }
  };

  // PDF Export
  const generatePDF = async () => {
    const dataToExport = filteredCustomers.length > 0 ? filteredCustomers : customers;
    
    if (dataToExport.length === 0) {
      Alert.alert("No Data", "There are no customers to export.");
      return;
    }

    try {
      setPdfLoading(true);

      const now = new Date();
      const dateStr = now.toLocaleDateString("en-IN");
      const timeStr = now.toLocaleTimeString("en-IN");

      const filterLabel = searchText.trim()
        ? `Filter: ${searchField} = "${searchText}"`
        : "Showing: All Customers";

      const tableRows = dataToExport.map((item, index) => `
        <tr class="${index % 2 === 0 ? "even" : "odd"}">
          <td class="center">${index + 1}</td>
          <td>${item.customerName || "-"}</td>
          <td class="center">${item.mobileNo || "-"}</td>
          <td>${item.area || "-"}</td>
          <td>${[item.address1, item.address2, item.address3].filter(Boolean).join(", ") || "-"}</td>
          <td>${item.city || "-"}</td>
          <td>${item.state || "-"}</td>
          <td class="center">${item.pinCode || "-"}</td>
          <td>${item.acName || "-"}</td>
        </tr>
      `).join("");

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8" />
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Arial, sans-serif; font-size: 11px; padding: 20px; }
            .header { text-align: center; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 2px solid #F97316; }
            .header h1 { font-size: 20px; color: #F97316; margin-bottom: 5px; }
            .info-row { display: flex; justify-content: space-between; margin-bottom: 15px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
            thead tr { background-color: #F97316; color: #fff; }
            th { padding: 8px 6px; text-align: left; font-size: 10px; font-weight: bold; border: 1px solid #fff; }
            td { padding: 6px; border: 1px solid #e0e0e0; font-size: 9px; }
            tbody tr.even { background-color: #fff; }
            tbody tr.odd { background-color: #FFF8F3; }
            .center { text-align: center; }
            .footer { text-align: center; font-size: 9px; color: #999; margin-top: 15px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Customer List Report</h1>
            <div>Generated on ${dateStr} at ${timeStr}</div>
          </div>
          <div class="info-row">
            <span>${filterLabel}</span>
            <span>Total Records: ${dataToExport.length}</span>
          </div>
          <table>
            <thead>
              <tr>
                <th class="center">S.No</th>
                <th>Customer Name</th>
                <th class="center">Mobile</th>
                <th>Area</th>
                <th>Address</th>
                <th>City</th>
                <th>State</th>
                <th class="center">Pin Code</th>
                <th>Created By</th>
              </tr>
            </thead>
            <tbody>${tableRows}</tbody>
          </table>
          <div class="footer">Auto-generated report</div>
        </body>
        </html>`;

      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      await Sharing.shareAsync(uri);
    } catch (err) {
      console.log("PDF Error:", err);
      Alert.alert("Error", "Failed to generate PDF");
    } finally {
      setPdfLoading(false);
    }
  };

  const renderItem = ({ item, index }) => (
    <View style={[styles.row, index % 2 === 0 ? styles.rowEven : styles.rowOdd]}>
      <View style={styles.cellSerial}><Text style={styles.cellText}>{index + 1}</Text></View>
      <View style={styles.cellName}><Text style={styles.cellText} numberOfLines={1}>{item.customerName}</Text></View>
      <View style={styles.cellMobile}><Text style={styles.cellText}>{item.mobileNo}</Text></View>
      <View style={styles.cellArea}><Text style={styles.cellText} numberOfLines={1}>{item.area}</Text></View>
      <View style={styles.cellAddress}><Text style={styles.cellText} numberOfLines={2}>{item.address1 !== "-" ? item.address1 : "-"}</Text></View>
      <View style={styles.cellCity}><Text style={styles.cellText} numberOfLines={1}>{item.city}</Text></View>
      <View style={styles.cellState}><Text style={styles.cellText} numberOfLines={1}>{item.state}</Text></View>
      <View style={styles.cellPincode}><Text style={styles.cellText}>{item.pinCode}</Text></View>
      <View style={styles.cellCreated}><Text style={styles.cellText} numberOfLines={1}>{item.acName}</Text></View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#F97316" />
        <Text style={styles.loadingText}>Loading customers...</Text>
      </View>
    );
  }

  return (
    <LinearGradient colors={["#FFF3E0", "#FFFFFF"]} style={styles.container}>
      <View style={styles.searchSection}>
        <View style={styles.exportButtons}>
          <TouchableOpacity style={styles.excelButton} onPress={generateExcel} disabled={excelLoading}>
            {excelLoading ? <ActivityIndicator size="small" color="#4CAF50" /> : <>
              <MaterialIcons name="table-chart" size={20} color="#4CAF50" />
              <Text style={styles.excelButtonText}>Export Excel</Text>
            </>}
          </TouchableOpacity>
          <TouchableOpacity style={styles.pdfButton} onPress={generatePDF} disabled={pdfLoading}>
            {pdfLoading ? <ActivityIndicator size="small" color="#F97316" /> : <>
              <MaterialIcons name="picture-as-pdf" size={20} color="#F97316" />
              <Text style={styles.pdfButtonText}>Export PDF</Text>
            </>}
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <MaterialIcons name="search" size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search..."
            placeholderTextColor="#999"
            value={searchText}
            onChangeText={setSearchText}
            returnKeyType="search"
            onSubmitEditing={handleSearch}
          />
          <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
            <Text style={styles.searchButtonText}>GO</Text>
          </TouchableOpacity>
          {searchText !== "" && (
            <TouchableOpacity onPress={clearSearch} style={styles.clearBtn}>
              <MaterialIcons name="close" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          <View style={styles.filterContainer}>
            {[
              { value: "name", label: "Name", icon: "person" },
              { value: "mobile", label: "Mobile", icon: "phone" },
              { value: "area", label: "Area", icon: "place" },
              { value: "city", label: "City", icon: "location-city" },
              { value: "pincode", label: "Pin Code", icon: "pin-drop" },
              { value: "createdby", label: "Created By", icon: "person-add" },
            ].map((filter) => (
              <TouchableOpacity
                key={filter.value}
                style={[styles.filterChip, searchField === filter.value && styles.filterChipActive]}
                onPress={() => setSearchField(filter.value)}
              >
                <MaterialIcons name={filter.icon} size={14} color={searchField === filter.value ? "#fff" : "#666"} />
                <Text style={[styles.filterText, searchField === filter.value && styles.filterTextActive]}>
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <View style={styles.totalContainer}>
          <Text style={styles.totalText}>Total Customers: {(filteredCustomers.length > 0 ? filteredCustomers : customers).length}</Text>
        </View>
      </View>

      <View style={styles.tableWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={true}>
          <View style={styles.tableContainer}>
            <View style={styles.tableHeader}>
              <View style={styles.cellSerial}><Text style={styles.headerText}>S.No</Text></View>
              <View style={styles.cellName}><Text style={styles.headerText}>Customer Name</Text></View>
              <View style={styles.cellMobile}><Text style={styles.headerText}>Mobile</Text></View>
              <View style={styles.cellArea}><Text style={styles.headerText}>Area</Text></View>
              <View style={styles.cellAddress}><Text style={styles.headerText}>Address</Text></View>
              <View style={styles.cellCity}><Text style={styles.headerText}>City</Text></View>
              <View style={styles.cellState}><Text style={styles.headerText}>State</Text></View>
              <View style={styles.cellPincode}><Text style={styles.headerText}>Pin Code</Text></View>
              <View style={styles.cellCreated}><Text style={styles.headerText}>Created By</Text></View>
            </View>

            <FlatList
              data={filteredCustomers.length > 0 ? filteredCustomers : customers}
              keyExtractor={(item, index) => item.sno?.toString() || index.toString()}
              renderItem={renderItem}
              showsVerticalScrollIndicator={true}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#F97316"]} />}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <MaterialIcons name="people-outline" size={60} color="#ccc" />
                  <Text style={styles.emptyText}>No Customers Found</Text>
                </View>
              }
            />
          </View>
        </ScrollView>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#FFF3E0" },
  loadingText: { marginTop: 10, color: "#F97316", fontSize: 14 },
  searchSection: { backgroundColor: "#fff", margin: 15, padding: 15, borderRadius: 15, elevation: 3 },
  exportButtons: { flexDirection: "row", justifyContent: "space-between", gap: 10, marginBottom: 15 },
  excelButton: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "#E8F5E9", paddingVertical: 10, borderRadius: 10, gap: 8, borderWidth: 1, borderColor: "#4CAF50" },
  excelButtonText: { color: "#4CAF50", fontSize: 14, fontWeight: "bold" },
  pdfButton: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "#FFF3E0", paddingVertical: 10, borderRadius: 10, gap: 8, borderWidth: 1, borderColor: "#F97316" },
  pdfButtonText: { color: "#F97316", fontSize: 14, fontWeight: "bold" },
  searchContainer: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#e0e0e0", borderRadius: 10, backgroundColor: "#f8f9fa", marginBottom: 10 },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 14, color: "#333", paddingVertical: 10 },
  searchButton: { backgroundColor: "#F97316", paddingHorizontal: 15, paddingVertical: 10, borderRadius: 8, marginRight: 5 },
  searchButtonText: { color: "#fff", fontWeight: "bold", fontSize: 14 },
  clearBtn: { paddingHorizontal: 10, justifyContent: "center" },
  filterScroll: { marginBottom: 10 },
  filterContainer: { flexDirection: "row", flexWrap: "nowrap" },
  filterChip: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginRight: 8, backgroundColor: "#f0f0f0", gap: 4 },
  filterChipActive: { backgroundColor: "#F97316" },
  filterText: { fontSize: 12, color: "#666" },
  filterTextActive: { color: "#fff" },
  totalContainer: { alignItems: "center", paddingTop: 10, borderTopWidth: 1, borderTopColor: "#f0f0f0" },
  totalText: { fontSize: 14, fontWeight: "bold", color: "#F97316" },
  tableWrapper: { flex: 1, backgroundColor: "#fff", marginHorizontal: 15, marginBottom: 15, borderRadius: 15, overflow: "hidden", elevation: 3 },
  tableContainer: { minWidth: 900, backgroundColor: "#fff" },
  tableHeader: { flexDirection: "row", backgroundColor: "#F97316", paddingVertical: 12, paddingHorizontal: 8 },
  headerText: { color: "#fff", fontWeight: "bold", fontSize: 12 },
  row: { flexDirection: "row", paddingVertical: 10, paddingHorizontal: 8, borderBottomWidth: 1, borderBottomColor: "#f0f0f0" },
  rowEven: { backgroundColor: "#fff" },
  rowOdd: { backgroundColor: "#FFF8F3" },
  cellText: { fontSize: 12, color: "#555" },
  cellSerial: { width: 50, alignItems: "center", justifyContent: "center" },
  cellName: { width: 140, paddingHorizontal: 5 },
  cellMobile: { width: 100, paddingHorizontal: 5 },
  cellArea: { width: 120, paddingHorizontal: 5 },
  cellAddress: { width: 180, paddingHorizontal: 5 },
  cellCity: { width: 120, paddingHorizontal: 5 },
  cellState: { width: 100, paddingHorizontal: 5 },
  cellPincode: { width: 90, paddingHorizontal: 5, alignItems: "center" },
  cellCreated: { width: 120, paddingHorizontal: 5 },
  emptyContainer: { padding: 50, alignItems: "center" },
  emptyText: { fontSize: 16, color: "#999", marginTop: 10 },
});