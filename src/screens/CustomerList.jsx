

// screens/CustomerList.js
import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  Alert,
  ScrollView,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { CustomerService } from "../service/CustomerService";

const { width, height } = Dimensions.get("window");

const FILTER_KEY_MAP = {
  name: "N",
  mobile: "M",
  city: "C",
  createdby: "U",
  all: null,
};

export default function CustomerList() {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [inputText, setInputText] = useState("");
  // ✅ Default is now "name" instead of "all"
  const [searchField, setSearchField] = useState("name");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const ITEMS_PER_PAGE = 10;

  const loadCustomers = useCallback(async (field, text) => {
    try {
      setLoading(true);
      const filterKey = FILTER_KEY_MAP[field];
      const filter = (text || "").trim() || null;
      const res = await CustomerService.getCustomers(filterKey, filter);
      if (res && res.success && Array.isArray(res.data)) {
        setCustomers(res.data);
        setFilteredCustomers(res.data);
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

  // ✅ Initial load uses "name" as default field
  useEffect(() => {
    loadCustomers("name", "");
  }, []);

  const handleSearch = () => {
    setCurrentPage(1);
    loadCustomers(searchField, inputText);
  };

  const clearSearch = () => {
    setInputText("");
    // ✅ Reset back to "name" instead of "all"
    setSearchField("name");
    setCurrentPage(1);
    loadCustomers("name", "");
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });

    const sorted = [...filteredCustomers].sort((a, b) => {
      let aValue = a[key] || "";
      let bValue = b[key] || "";

      if (key === "sno") {
        aValue = parseInt(aValue);
        bValue = parseInt(bValue);
      } else {
        aValue = aValue.toString().toLowerCase();
        bValue = bValue.toString().toLowerCase();
      }

      if (direction === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredCustomers(sorted);
  };

  // ─── PDF Export ────────────────────────────────────────────────────────────
  const generatePDF = async () => {
    if (filteredCustomers.length === 0) {
      Alert.alert("No Data", "There are no customers to export.");
      return;
    }

    try {
      setPdfLoading(true);

      const now = new Date();
      const dateStr = now.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
      const timeStr = now.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      });

      const filterLabel =
        searchField !== "all" && inputText.trim()
          ? `Filter: <strong>${searchField.charAt(0).toUpperCase() + searchField.slice(1)}</strong> = "${inputText.trim()}"`
          : "Showing: <strong>All Customers</strong>";

      const tableRows = filteredCustomers
        .map(
          (item, index) => `
          <tr class="${index % 2 === 0 ? "even" : "odd"}">
            <td class="center">${index + 1}</td>
            <td>${item.pname || "-"}</td>
            <td class="center">${item.mobile || "-"}</td>
            <td>${item.city || "-"}</td>
            <td>${item.acname || "-"}</td>
          </tr>`
        )
        .join("");

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8" />
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: Arial, Helvetica, sans-serif;
              font-size: 12px;
              color: #333;
              padding: 24px;
            }
            .header {
              background: linear-gradient(135deg, #F97316, #FB923C);
              color: #fff;
              padding: 18px 22px;
              border-radius: 10px;
              margin-bottom: 16px;
            }
            .header h1 {
              font-size: 22px;
              font-weight: bold;
              margin-bottom: 4px;
            }
            .header .meta {
              font-size: 11px;
              opacity: 0.9;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 14px;
              font-size: 11px;
              color: #555;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 1px 4px rgba(0,0,0,0.08);
            }
            thead tr { background-color: #F97316; color: #fff; }
            thead th {
              padding: 10px 12px;
              text-align: left;
              font-size: 12px;
              font-weight: bold;
              border-right: 1px solid rgba(255,255,255,0.3);
            }
            thead th:last-child { border-right: none; }
            thead th.center { text-align: center; }
            tbody tr.even { background-color: #fff; }
            tbody tr.odd  { background-color: #FFF8F3; }
            tbody td {
              padding: 8px 12px;
              border-bottom: 1px solid #e8e8e8;
              border-right: 1px solid #e8e8e8;
              font-size: 11px;
              color: #444;
            }
            tbody td:last-child { border-right: none; }
            tbody td.center { text-align: center; }
            .footer {
              margin-top: 18px;
              text-align: center;
              font-size: 10px;
              color: #aaa;
            }
            .total-badge {
              display: inline-block;
              background: #FFF3E0;
              color: #F97316;
              border: 1px solid #F97316;
              border-radius: 20px;
              padding: 3px 12px;
              font-size: 11px;
              font-weight: bold;
            }
          </style>
        </head>
        <body>
          <div class="meta">Generated on ${dateStr} at ${timeStr}</div>

          <div class="info-row">
            <span>${filterLabel}</span>
            <span class="total-badge">Total Records: ${filteredCustomers.length}</span>
          </div>

          <table>
            <thead>
              <tr>
                <th class="center" style="width:50px">S.No</th>
                <th style="width:28%">Customer Name</th>
                <th class="center" style="width:18%">Mobile</th>
                <th style="width:20%">City</th>
                <th style="width:22%">Created By</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>

          <div class="footer">
            This report was auto-generated &bull; ${filteredCustomers.length} record(s) exported
          </div>
        </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html: htmlContent });

      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(uri, {
          mimeType: "application/pdf",
          dialogTitle: "Export Customer List",
          UTI: "com.adobe.pdf",
        });
      } else {
        Alert.alert("Saved", `PDF saved to:\n${uri}`);
      }
    } catch (err) {
      console.log("PDF Error:", err);
      Alert.alert("Error", "Failed to generate PDF. Please try again.");
    } finally {
      setPdfLoading(false);
    }
  };
  // ───────────────────────────────────────────────────────────────────────────

  const totalPages = Math.ceil(filteredCustomers.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentData = filteredCustomers.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const renderItem = ({ item, index }) => (
    <View
      style={[
        styles.tableRow,
        index % 2 === 0 ? styles.tableRowEven : styles.tableRowOdd,
      ]}
    >
      <View style={[styles.cell, styles.snoCell]}>
        <Text style={styles.cellText}>{startIndex + index + 1}</Text>
      </View>
      <View style={[styles.cell, styles.nameCell]}>
        <Text style={styles.cellText} numberOfLines={1}>
          {item.pname || "-"}
        </Text>
      </View>
      <View style={[styles.cell, styles.mobileCell]}>
        <Text style={styles.cellText}>{item.mobile || "-"}</Text>
      </View>
      <View style={[styles.cell, styles.cityCell]}>
        <Text style={styles.cellText} numberOfLines={1}>
          {item.city || "-"}
        </Text>
      </View>
      <View style={[styles.cell, styles.createdByCell]}>
        <Text style={styles.cellText} numberOfLines={1}>
          {item.acname || "-"}
        </Text>
      </View>
    </View>
  );

  const SortIcon = ({ colKey }) => {
    if (sortConfig.key !== colKey) {
      return (
        <MaterialIcons name="unfold-more" size={14} color="rgba(255,255,255,0.6)" />
      );
    }
    return (
      <MaterialIcons
        name={sortConfig.direction === "asc" ? "arrow-upward" : "arrow-downward"}
        size={14}
        color="#fff"
      />
    );
  };

  const renderHeader = () => (
    <View style={styles.tableHeader}>
      {[
        { key: "sno",    label: "S.No",          style: styles.snoCell },
        { key: "pname",  label: "Customer Name",  style: styles.nameCell },
        { key: "mobile", label: "Mobile",         style: styles.mobileCell },
        { key: "city",   label: "City",           style: styles.cityCell },
        { key: "acname", label: "Created By",     style: styles.createdByCell },
      ].map((col) => (
        <View key={col.key} style={[styles.headerCell, col.style]}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => handleSort(col.key)}
            activeOpacity={0.7}
          >
            <Text style={styles.headerText}>{col.label}</Text>
            <SortIcon colKey={col.key} />
          </TouchableOpacity>
        </View>
      ))}
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

      {/* Header */}
      <View style={styles.headerSection}>
        <LinearGradient
          colors={["#F97316", "#FB923C"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.pageHeader}
        >

          <View style={styles.headerBottomRow}>
            <Text style={styles.headerSubtitle}>
              Total Records: {filteredCustomers.length}
            </Text>

            {/* ── PDF Export Button ── */}
            <TouchableOpacity
              style={styles.pdfButton}
              onPress={generatePDF}
              activeOpacity={0.8}
              disabled={pdfLoading}
            >
              {pdfLoading ? (
                <ActivityIndicator size="small" color="#F97316" />
              ) : (
                <>
                  <MaterialIcons name="picture-as-pdf" size={18} color="#F97316" />
                  <Text style={styles.pdfButtonText}>Export PDF</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>

      {/* Search & Filter */}
      <View style={styles.searchSection}>
        <View style={styles.searchInputContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search customers..."
            placeholderTextColor="#999"
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {inputText !== "" && (
            <TouchableOpacity onPress={clearSearch} style={styles.clearBtn}>
              <MaterialIcons name="close" size={18} color="#999" />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.searchIconBtn}
            onPress={handleSearch}
            activeOpacity={0.8}
          >
            <MaterialIcons name="search" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* ✅ Filter Chips — switching allowed, deselecting (removing) NOT allowed */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScrollView}
        >
          <View style={styles.filterContainer}>
            {[
              { value: "name",      label: "Name",       icon: "person" },
              { value: "mobile",    label: "Mobile",     icon: "phone" },
              { value: "city",      label: "City",       icon: "location-city" },
              { value: "createdby", label: "Created By", icon: "person-add" },
            ].map((filter) => {
              const isActive = searchField === filter.value;
              return (
                <TouchableOpacity
                  key={filter.value}
                  style={[
                    styles.filterButton,
                    isActive && styles.filterButtonActive,
                  ]}
                  onPress={() => {
                    // ✅ If this chip is already active → do nothing (cannot remove)
                    // If a different chip → switch to it
                    if (!isActive) setSearchField(filter.value);
                  }}
                  // ✅ No ripple/press feedback on the already-active chip
                  activeOpacity={isActive ? 1 : 0.7}
                >
                  <MaterialIcons
                    name={filter.icon}
                    size={14}
                    color={isActive ? "#fff" : "#666"}
                  />
                  <Text
                    style={[
                      styles.filterText,
                      isActive && styles.filterTextActive,
                    ]}
                  >
                    {filter.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </View>

      {/* Table */}
      <View style={styles.tableWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={true}>
          <View style={styles.tableContainer}>
            {renderHeader()}
            <FlatList
              data={currentData}
              keyExtractor={(item, index) =>
                item.sno?.toString() || index.toString()
              }
              renderItem={renderItem}
              showsVerticalScrollIndicator={true}
              scrollEnabled={true}
              style={styles.tableList}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <MaterialIcons name="person-search" size={60} color="#ccc" />
                  <Text style={styles.emptyText}>No Customers Found</Text>
                  <Text style={styles.emptySubText}>
                    Try adjusting your search or filter
                  </Text>
                </View>
              }
            />
          </View>
        </ScrollView>
      </View>

      {/* Pagination */}
      {filteredCustomers.length > 0 && (
        <View style={styles.paginationSection}>
          <TouchableOpacity
            style={[
              styles.pageButton,
              currentPage === 1 && styles.pageButtonDisabled,
            ]}
            onPress={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            <MaterialIcons
              name="chevron-left"
              size={24}
              color={currentPage === 1 ? "#ccc" : "#F97316"}
            />
          </TouchableOpacity>

          <View style={styles.pageInfo}>
            <Text style={styles.pageText}>
              Page {currentPage} of {totalPages || 1}
            </Text>
            <Text style={styles.pageStatsText}>
              Showing {startIndex + 1} -{" "}
              {Math.min(startIndex + ITEMS_PER_PAGE, filteredCustomers.length)}{" "}
              of {filteredCustomers.length}
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.pageButton,
              currentPage === totalPages && styles.pageButtonDisabled,
            ]}
            onPress={() =>
              setCurrentPage((prev) => Math.min(totalPages, prev + 1))
            }
            disabled={currentPage === totalPages}
          >
            <MaterialIcons
              name="chevron-right"
              size={24}
              color={currentPage === totalPages ? "#ccc" : "#F97316"}
            />
          </TouchableOpacity>
        </View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF3E0",
  },
  loadingText: { marginTop: 10, fontSize: 14, color: "#F97316" },

  headerSection: { marginBottom: 5 },
  pageHeader: {
    padding: 20,
    paddingBottom: 15,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  headerTitle: { fontSize: 24, fontWeight: "bold", color: "#fff", marginLeft: 10 },
  headerBottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginLeft: 38,
  },
  headerSubtitle: { fontSize: 14, color: "rgba(255,255,255,0.9)" },

  pdfButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
    minWidth: 44,
    justifyContent: "center",
  },
  pdfButtonText: { color: "#F97316", fontSize: 12, fontWeight: "bold" },

  searchSection: {
    backgroundColor: "#fff",
    margin: 15,
    marginTop: 10,
    padding: 15,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 10,
    backgroundColor: "#f8f9fa",
    overflow: "hidden",
  },
  searchInput: { flex: 1, paddingVertical: 10, paddingHorizontal: 12, fontSize: 14, color: "#333" },
  clearBtn: { paddingHorizontal: 6, justifyContent: "center", alignItems: "center" },
  searchIconBtn: {
    backgroundColor: "#F97316",
    paddingHorizontal: 14,
    paddingVertical: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  filterScrollView: { marginTop: 12 },
  filterContainer: { flexDirection: "row", flexWrap: "nowrap" },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: "#f5f5f5",
  },
  filterButtonActive: { backgroundColor: "#F97316" },
  filterText: { fontSize: 12, color: "#666", marginLeft: 4 },
  filterTextActive: { color: "#fff" },

  tableWrapper: {
    flex: 1,
    marginHorizontal: 1,
    backgroundColor: "#fff",
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    overflow: "hidden",
  },
  tableContainer: { minWidth: width - 30, backgroundColor: "#fff" },
  tableList: { maxHeight: height - 350 },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#F97316",
    borderBottomWidth: 2,
    borderBottomColor: "#fff",
  },
  headerCell: {
    borderRightWidth: 1,
    borderRightColor: "rgba(255,255,255,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 5,
    width: "100%",
    gap: 4,
  },
  headerText: { color: "#fff", fontWeight: "bold", fontSize: 13 },
  tableRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#e0e0e0" },
  tableRowEven: { backgroundColor: "#fff" },
  tableRowOdd: { backgroundColor: "#FFF8F3" },
  cell: {
    borderRightWidth: 1,
    borderRightColor: "#e0e0e0",
    justifyContent: "center",
    paddingVertical: 7,
    paddingHorizontal: 8,
  },
  cellText: { fontSize: 12, color: "#555" },

  snoCell: { width: 50, alignItems: "center", justifyContent: "center" },
  nameCell: { width: 160 },
  mobileCell: { width: 110 },
  cityCell: { width: 130 },
  createdByCell: { width: 130, borderRightWidth: 0 },

  emptyContainer: { padding: 50, alignItems: "center", justifyContent: "center" },
  emptyText: { fontSize: 16, color: "#999", marginTop: 10, fontWeight: "500" },
  emptySubText: { fontSize: 12, color: "#ccc", marginTop: 5 },

  paginationSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 15,
    marginHorizontal: 15,
    marginVertical: 10,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  pageButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#F97316",
  },
  pageButtonDisabled: { borderColor: "#e0e0e0" },
  pageInfo: { alignItems: "center" },
  pageText: { fontSize: 14, fontWeight: "bold", color: "#333" },
  pageStatsText: { fontSize: 11, color: "#999", marginTop: 4 },
});