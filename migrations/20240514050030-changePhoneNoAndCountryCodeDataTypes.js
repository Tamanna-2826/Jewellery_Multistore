'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Users', 'phone_no', {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        notNull: true,
        is: /^\d{10}$/,
      },
    });

    await queryInterface.changeColumn('Users', 'country_code', {
      type: Sequelize.STRING,
      defaultValue: '91',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Users', 'phone_no', {
      type: Sequelize.INTEGER,
      allowNull: false,
      validate: {
        notNull: true,
        is: /^\d{10}$/,
      },
    });

    await queryInterface.changeColumn('Users', 'country_code', {
      type: Sequelize.INTEGER,
      defaultValue: '91',
    });
  }
};