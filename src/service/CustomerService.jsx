import { axiosInstance } from "../api/axiosInstance";

export const CustomerService = {
  // GET ALL CUSTOMERS
  getCustomers: async (
    filterKey = null,
    filter = null,
    fromDate = null,
    toDate = null,
  ) => {
    try {
      const params = {};
      if (filterKey) params.FILTERKEY = filterKey;
      if (filter) params.FILTER = filter;
      if (fromDate) params.FROMDATE = fromDate;
      if (toDate) params.TODATE = toDate;

      const response = await axiosInstance.get("/customer", { params });
      return response.data;
    } catch (error) {
      console.log("Get Customer Error:", error);
      if (error.response) return error.response.data;
      return { success: false, message: "Network Error", data: null };
    }
  },

  // SAVE CUSTOMER
  saveCustomer: async (customerData) => {
    try {
      console.log("Save Customer Response:", customerData);
      const response = await axiosInstance.post("/customer", customerData);

      console.log("Save Customer Response:", response.data);
      return response.data;
    } catch (error) {
      console.log("Save Customer Error:", error);

      if (error.response) {
        return error.response.data;
      }

      return {
        success: false,
        message: "Network Error",
        data: null,
      };
    }
  },

  // DASHBOARD
  getDashboard: async () => {
    try {
      const response = await axiosInstance.get("customer/dashboard");
      return response.data;
    } catch (error) {
      if (error.response) return error.response.data;
      return { success: false, message: "Network Error", data: null };
    }
  },

  // UPDATE CUSTOMER BY ID
  updateCustomer: async (id, customerData) => {
    try {
      const response = await axiosInstance.put(`/customer/${id}`, customerData);
      return response.data;
    } catch (error) {
      if (error.response) return error.response.data;
      return { success: false, message: "Network Error", data: null };
    }
  },

  // DELETE CUSTOMER BY ID
  deleteCustomer: async (id) => {
    try {
      const response = await axiosInstance.delete(`/customer/${id}`);
      return response.data;
    } catch (error) {
      if (error.response) return error.response.data;
      return { success: false, message: "Network Error", data: null };
    }
  },

  // GET CUSTOMER BY SNO
  getCustomerById: async (sno) => {
    try {
      const response = await axiosInstance.get(`/customer/${sno}`);

      return response.data;
    } catch (error) {
      console.log("Get Customer By Id Error:", error);

      if (error.response) {
        return error.response.data;
      }

      return {
        success: false,
        message: "Network Error",
        data: null,
      };
    }
  },
};
