'use strict';

const indianCitiesData = [
  // Andaman and Nicobar Islands
  { city_name: 'Port Blair', state_id: 1, createdAt: new Date(), updatedAt: new Date() },

  // Andhra Pradesh
  { city_name: 'Visakhapatnam', state_id: 2, createdAt: new Date(), updatedAt: new Date() },
  { city_name: 'Vijayawada', state_id: 2, createdAt: new Date(), updatedAt: new Date() },
  { city_name: 'Guntur', state_id: 2, createdAt: new Date(), updatedAt: new Date() },
  { city_name: 'Nellore', state_id: 2, createdAt: new Date(), updatedAt: new Date() },
  { city_name: 'Kurnool', state_id: 2, createdAt: new Date(), updatedAt: new Date() },
  { city_name: 'Rajahmundry', state_id: 2, createdAt: new Date(), updatedAt: new Date() },
  { city_name: 'Tirupati', state_id: 2, createdAt: new Date(), updatedAt: new Date() },

  // Arunachal Pradesh
  { city_name: 'Itanagar', state_id: 3, createdAt: new Date(), updatedAt: new Date() },
  { city_name: 'Naharlagun', state_id: 3, createdAt: new Date(), updatedAt: new Date() },

  // Assam
  { city_name: 'Guwahati', state_id: 4, createdAt: new Date(), updatedAt: new Date() },
  { city_name: 'Silchar', state_id: 4, createdAt: new Date(), updatedAt: new Date() },
  { city_name: 'Dibrugarh', state_id: 4, createdAt: new Date(), updatedAt: new Date() },
  { city_name: 'Jorhat', state_id: 4, createdAt: new Date(), updatedAt: new Date() },
  { city_name: 'Nagaon', state_id: 4, createdAt: new Date(), updatedAt: new Date() },
  { city_name: 'Tezpur', state_id: 4, createdAt: new Date(), updatedAt: new Date() },
  { city_name: 'Tinsukia', state_id: 4, createdAt: new Date(), updatedAt: new Date() },

  // Bihar
  { city_name: 'Patna', state_id: 5, createdAt: new Date(), updatedAt: new Date() },
  { city_name: 'Gaya', state_id: 5, createdAt: new Date(), updatedAt: new Date() },
  { city_name: 'Bhagalpur', state_id: 5, createdAt: new Date(), updatedAt: new Date() },
  { city_name: 'Muzaffarpur', state_id: 5, createdAt: new Date(), updatedAt: new Date() },
  { city_name: 'Purnia', state_id: 5, createdAt: new Date(), updatedAt: new Date() },
  { city_name: 'Darbhanga', state_id: 5, createdAt: new Date(), updatedAt: new Date() },
  { city_name: 'Ara', state_id: 5, createdAt: new Date(), updatedAt: new Date() },

  // Chandigarh
  { city_name: 'Chandigarh City', state_id: 6, createdAt: new Date(), updatedAt: new Date() },

  // Chhattisgarh
  { city_name: 'Raipur', state_id: 7, createdAt: new Date(), updatedAt: new Date() },
  { city_name: 'Bhilai', state_id: 7, createdAt: new Date(), updatedAt: new Date() },
  { city_name: 'Bilaspur', state_id: 7, createdAt: new Date(), updatedAt: new Date() },
  { city_name: 'Korba', state_id: 7, createdAt: new Date(), updatedAt: new Date() },
  { city_name: 'Durg', state_id: 7, createdAt: new Date(), updatedAt: new Date() },
  { city_name: 'Raigarh', state_id: 7, createdAt: new Date(), updatedAt: new Date() },
  { city_name: 'Jagdalpur', state_id: 7, createdAt: new Date(), updatedAt: new Date() },

  // Maharashtra
{ city_name: 'Mumbai', state_id: 22, createdAt: new Date(), updatedAt: new Date() },
{ city_name: 'Pune', state_id: 22, createdAt: new Date(), updatedAt: new Date() },
{ city_name: 'Nagpur', state_id: 22, createdAt: new Date(), updatedAt: new Date() },
{ city_name: 'Nashik', state_id: 22, createdAt: new Date(), updatedAt: new Date() },
{ city_name: 'Aurangabad', state_id: 22, createdAt: new Date(), updatedAt: new Date() },
{ city_name: 'Solapur', state_id: 22, createdAt: new Date(), updatedAt: new Date() },
{ city_name: 'Thane', state_id: 22, createdAt: new Date(), updatedAt: new Date() },

// Gujarat
{ city_name: 'Ahmedabad', state_id: 12, createdAt: new Date(), updatedAt: new Date() },
{ city_name: 'Surat', state_id: 12, createdAt: new Date(), updatedAt: new Date() },
{ city_name: 'Vadodara', state_id: 12, createdAt: new Date(), updatedAt: new Date() },
{ city_name: 'Rajkot', state_id: 12, createdAt: new Date(), updatedAt: new Date() },
{ city_name: 'Bhavnagar', state_id: 12, createdAt: new Date(), updatedAt: new Date() },
{ city_name: 'Jamnagar', state_id: 12, createdAt: new Date(), updatedAt: new Date() },
{ city_name: 'Junagadh', state_id: 12, createdAt: new Date(), updatedAt: new Date() },

 // Dadra and Nagar Haveli
 { city_name: 'Silvassa', state_id: 8, createdAt: new Date(), updatedAt: new Date() },
 { city_name: 'Khanvel', state_id: 8, createdAt: new Date(), updatedAt: new Date() },
 { city_name: 'Amli', state_id: 8, createdAt: new Date(), updatedAt: new Date() },
 { city_name: 'Naroli', state_id: 8, createdAt: new Date(), updatedAt: new Date() },
 { city_name: 'Sili', state_id: 8, createdAt: new Date(), updatedAt: new Date() },
 { city_name: 'Rakholi', state_id: 8, createdAt: new Date(), updatedAt: new Date() },
 { city_name: 'Saily', state_id: 8, createdAt: new Date(), updatedAt: new Date() },
 { city_name: 'Dudhani', state_id: 8, createdAt: new Date(), updatedAt: new Date() },
 { city_name: 'Vasona', state_id: 8, createdAt: new Date(), updatedAt: new Date() },
 { city_name: 'Selwada', state_id: 8, createdAt: new Date(), updatedAt: new Date() },
 
 //daman and Diu
 { city_name: 'Daman', state_id: 9, createdAt: new Date(), updatedAt: new Date() },
 { city_name: 'Diu', state_id: 9, createdAt: new Date(), updatedAt: new Date() },
 
 //Delhi
 { city_name: 'New Delhi', state_id: 10, createdAt: new Date(), updatedAt: new Date() },
 { city_name: 'Delhi Cantonment', state_id: 10, createdAt: new Date(), updatedAt: new Date() },
 { city_name: 'Narela', state_id: 10, createdAt: new Date(), updatedAt: new Date() },
 { city_name: 'Saket', state_id: 10, createdAt: new Date(), updatedAt: new Date() },
 { city_name: 'Dwarka', state_id: 10, createdAt: new Date(), updatedAt: new Date() },
 { city_name: 'Rohini', state_id: 10, createdAt: new Date(), updatedAt: new Date() },
 { city_name: 'Pitampura', state_id: 10, createdAt: new Date(), updatedAt: new Date() },
 { city_name: 'Mayur Vihar', state_id: 10, createdAt: new Date(), updatedAt: new Date() },
 { city_name: 'Karol Bagh', state_id: 10, createdAt: new Date(), updatedAt: new Date() },
 { city_name: 'Chandni Chowk', state_id: 10, createdAt: new Date(), updatedAt: new Date() },
 
 //Goa
 { city_name: 'Panaji', state_id: 11, createdAt: new Date(), updatedAt: new Date() },
 { city_name: 'Margao', state_id: 11, createdAt: new Date(), updatedAt: new Date() },
 { city_name: 'Vasco da Gama', state_id: 11, createdAt: new Date(), updatedAt: new Date() },
 { city_name: 'Mapusa', state_id: 11, createdAt: new Date(), updatedAt: new Date() },
 { city_name: 'Ponda', state_id: 11, createdAt: new Date(), updatedAt: new Date() },
 { city_name: 'Bicholim', state_id: 11, createdAt: new Date(), updatedAt: new Date() },
 { city_name: 'Curchorem', state_id: 11, createdAt: new Date(), updatedAt: new Date() },
 { city_name: 'Cuncolim', state_id: 11, createdAt: new Date(), updatedAt: new Date() },
 { city_name: 'Sanguem', state_id: 11, createdAt: new Date(), updatedAt: new Date() },
 { city_name: 'Valpoi', state_id: 11, createdAt: new Date(), updatedAt: new Date() },
 { city_name: 'Quepem', state_id: 11, createdAt: new Date(), updatedAt: new Date() },
 { city_name: 'Canacona', state_id: 11, createdAt: new Date(), updatedAt: new Date() },


  // Add more cities for other states as per your requirement
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('cities', indianCitiesData, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('cities', null, {});
  }
};
