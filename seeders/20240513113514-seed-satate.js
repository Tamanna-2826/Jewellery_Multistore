'use strict';

const indianStatesData = [
  { state_name: 'Andaman and Nicobar Islands', createdAt: new Date(), updatedAt: new Date() },
  { state_name: 'Andhra Pradesh', createdAt: new Date(), updatedAt: new Date() },
  { state_name: 'Arunachal Pradesh', createdAt: new Date(), updatedAt: new Date() },
  { state_name: 'Assam', createdAt: new Date(), updatedAt: new Date() },
  { state_name: 'Bihar', createdAt: new Date(), updatedAt: new Date() },
  { state_name: 'Chandigarh', createdAt: new Date(), updatedAt: new Date() },
  { state_name: 'Chhattisgarh', createdAt: new Date(), updatedAt: new Date() },
  { state_name: 'Dadra and Nagar Haveli', createdAt: new Date(), updatedAt: new Date() },
  { state_name: 'Daman and Diu', createdAt: new Date(), updatedAt: new Date() },
  { state_name: 'Delhi', createdAt: new Date(), updatedAt: new Date() },
  { state_name: 'Goa', createdAt: new Date(), updatedAt: new Date() },
  { state_name: 'Gujarat', createdAt: new Date(), updatedAt: new Date() },
  { state_name: 'Haryana', createdAt: new Date(), updatedAt: new Date() },
  { state_name: 'Himachal Pradesh', createdAt: new Date(), updatedAt: new Date() },
  { state_name: 'Jammu and Kashmir', createdAt: new Date(), updatedAt: new Date() },
  { state_name: 'Jharkhand', createdAt: new Date(), updatedAt: new Date() },
  { state_name: 'Karnataka', createdAt: new Date(), updatedAt: new Date() },
  { state_name: 'Kerala', createdAt: new Date(), updatedAt: new Date() },
  { state_name: 'Ladakh', createdAt: new Date(), updatedAt: new Date() },
  { state_name: 'Lakshadweep', createdAt: new Date(), updatedAt: new Date() },
  { state_name: 'Madhya Pradesh', createdAt: new Date(), updatedAt: new Date() },
  { state_name: 'Maharashtra', createdAt: new Date(), updatedAt: new Date() },
  { state_name: 'Manipur', createdAt: new Date(), updatedAt: new Date() },
  { state_name: 'Meghalaya', createdAt: new Date(), updatedAt: new Date() },
  { state_name: 'Mizoram', createdAt: new Date(), updatedAt: new Date() },
  { state_name: 'Nagaland', createdAt: new Date(), updatedAt: new Date() },
  { state_name: 'Odisha', createdAt: new Date(), updatedAt: new Date() },
  { state_name: 'Puducherry', createdAt: new Date(), updatedAt: new Date() },
  { state_name: 'Punjab', createdAt: new Date(), updatedAt: new Date() },
  { state_name: 'Rajasthan', createdAt: new Date(), updatedAt: new Date() },
  { state_name: 'Sikkim', createdAt: new Date(), updatedAt: new Date() },
  { state_name: 'Tamil Nadu', createdAt: new Date(), updatedAt: new Date() },
  { state_name: 'Telangana', createdAt: new Date(), updatedAt: new Date() },
  { state_name: 'Tripura', createdAt: new Date(), updatedAt: new Date() },
  { state_name: 'Uttar Pradesh', createdAt: new Date(), updatedAt: new Date() },
  { state_name: 'Uttarakhand', createdAt: new Date(), updatedAt: new Date() },
  { state_name: 'West Bengal', createdAt: new Date(), updatedAt: new Date() },
];



/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('states', indianStatesData, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('states', null, {});
  }
};
