import { axiosInstance } from "../api/axiosInstance";

export const CityService = {

  getCities: async () => {
    try {

      const response = await axiosInstance.get("/city");

      return response.data;

    } catch (error) {

      console.log("City Fetch Error", error);

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


  saveCity: async (cityData) => {
    try {

      const response = await axiosInstance.post("/city", cityData);

      return response.data;

    } catch (error) {

      console.log("City Save Error", error);

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