// services/LocationService.js
import axios from 'axios';

const PINCODE_API_BASE = 'https://api.postalpincode.in/pincode';

export const LocationService = {
  // Fetch location details by PIN code
  fetchLocationByPincode: async (pincode) => {
    try {
      if (!pincode || pincode.length !== 6 || !/^\d+$/.test(pincode)) {
        return { success: false, message: 'Invalid PIN code' };
      }

      const response = await axios.get(`${PINCODE_API_BASE}/${pincode}`);
      
      if (response.data && response.data[0]) {
        const result = response.data[0];
        
        if (result.Status === 'Success' && result.PostOffice && result.PostOffice.length > 0) {
          // Process the post offices data
          const locations = result.PostOffice.map(office => ({
            uniqueId: `${office.Pincode}-${office.Name.replace(/\s/g, '')}`,
            area: office.Name,
            city: office.District,
            state: office.State,
            pincode: office.Pincode,
            country: office.Country,
            branchType: office.BranchType,
            deliveryStatus: office.DeliveryStatus,
            circle: office.Circle,
            division: office.Division,
            region: office.Region,
            block: office.Block,
            taluk: office.Taluk
          }));
          
          return {
            success: true,
            locations: locations,
            message: 'Locations found'
          };
        } else {
          return {
            success: false,
            message: result.Message || 'No locations found for this PIN code'
          };
        }
      } else {
        return { success: false, message: 'Invalid response from API' };
      }
    } catch (error) {
      console.error('PIN code API error:', error);
      return { 
        success: false, 
        message: 'Failed to fetch location details. Please check your internet connection.'
      };
    }
  },

  // Validate PIN code format
  validatePincode: (pincode) => {
    const pincodeRegex = /^[1-9][0-9]{5}$/;
    return pincodeRegex.test(pincode);
  },

  // Get unique ID for location
  generateUniqueId: (location) => {
    return `${location.pincode}-${location.area.replace(/\s/g, '')}-${Date.now()}`;
  }
};