// @ts-nocheck
import React, { useEffect, useState, useCallback } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList,
  ActivityIndicator, Modal, ScrollView, RefreshControl, Alert, TextInput,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";
import { CustomerService } from "../../src/service/CustomerService";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

// ─── Mini Date Picker ─────────────────────────────────────────────────────────
function DatePicker({ visible, onClose, onSelect, title, selected }) {
  const today = new Date();
  const [yr, setYr] = useState(today.getFullYear());
  const [mo, setMo] = useState(today.getMonth());
  const [picked, setPicked] = useState(selected || null);

  useEffect(() => {
    if (visible) {
      const b = selected ? new Date(selected) : today;
      setYr(b.getFullYear()); setMo(b.getMonth()); setPicked(selected || null);
    }
  }, [visible]);

  const days = new Date(yr, mo + 1, 0).getDate();
  const firstDay = new Date(yr, mo, 1).getDay();
  const cells = [...Array(firstDay).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];

  const fmt = (d) => `${yr}-${String(mo + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  const isSelected = (d) => d && picked === fmt(d);
  const isToday = (d) => d && d === today.getDate() && mo === today.getMonth() && yr === today.getFullYear();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={dp.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity activeOpacity={1} style={dp.card}>
          <Text style={dp.title}>{title}</Text>
          <View style={dp.navRow}>
            <TouchableOpacity onPress={() => mo === 0 ? (setMo(11), setYr(y => y - 1)) : setMo(m => m - 1)}>
              <MaterialIcons name="chevron-left" size={26} color="#F97316" />
            </TouchableOpacity>
            <Text style={dp.navLabel}>{MONTHS[mo]} {yr}</Text>
            <TouchableOpacity onPress={() => mo === 11 ? (setMo(0), setYr(y => y + 1)) : setMo(m => m + 1)}>
              <MaterialIcons name="chevron-right" size={26} color="#F97316" />
            </TouchableOpacity>
          </View>
          <View style={dp.yearRow}>
            <TouchableOpacity style={dp.yearBtn} onPress={() => setYr(y => y - 1)}><Text style={dp.yearBtnTxt}>−</Text></TouchableOpacity>
            <Text style={dp.yearLbl}>{yr}</Text>
            <TouchableOpacity style={dp.yearBtn} onPress={() => setYr(y => y + 1)}><Text style={dp.yearBtnTxt}>+</Text></TouchableOpacity>
          </View>
          <View style={dp.weekRow}>
            {["Su","Mo","Tu","We","Th","Fr","Sa"].map(d => <Text key={d} style={dp.weekDay}>{d}</Text>)}
          </View>
          <View style={dp.grid}>
            {cells.map((d, i) => (
              <TouchableOpacity key={i} style={[dp.cell, isSelected(d) && dp.cellSel, isToday(d) && !isSelected(d) && dp.cellToday, !d && dp.cellEmpty]}
                onPress={() => d && setPicked(fmt(d))} disabled={!d}>
                <Text style={[dp.dayTxt, isSelected(d) && dp.dayTxtSel, isToday(d) && !isSelected(d) && dp.dayTxtToday]}>{d || ""}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {picked && <Text style={dp.selLbl}>Selected: {picked}</Text>}
          <View style={dp.actionRow}>
            <TouchableOpacity style={dp.cancelBtn} onPress={onClose}><Text style={dp.cancelTxt}>Cancel</Text></TouchableOpacity>
            <TouchableOpacity style={dp.confirmBtn} onPress={() => { if (picked) { onSelect(picked); onClose(); } }}>
              <Text style={dp.confirmTxt}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

// ─── Customer Detail Modal ────────────────────────────────────────────────────
function CustomerModal({ visible, onClose, customers, title, onRefresh }) {
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
        onRefresh();
      } else {
        Alert.alert("Error", res?.message || "Update failed.");
      }
    } catch { Alert.alert("Error", "Update failed."); }
    finally { setEditLoading(false); }
  };

  const handleDelete = (item) => {
    Alert.alert(
      "Delete Customer",
      `Are you sure you want to delete "${item.customerName}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete", style: "destructive",
          onPress: async () => {
            try {
              const res = await CustomerService.deleteCustomer(item.sno);
              if (res?.success) {
                Alert.alert("Deleted", "Customer deleted successfully.");
                onRefresh();
              } else {
                Alert.alert("Error", res?.message || "Delete failed.");
              }
            } catch { Alert.alert("Error", "Delete failed."); }
          },
        },
      ]
    );
  };

  const renderItem = ({ item, index }) => (
    <View style={[cm.row, index % 2 === 0 ? cm.rowEven : cm.rowOdd]}>
      <View style={cm.actionCell}>
        <TouchableOpacity onPress={() => openEdit(item)} style={cm.actionBtn}>
          <MaterialIcons name="edit" size={16} color="#F97316" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(item)} style={cm.actionBtn}>
          <MaterialIcons name="delete" size={16} color="#e53935" />
        </TouchableOpacity>
      </View>
      <Text style={[cm.cell, { flex: 1 }]} numberOfLines={1}>{item.customerName}</Text>
      <Text style={[cm.cell, { width: 105 }]}>{item.mobileNo}</Text>
      <Text style={[cm.cell, { width: 90 }]} numberOfLines={1}>{item.city}</Text>
    </View>
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={cm.overlay}>
        <View style={cm.card}>
          <View style={cm.header}>
            <Text style={cm.headerTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose}><MaterialIcons name="close" size={22} color="#fff" /></TouchableOpacity>
          </View>
          <View style={cm.tableHeader}>
            <Text style={[cm.headerCell, { width: 70 }]}>Action</Text>
            <Text style={[cm.headerCell, { flex: 1 }]}>Name</Text>
            <Text style={[cm.headerCell, { width: 105 }]}>Mobile</Text>
            <Text style={[cm.headerCell, { width: 90 }]}>City</Text>
          </View>
          <FlatList
            data={customers}
            keyExtractor={(item, i) => item.sno?.toString() || i.toString()}
            renderItem={renderItem}
            ListEmptyComponent={<Text style={cm.empty}>No records found</Text>}
          />
          <Text style={cm.footer}>Total: {customers.length}</Text>
        </View>
      </View>

      {/* Edit Modal */}
      <Modal visible={editVisible} transparent animationType="fade" onRequestClose={() => setEditVisible(false)}>
        <View style={cm.editOverlay}>
          <View style={cm.editCard}>
            <View style={cm.editHeader}>
              <Text style={cm.editTitle}>Edit Customer</Text>
              <TouchableOpacity onPress={() => setEditVisible(false)}>
                <MaterialIcons name="close" size={22} color="#fff" />
              </TouchableOpacity>
            </View>
            <ScrollView style={cm.editBody} keyboardShouldPersistTaps="handled">
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
                <View key={key} style={cm.editField}>
                  <Text style={cm.editLabel}>{label}</Text>
                  <TextInput
                    style={cm.editInput}
                    value={editForm[key]}
                    onChangeText={(v) => setEditForm(f => ({ ...f, [key]: v }))}
                    keyboardType={keyboardType || "default"}
                    placeholder={label}
                    placeholderTextColor="#aaa"
                  />
                </View>
              ))}
            </ScrollView>
            <View style={cm.editFooter}>
              <TouchableOpacity style={cm.cancelBtn} onPress={() => setEditVisible(false)}>
                <Text style={cm.cancelTxt}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={cm.saveBtn} onPress={handleUpdate} disabled={editLoading}>
                {editLoading
                  ? <ActivityIndicator size="small" color="#fff" />
                  : <Text style={cm.saveTxt}>Update</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </Modal>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function AdminHome() {
  const [dash, setDash] = useState({ TOTAL: 0, TODAY_ADD: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Date filter
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [pickerTarget, setPickerTarget] = useState(null);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [dateCount, setDateCount] = useState(null);
  const [dateLoading, setDateLoading] = useState(false);

  // Detail modal
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalData, setModalData] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);

  const loadDash = useCallback(async () => {
    try {
      const res = await CustomerService.getDashboard();
      if (res?.data) {
        setDash({
          TOTAL: res.data.TOTAL ?? 0,
          TODAY_ADD: res.data.TODAY_ADD ?? 0,
        });
      }
    } catch (e) {}
    finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadDash(); }, []);

  const onRefresh = () => { setRefreshing(true); loadDash(); };

  // Fetch date-range count when both dates set
  const fetchDateCount = useCallback(async (fd, td) => {
    if (!fd || !td) return;
    setDateLoading(true);
    try {
      const res = await CustomerService.getCustomers(null, null, fd, td);
      if (res?.success) setDateCount(Array.isArray(res.data) ? res.data.length : 0);
    } catch (_) {}
    finally { setDateLoading(false); }
  }, []);

  const handlePickerSelect = (dateStr) => {
    const newFrom = pickerTarget === "from" ? dateStr : fromDate;
    const newTo = pickerTarget === "to" ? dateStr : toDate;
    if (pickerTarget === "from") setFromDate(dateStr); else setToDate(dateStr);
    fetchDateCount(newFrom, newTo);
  };

  const [modalType, setModalType] = useState(null);

  const fetchModalData = useCallback(async (type, fd = fromDate, td = toDate) => {
    setModalLoading(true);
    let title = "";
    let res = null;
    if (type === "total") {
      title = "All Customers";
      res = await CustomerService.getCustomers();
    } else if (type === "today") {
      const todayStr = new Date().toISOString().split("T")[0];
      title = "Today's Customers";
      res = await CustomerService.getCustomers(null, null, todayStr, todayStr);
    } else if (type === "date" && fd && td) {
      title = `Customers: ${fd} → ${td}`;
      res = await CustomerService.getCustomers(null, null, fd, td);
    }
    setModalTitle(title);
    if (res?.success && Array.isArray(res.data)) {
      setModalData(res.data.map(item => ({
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
      })));
    } else {
      setModalData([]);
    }
    setModalLoading(false);
  }, [fromDate, toDate]);

  const openDetail = async (type) => {
    setModalType(type);
    setModalVisible(true);
    fetchModalData(type);
  };

  const today = new Date().toISOString().split("T")[0];

  if (loading) {
    return (
      <View style={s.loadingBox}>
        <ActivityIndicator size="large" color="#F97316" />
        <Text style={s.loadingTxt}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <LinearGradient colors={["#FFF3E0", "#FFFFFF"]} style={s.container}>
      <ScrollView
        contentContainerStyle={s.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#F97316"]} />}
      >
        {/* Header */}
        <View style={s.pageHeader}>
          <MaterialIcons name="dashboard" size={26} color="#F97316" />
          <Text style={s.pageTitle}>Dashboard</Text>
        </View>

        {/* Stat Cards */}
        <View style={s.cardRow}>
          {/* Total */}
          <TouchableOpacity style={[s.card, s.cardOrange]} onPress={() => openDetail("total")} activeOpacity={0.8}>
            <MaterialIcons name="people" size={32} color="#fff" />
            <Text style={s.cardCount}>{dash.TOTAL}</Text>
            <Text style={s.cardLabel}>Total Customers</Text>
            <View style={s.cardBadge}><Text style={s.cardBadgeTxt}>View All →</Text></View>
          </TouchableOpacity>

          {/* Today */}
          <TouchableOpacity style={[s.card, s.cardGreen]} onPress={() => openDetail("today")} activeOpacity={0.8}>
            <MaterialIcons name="person-add" size={32} color="#fff" />
            <Text style={s.cardCount}>{dash.TODAY_ADD}</Text>
            <Text style={s.cardLabel}>Today Added</Text>
            <View style={s.cardBadge}><Text style={s.cardBadgeTxt}>View →</Text></View>
          </TouchableOpacity>
        </View>

        {/* Date Range Filter Card */}
        <View style={s.filterCard}>
          <View style={s.filterCardHeader}>
            <MaterialIcons name="date-range" size={18} color="#F97316" />
            <Text style={s.filterCardTitle}>Filter by Date Range</Text>
          </View>

          <View style={s.dateRow}>
            <TouchableOpacity style={s.datePicker} onPress={() => { setPickerTarget("from"); setPickerVisible(true); }}>
              <MaterialIcons name="event" size={15} color="#F97316" />
              <Text style={[s.datePickerTxt, !fromDate && s.datePlaceholder]}>{fromDate || "From Date"}</Text>
              {fromDate && (
                <TouchableOpacity onPress={() => { setFromDate(null); setDateCount(null); }} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <MaterialIcons name="close" size={13} color="#999" />
                </TouchableOpacity>
              )}
            </TouchableOpacity>

            <Text style={s.arrow}>→</Text>

            <TouchableOpacity style={s.datePicker} onPress={() => { setPickerTarget("to"); setPickerVisible(true); }}>
              <MaterialIcons name="event" size={15} color="#F97316" />
              <Text style={[s.datePickerTxt, !toDate && s.datePlaceholder]}>{toDate || "To Date"}</Text>
              {toDate && (
                <TouchableOpacity onPress={() => { setToDate(null); setDateCount(null); }} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <MaterialIcons name="close" size={13} color="#999" />
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          </View>

          {/* Date Result Box */}
          {(fromDate && toDate) && (
            <TouchableOpacity style={s.dateResultBox} onPress={() => openDetail("date")} activeOpacity={0.8}>
              {dateLoading ? (
                <ActivityIndicator size="small" color="#F97316" />
              ) : (
                <>
                  <MaterialIcons name="filter-list" size={22} color="#F97316" />
                  <Text style={s.dateResultCount}>{dateCount ?? "—"}</Text>
                  <Text style={s.dateResultLabel}>Customers in range</Text>
                  <Text style={s.dateResultSub}>{fromDate} → {toDate}</Text>
                  <View style={s.cardBadge2}><Text style={s.cardBadgeTxt}>Tap to View →</Text></View>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* Date Picker Modal */}
      <DatePicker
        visible={pickerVisible}
        onClose={() => setPickerVisible(false)}
        onSelect={handlePickerSelect}
        title={pickerTarget === "from" ? "Select From Date" : "Select To Date"}
        selected={pickerTarget === "from" ? fromDate : toDate}
      />

      {/* Customer Detail Modal */}
      <CustomerModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        customers={modalLoading ? [] : modalData}
        title={modalLoading ? "Loading..." : modalTitle}
        onRefresh={() => fetchModalData(modalType)}
      />
    </LinearGradient>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 16, paddingBottom: 30 },
  loadingBox: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#FFF3E0" },
  loadingTxt: { marginTop: 10, color: "#F97316", fontSize: 14 },

  pageHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 20 },
  pageTitle: { fontSize: 22, fontWeight: "800", color: "#F97316" },

  cardRow: { flexDirection: "row", gap: 12, marginBottom: 16 },
  card: { flex: 1, borderRadius: 16, padding: 18, alignItems: "center", elevation: 4 },
  cardOrange: { backgroundColor: "#F97316" },
  cardGreen: { backgroundColor: "#4CAF50" },
  cardCount: { fontSize: 36, fontWeight: "900", color: "#fff", marginTop: 6 },
  cardLabel: { fontSize: 12, color: "rgba(255,255,255,0.9)", fontWeight: "600", marginTop: 4, textAlign: "center" },
  cardBadge: { marginTop: 10, backgroundColor: "rgba(255,255,255,0.25)", borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  cardBadge2: { marginTop: 8, backgroundColor: "#FFF3E0", borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  cardBadgeTxt: { fontSize: 11, color: "#fff", fontWeight: "700" },

  filterCard: { backgroundColor: "#fff", borderRadius: 16, padding: 16, elevation: 3 },
  filterCardHeader: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 12 },
  filterCardTitle: { fontSize: 15, fontWeight: "700", color: "#333" },

  dateRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  datePicker: { flex: 1, flexDirection: "row", alignItems: "center", gap: 6, borderWidth: 1, borderColor: "#F97316", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 9, backgroundColor: "#FFF8F3" },
  datePickerTxt: { flex: 1, fontSize: 12, color: "#333", fontWeight: "600" },
  datePlaceholder: { color: "#aaa", fontWeight: "400" },
  arrow: { fontSize: 16, color: "#F97316", fontWeight: "bold" },

  dateResultBox: { marginTop: 14, borderRadius: 14, borderWidth: 1.5, borderColor: "#F97316", backgroundColor: "#FFF8F3", padding: 16, alignItems: "center" },
  dateResultCount: { fontSize: 40, fontWeight: "900", color: "#F97316", marginTop: 4 },
  dateResultLabel: { fontSize: 13, color: "#555", fontWeight: "600" },
  dateResultSub: { fontSize: 11, color: "#999", marginTop: 2 },
});

// Customer Modal Styles
const cm = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  card: { backgroundColor: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: "80%", overflow: "hidden" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "#F97316", paddingHorizontal: 16, paddingVertical: 14 },
  headerTitle: { fontSize: 15, fontWeight: "700", color: "#fff" },
  tableHeader: { flexDirection: "row", backgroundColor: "#FFF3E0", paddingHorizontal: 12, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#f0f0f0" },
  headerCell: { fontSize: 11, fontWeight: "700", color: "#F97316" },
  row: { flexDirection: "row", paddingHorizontal: 12, paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: "#f5f5f5", alignItems: "center" },
  rowEven: { backgroundColor: "#fff" },
  rowOdd: { backgroundColor: "#FFF8F3" },
  cell: { fontSize: 12, color: "#444" },
  actionCell: { width: 70, flexDirection: "row", gap: 6, alignItems: "center" },
  actionBtn: { padding: 4 },
  empty: { textAlign: "center", padding: 30, color: "#999" },
  footer: { textAlign: "center", padding: 12, fontSize: 13, fontWeight: "700", color: "#F97316", borderTopWidth: 1, borderTopColor: "#f0f0f0" },

  // Edit modal
  editOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", paddingHorizontal: 16 },
  editCard: { backgroundColor: "#fff", borderRadius: 20, maxHeight: "85%" },
  editHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "#F97316", paddingHorizontal: 16, paddingVertical: 14, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  editTitle: { fontSize: 16, fontWeight: "700", color: "#fff" },
  editBody: { padding: 16 },
  editField: { marginBottom: 14 },
  editLabel: { fontSize: 12, fontWeight: "600", color: "#555", marginBottom: 5 },
  editInput: { borderWidth: 1, borderColor: "#e0e0e0", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 9, fontSize: 14, color: "#333", backgroundColor: "#f8f9fa" },
  editFooter: { flexDirection: "row", gap: 10, padding: 16, borderTopWidth: 1, borderTopColor: "#f0f0f0" },
  cancelBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, borderWidth: 1, borderColor: "#e0e0e0", alignItems: "center" },
  cancelTxt: { color: "#666", fontWeight: "600" },
  saveBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, backgroundColor: "#F97316", alignItems: "center" },
  saveTxt: { color: "#fff", fontWeight: "700" },
});

// Date Picker Styles
const dp = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "center", alignItems: "center" },
  card: { backgroundColor: "#fff", borderRadius: 18, padding: 20, width: 320, elevation: 10 },
  title: { fontSize: 15, fontWeight: "700", color: "#F97316", textAlign: "center", marginBottom: 12 },
  navRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 6 },
  navLabel: { fontSize: 15, fontWeight: "700", color: "#333" },
  yearRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 16, marginBottom: 12 },
  yearBtn: { backgroundColor: "#FFF3E0", borderRadius: 8, paddingHorizontal: 14, paddingVertical: 4, borderWidth: 1, borderColor: "#F97316" },
  yearBtnTxt: { fontSize: 18, color: "#F97316", fontWeight: "bold" },
  yearLbl: { fontSize: 15, fontWeight: "700", color: "#555", minWidth: 50, textAlign: "center" },
  weekRow: { flexDirection: "row", marginBottom: 4 },
  weekDay: { width: 40, textAlign: "center", fontSize: 11, fontWeight: "700", color: "#F97316" },
  grid: { flexDirection: "row", flexWrap: "wrap", marginBottom: 10 },
  cell: { width: 40, height: 36, justifyContent: "center", alignItems: "center", borderRadius: 8, marginBottom: 2 },
  cellEmpty: { opacity: 0 },
  cellSel: { backgroundColor: "#F97316" },
  cellToday: { borderWidth: 1.5, borderColor: "#F97316" },
  dayTxt: { fontSize: 13, color: "#333" },
  dayTxtSel: { color: "#fff", fontWeight: "700" },
  dayTxtToday: { color: "#F97316", fontWeight: "700" },
  selLbl: { textAlign: "center", fontSize: 13, color: "#F97316", fontWeight: "600", marginBottom: 12 },
  actionRow: { flexDirection: "row", gap: 10 },
  cancelBtn: { flex: 1, paddingVertical: 11, borderRadius: 10, borderWidth: 1, borderColor: "#e0e0e0", alignItems: "center" },
  cancelTxt: { color: "#666", fontWeight: "600" },
  confirmBtn: { flex: 1, paddingVertical: 11, borderRadius: 10, backgroundColor: "#F97316", alignItems: "center" },
  confirmTxt: { color: "#fff", fontWeight: "700" },
});
