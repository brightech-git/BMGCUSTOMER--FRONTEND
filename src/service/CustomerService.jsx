import { axiosInstance } from "../api/axiosInstance";



export const CustomerService = {

  // GET ALL CUSTOMERS
 getCustomers: async (filterKey = null, filter = null) => {
  try {
    const params = {};
    if (filterKey) params.FILTERKEY = filterKey;
    if (filter) params.FILTER = filter;

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
console.log("Save Customer Response:",customerData);  
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
        data: null
      };
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
        data: null
      };
    }
  }

};