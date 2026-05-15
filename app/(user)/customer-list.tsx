// app/(user)/customer-list.tsx
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
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system/legacy";
import * as XLSX from "xlsx";
import { CustomerService } from "../../src/service/CustomerService";
import { useAuth } from "../../src/contexts/AuthContext";

const { width } = Dimensions.get("window");

const FILTER_KEY_MAP = {
  name: "N",
  mobile: "M",
  city: "C",
  area: "A",
  pincode: "P",
  createdby: "U",
};

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// ─── Custom Date Picker ────────────────────────────────────────────────────────
function CustomDatePicker({ visible, onClose, onSelectDate, title, selectedDate }) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(selectedDate ? new Date(selectedDate).getFullYear() : today.getFullYear());
  const [viewMonth, setViewMonth] = useState(selectedDate ? new Date(selectedDate).getMonth() : today.getMonth());
  const [pickedDate, setPickedDate] = useState(selectedDate || null);

  // Re-sync when opened
  useEffect(() => {
    if (visible) {
      const base = selectedDate ? new Date(selectedDate) : today;
      setViewYear(base.getFullYear());
      setViewMonth(base.getMonth());
      setPickedDate(selectedDate || null);
    }
  }, [visible]);

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay(); // 0=Sun

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const handleDayPress = (day) => {
    const mm = String(viewMonth + 1).padStart(2, "0");
    const dd = String(day).padStart(2, "0");
    setPickedDate(`${viewYear}-${mm}-${dd}`);
  };

  const handleConfirm = () => {
    if (pickedDate) { onSelectDate(pickedDate); onClose(); }
    else Alert.alert("Select a date", "Please tap a day first.");
  };

  // Build calendar grid: leading empty cells + day numbers
  const cells = [];
  for (let i = 0; i < firstDayOfWeek; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const isSelected = (day) => {
    if (!day || !pickedDate) return false;
    const mm = String(viewMonth + 1).padStart(2, "0");
    const dd = String(day).padStart(2, "0");
    return pickedDate === `${viewYear}-${mm}-${dd}`;
  };

  const isToday = (day) => {
    if (!day) return false;
    return (
      day === today.getDate() &&
      viewMonth === today.getMonth() &&
      viewYear === today.getFullYear()
    );
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={dpStyles.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity activeOpacity={1} style={dpStyles.card}>
          {/* Title */}
          <Text style={dpStyles.title}>{title}</Text>

          {/* Month / Year Navigation */}
          <View style={dpStyles.navRow}>
            <TouchableOpacity onPress={prevMonth} style={dpStyles.navBtn}>
              <MaterialIcons name="chevron-left" size={26} color="#F97316" />
            </TouchableOpacity>
            <Text style={dpStyles.navLabel}>
              {MONTHS[viewMonth]} {viewYear}
            </Text>
            <TouchableOpacity onPress={nextMonth} style={dpStyles.navBtn}>
              <MaterialIcons name="chevron-right" size={26} color="#F97316" />
            </TouchableOpacity>
          </View>

          {/* Year stepper */}
          <View style={dpStyles.yearRow}>
            <TouchableOpacity onPress={() => setViewYear(y => y - 1)} style={dpStyles.yearBtn}>
              <Text style={dpStyles.yearBtnText}>−</Text>
            </TouchableOpacity>
            <Text style={dpStyles.yearLabel}>{viewYear}</Text>
            <TouchableOpacity onPress={() => setViewYear(y => y + 1)} style={dpStyles.yearBtn}>
              <Text style={dpStyles.yearBtnText}>+</Text>
            </TouchableOpacity>
          </View>

          {/* Day-of-week headers */}
          <View style={dpStyles.weekRow}>
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(d => (
              <Text key={d} style={dpStyles.weekDay}>{d}</Text>
            ))}
          </View>

          {/* Calendar grid */}
          <View style={dpStyles.grid}>
            {cells.map((day, idx) => (
              <TouchableOpacity
                key={idx}
                style={[
                  dpStyles.dayCell,
                  isSelected(day) && dpStyles.dayCellSelected,
                  isToday(day) && !isSelected(day) && dpStyles.dayCellToday,
                  !day && dpStyles.dayCellEmpty,
                ]}
                onPress={() => day && handleDayPress(day)}
                disabled={!day}
                activeOpacity={day ? 0.7 : 1}
              >
                <Text style={[
                  dpStyles.dayText,
                  isSelected(day) && dpStyles.dayTextSelected,
                  isToday(day) && !isSelected(day) && dpStyles.dayTextToday,
                ]}>
                  {day || ""}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Selected date display */}
          {pickedDate && (
            <Text style={dpStyles.selectedLabel}>Selected: {pickedDate}</Text>
          )}

          {/* Actions */}
          <View style={dpStyles.actionRow}>
            <TouchableOpacity style={dpStyles.cancelBtn} onPress={onClose}>
              <Text style={dpStyles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={dpStyles.confirmBtn} onPress={handleConfirm}>
              <Text style={dpStyles.confirmBtnText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const dpStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 20,
    width: 320,
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
    color: "#F97316",
    textAlign: "center",
    marginBottom: 12,
  },
  navRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  navBtn: { padding: 4 },
  navLabel: { fontSize: 15, fontWeight: "700", color: "#333" },
  yearRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    marginBottom: 12,
  },
  yearBtn: {
    backgroundColor: "#FFF3E0",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "#F97316",
  },
  yearBtnText: { fontSize: 18, color: "#F97316", fontWeight: "bold" },
  yearLabel: { fontSize: 15, fontWeight: "700", color: "#555", minWidth: 50, textAlign: "center" },
  weekRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  weekDay: {
    width: 40,
    textAlign: "center",
    fontSize: 11,
    fontWeight: "700",
    color: "#F97316",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 10,
  },
  dayCell: {
    width: 40,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    marginBottom: 2,
  },
  dayCellEmpty: { opacity: 0 },
  dayCellSelected: { backgroundColor: "#F97316" },
  dayCellToday: { borderWidth: 1.5, borderColor: "#F97316" },
  dayText: { fontSize: 13, color: "#333" },
  dayTextSelected: { color: "#fff", fontWeight: "700" },
  dayTextToday: { color: "#F97316", fontWeight: "700" },
  selectedLabel: {
    textAlign: "center",
    fontSize: 13,
    color: "#F97316",
    fontWeight: "600",
    marginBottom: 12,
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    alignItems: "center",
  },
  cancelBtnText: { color: "#666", fontWeight: "600" },
  confirmBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 10,
    backgroundColor: "#F97316",
    alignItems: "center",
  },
  confirmBtnText: { color: "#fff", fontWeight: "700" },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function CustomerList() {
  const { user } = useAuth();
  const userName = user?.name || "";

  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [searchField, setSearchField] = useState("name");
  const [pdfLoading, setPdfLoading] = useState(false);
  const [excelLoading, setExcelLoading] = useState(false);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);

  // Date picker modal state
  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerTarget, setPickerTarget] = useState(null); // "from" | "to"

  // Edit modal
  const [editVisible, setEditVisible] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editForm, setEditForm] = useState({
    customerName: "", mobileNo: "", mobileNo1: "",
    emailID: "", area: "", address1: "",
    city: "", state: "", pinCode: "",
  });

  const clean = (v) => (v === "-" ? "" : v || "");

  const openEdit = (item) => {
    setEditItem(item);
    setEditForm({
      customerName: clean(item.customerName),
      mobileNo: clean(item.mobileNo),
      mobileNo1: clean(item.mobileNo1),
      emailID: clean(item.emailID),
      area: clean(item.area),
      address1: clean(item.address1),
      city: clean(item.city),
      state: clean(item.state),
      pinCode: clean(item.pinCode),
    });
    setEditVisible(true);
  };

  const handleUpdate = async () => {
    if (!editForm.customerName.trim()) {
      Alert.alert("Validation", "Customer Name is required."); return;
    }
    setEditLoading(true);
    try {
      const res = await CustomerService.updateCustomer(editItem.sno, {
        customerName: editForm.customerName,
        mobileNo: editForm.mobileNo,
        mobileNo1: editForm.mobileNo1,
        emailID: editForm.emailID,
        area: editForm.area,
        address1: editForm.address1,
        city: editForm.city,
        state: editForm.state,
        pinCode: editForm.pinCode,
      });
      if (res?.success) {
        Alert.alert("Success", "Customer updated successfully.");
        setEditVisible(false);
        loadCustomers();
      } else {
        Alert.alert("Error", res?.message || "Update failed.");
      }
    } catch (e) {
      console.log("Update Error:", e);
      Alert.alert("Error", "Update failed.");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = (item) => {
    console.log("Delete item:", item.sno, item.customerName);
    Alert.alert(
      "Delete Customer",
      `Are you sure you want to delete "${item.customerName}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete", style: "destructive",
          onPress: async () => {
            try {
              console.log("Deleting sno:", item.sno);
              const res = await CustomerService.deleteCustomer(item.sno);
              console.log("Delete Response:", JSON.stringify(res));
              if (res?.success) {
                Alert.alert("Deleted", "Customer deleted successfully.");
                loadCustomers();
              } else {
                Alert.alert("Error", res?.message || "Delete failed.");
              }
            } catch (e) {
              console.log("Delete Error:", e);
              Alert.alert("Error", "Delete failed.");
            }
          },
        },
      ]
    );
  };

  const openPicker = (target) => {
    setPickerTarget(target);
    setPickerVisible(true);
  };

  const handlePickerSelect = (dateStr) => {
    const newFrom = pickerTarget === "from" ? dateStr : fromDate;
    const newTo = pickerTarget === "to" ? dateStr : toDate;
    if (pickerTarget === "from") setFromDate(dateStr);
    else setToDate(dateStr);
    if (newFrom && newTo) {
      loadCustomers(searchText.trim() ? searchField : null, searchText.trim() || null, newFrom, newTo);
    }
  };

  // Load customers — always filtered by logged-in user
  const loadCustomers = useCallback(async (filterKey = null, filterValue = null, fd = null, td = null) => {
    try {
      setLoading(true);
      // Always pass createdby=userName as base filter
      // If additional search, use that key/value; otherwise use createdby
      const key = filterKey ? FILTER_KEY_MAP[filterKey] : "U";
      const value = filterKey ? filterValue : userName;
      const res = await CustomerService.getCustomers(key, value, fd, td);
      if (res && res.success && Array.isArray(res.data)) {
        const mappedData = res.data.map((item) => ({
          sno: item.Sno,
          customerName: item.CustomerName || "-",
          mobileNo: item.MobileNo || "-",
          mobileNo1: item.MobileNo1 || "-",
          phoneNo: item.PhoneNo || "-",
          emailID: item.EmailID || "-",
          area: item.Area || "-",
          address1: item.Address1 || "-",
          address2: item.Address2 || "-",
          address3: item.Address3 || "-",
          city: item.City || "-",
          state: item.State || "-",
          pinCode: item.PinCode || "-",
          gstNo: item.GSTNo || "-",
          uniqueKey: item.UniqueKey || "-",
          acName: item.acName || item.AcctCode || "-",
        }));
        setCustomers(mappedData);
        setFilteredCustomers(mappedData);
      } else {
        setCustomers([]);
        setFilteredCustomers([]);
      }
    } catch (err) {
      Alert.alert("Error", "Failed to load customers");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (userName) loadCustomers(); }, [userName]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadCustomers();
    setRefreshing(false);
  }, [loadCustomers]);

  const handleSearch = () => {
    if (!searchText.trim()) loadCustomers(null, null, fromDate, toDate);
    else loadCustomers(searchField, searchText, fromDate, toDate);
  };

  const clearSearch = () => {
    setSearchText("");
    setFromDate(null);
    setToDate(null);
    loadCustomers();
  };

  // Excel Export
const generateExcel = async () => {
  try {
    setExcelLoading(true);

    const dataToExport =
      filteredCustomers.length > 0
        ? filteredCustomers
        : customers;

    if (dataToExport.length === 0) {
      Alert.alert("No Data", "There are no customers to export.");
      return;
    }

    const excelData = dataToExport.map((item, index) => ({
      "S.No": index + 1,
      "Customer Name": item.customerName || "-",
      "Mobile No": item.mobileNo || "-",
      "Area": item.area || "-",
      "Address":
        [
          item.address1,
          item.address2,
          item.address3,
        ]
          .filter((v) => v && v !== "-")
          .join(", ") || "-",
      "City": item.city || "-",
      "State": item.state || "-",
      "Pin Code": item.pinCode || "-",
      "Created By": item.acName || "-",
    }));

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Customers");

    // Generate base64
    const wbout = XLSX.write(wb, {
      type: "base64",
      bookType: "xlsx",
    });

    const fileName = `Customers_${
      new Date().toISOString().split("T")[0]
    }.xlsx`;

    const fileUri =
      FileSystem.documentDirectory + fileName;

    // Write file
    await FileSystem.writeAsStringAsync(
  fileUri,
  wbout,
  {
    encoding: "base64",
  }
);

    console.log("Excel saved:", fileUri);

    // Share file
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri, {
        mimeType:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        dialogTitle: "Export Excel",
      });
    } else {
      Alert.alert("Saved", fileUri);
    }
  } catch (err) {
    console.log("Excel Export Error:", err);
    Alert.alert(
      "Excel Error",
      JSON.stringify(err)
    );
  } finally {
    setExcelLoading(false);
  }
};

  // PDF Export
  const generatePDF = async () => {
    const dataToExport = filteredCustomers.length > 0 ? filteredCustomers : customers;
    if (dataToExport.length === 0) { Alert.alert("No Data", "There are no customers to export."); return; }
    try {
      setPdfLoading(true);
      const now = new Date();
      const dateStr = now.toLocaleDateString("en-IN");
      const timeStr = now.toLocaleTimeString("en-IN");
      const filterLabel = searchText.trim() ? `Filter: ${searchField} = "${searchText}"` : "Showing: All Customers";
      const tableRows = dataToExport.map((item, index) => `
        <tr class="${index % 2 === 0 ? "even" : "odd"}">
          <td class="center">${index + 1}</td>
          <td>${item.customerName || "-"}</td>
          <td class="center">${item.mobileNo || "-"}</td>
          <td>${item.area || "-"}</td>
          <td>${[item.address1, item.address2, item.address3].filter((v) => v && v !== "-").join(", ") || "-"}</td>
          <td>${item.city || "-"}</td>
          <td>${item.state || "-"}</td>
          <td class="center">${item.pinCode || "-"}</td>
          <td>${item.acName || "-"}</td>
        </tr>`).join("");
      const htmlContent = `<!DOCTYPE html><html><head><meta charset="UTF-8"/><style>*{margin:0;padding:0;box-sizing:border-box;}body{font-family:Arial,sans-serif;font-size:11px;padding:20px;}.header{text-align:center;margin-bottom:20px;padding-bottom:10px;border-bottom:2px solid #F97316;}.header h1{font-size:20px;color:#F97316;margin-bottom:5px;}.info-row{display:flex;justify-content:space-between;margin-bottom:15px;}table{width:100%;border-collapse:collapse;margin-bottom:15px;}thead tr{background-color:#F97316;color:#fff;}th{padding:8px 6px;text-align:left;font-size:10px;font-weight:bold;border:1px solid #fff;}td{padding:6px;border:1px solid #e0e0e0;font-size:9px;}tbody tr.even{background-color:#fff;}tbody tr.odd{background-color:#FFF8F3;}.center{text-align:center;}.footer{text-align:center;font-size:9px;color:#999;margin-top:15px;}</style></head><body><div class="header"><h1>Customer List Report</h1><div>Generated on ${dateStr} at ${timeStr}</div></div><div class="info-row"><span>${filterLabel}</span><span>Total Records: ${dataToExport.length}</span></div><table><thead><tr><th class="center">S.No</th><th>Customer Name</th><th class="center">Mobile</th><th>Area</th><th>Address</th><th>City</th><th>State</th><th class="center">Pin Code</th><th>Created By</th></tr></thead><tbody>${tableRows}</tbody></table><div class="footer">Auto-generated report</div></body></html>`;
      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      await Sharing.shareAsync(uri);
    } catch (err) {
      Alert.alert("Error", "Failed to generate PDF");
    } finally {
      setPdfLoading(false);
    }
  };

  const renderItem = ({ item, index }) => (
    <View style={[styles.row, index % 2 === 0 ? styles.rowEven : styles.rowOdd]}>
      <View style={styles.cellAction}>
        <TouchableOpacity onPress={() => openEdit(item)} style={styles.actionBtn}>
          <MaterialIcons name="edit" size={16} color="#F97316" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(item)} style={styles.actionBtn}>
          <MaterialIcons name="delete" size={16} color="#e53935" />
        </TouchableOpacity>
      </View>
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
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFF3E0" }} edges={["top", "left", "right"]}>
    <LinearGradient colors={["#FFF3E0", "#FFFFFF"]} style={styles.container}>

      {/* ── Edit Modal ── */}
      <Modal visible={editVisible} transparent animationType="fade" onRequestClose={() => setEditVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Customer</Text>
              <TouchableOpacity onPress={() => setEditVisible(false)}>
                <MaterialIcons name="close" size={22} color="#fff" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody} keyboardShouldPersistTaps="handled">
              {[
                { label: "Customer Name *", key: "customerName" },
                { label: "Mobile No", key: "mobileNo", keyboardType: "phone-pad" },
                { label: "Alternate Mobile", key: "mobileNo1", keyboardType: "phone-pad" },
                { label: "Email ID", key: "emailID", keyboardType: "email-address" },
                { label: "Area", key: "area" },
                { label: "Address", key: "address1" },
                { label: "City", key: "city" },
                { label: "State", key: "state" },
                { label: "Pin Code", key: "pinCode", keyboardType: "numeric" },
              ].map(({ label, key, keyboardType }) => (
                <View key={key} style={styles.modalField}>
                  <Text style={styles.modalLabel}>{label}</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={editForm[key]}
                    onChangeText={(v) => setEditForm(f => ({ ...f, [key]: v }))}
                    keyboardType={keyboardType || "default"}
                    placeholderTextColor="#aaa"
                    placeholder={label}
                  />
                </View>
              ))}
            </ScrollView>
            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setEditVisible(false)}>
                <Text style={styles.modalCancelTxt}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSaveBtn} onPress={() => { console.log("Update btn pressed"); handleUpdate(); }} disabled={editLoading}>
                {editLoading
                  ? <ActivityIndicator size="small" color="#fff" />
                  : <Text style={styles.modalSaveTxt}>Update</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── Custom Date Picker Modal ── */}
      <CustomDatePicker
        visible={pickerVisible}
        onClose={() => setPickerVisible(false)}
        onSelectDate={handlePickerSelect}
        title={pickerTarget === "from" ? "Select From Date" : "Select To Date"}
        selectedDate={pickerTarget === "from" ? fromDate : toDate}
      />

      <View style={styles.searchSection}>
        {/* Export Buttons */}
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

        {/* Search */}
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

        {/* Filter Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          <View style={styles.filterContainer}>
            {[
              { value: "name", label: "Name", icon: "person" },
              { value: "mobile", label: "Mobile", icon: "phone" },
              { value: "area", label: "Area", icon: "place" },
              { value: "city", label: "City", icon: "location-city" },
              { value: "pincode", label: "Pin Code", icon: "pin-drop" },
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

        {/* ── Date Range Row with Picker Buttons ── */}
        <View style={styles.dateRow}>
          {/* From Date */}
          <TouchableOpacity style={styles.datePickerBtn} onPress={() => openPicker("from")}>
            <MaterialIcons name="date-range" size={16} color="#F97316" />
            <Text style={[styles.datePickerText, !fromDate && styles.datePickerPlaceholder]}>
              {fromDate || "From Date"}
            </Text>
            {fromDate && (
              <TouchableOpacity onPress={(e) => { e.stopPropagation(); setFromDate(null); }} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <MaterialIcons name="close" size={14} color="#999" />
              </TouchableOpacity>
            )}
          </TouchableOpacity>

          <Text style={styles.dateSeparator}>→</Text>

          {/* To Date */}
          <TouchableOpacity style={styles.datePickerBtn} onPress={() => openPicker("to")}>
            <MaterialIcons name="date-range" size={16} color="#F97316" />
            <Text style={[styles.datePickerText, !toDate && styles.datePickerPlaceholder]}>
              {toDate || "To Date"}
            </Text>
            {toDate && (
              <TouchableOpacity onPress={(e) => { e.stopPropagation(); setToDate(null); }} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <MaterialIcons name="close" size={14} color="#999" />
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        </View>

        {/* Total */}
        <View style={styles.totalContainer}>
          <Text style={styles.totalText}>
            Total Customers: {(filteredCustomers.length > 0 ? filteredCustomers : customers).length}
          </Text>
        </View>
      </View>

      {/* Table */}
      <View style={styles.tableWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={true}>
          <View style={styles.tableContainer}>
            <View style={styles.tableHeader}>
              <View style={styles.cellAction}><Text style={styles.headerText}>Action</Text></View>
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
    </SafeAreaView>
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

  // Date picker button row
  dateRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 },
  datePickerBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: "#F97316",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 9,
    backgroundColor: "#FFF8F3",
  },
  datePickerText: { flex: 1, fontSize: 12, color: "#333", fontWeight: "600" },
  datePickerPlaceholder: { color: "#aaa", fontWeight: "400" },
  dateSeparator: { fontSize: 16, color: "#F97316", fontWeight: "bold" },

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
  cellAction: { width: 80, alignItems: "center", justifyContent: "center",flexDirection: "row", gap: 10 },
  actionBtn: { padding: 5 },

  // Edit Modal
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", paddingHorizontal: 16 },
  modalCard: { backgroundColor: "#fff", borderRadius: 20, maxHeight: "85%" },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "#F97316", paddingHorizontal: 16, paddingVertical: 14, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  modalTitle: { fontSize: 16, fontWeight: "700", color: "#fff" },
  modalBody: { padding: 16 },
  modalField: { marginBottom: 14 },
  modalLabel: { fontSize: 12, fontWeight: "600", color: "#555", marginBottom: 5 },
  modalInput: { borderWidth: 1, borderColor: "#e0e0e0", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 9, fontSize: 14, color: "#333", backgroundColor: "#f8f9fa" },
  modalFooter: { flexDirection: "row", gap: 10, padding: 16, borderTopWidth: 1, borderTopColor: "#f0f0f0" },
  modalCancelBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, borderWidth: 1, borderColor: "#e0e0e0", alignItems: "center" },
  modalCancelTxt: { color: "#666", fontWeight: "600" },
  modalSaveBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, backgroundColor: "#F97316", alignItems: "center" },
  modalSaveTxt: { color: "#fff", fontWeight: "700" },

  emptyContainer: { padding: 50, alignItems: "center" },
  emptyText: { fontSize: 16, color: "#999", marginTop: 10 },
});