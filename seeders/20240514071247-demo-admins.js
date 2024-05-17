'use strict';
const bcrypt = require('bcryptjs');
require('dotenv').config(); 

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
    return queryInterface.bulkInsert('Admins', [{
      first_name: 'Admin',
      last_name: '',
      email: 'admin@example.com',
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date()
    }]);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Admins', null, {});
  }
};
