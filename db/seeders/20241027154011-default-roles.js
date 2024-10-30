
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('role', [{
      name: 'Tester',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: 'Admin',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: 'User',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]);
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('role', {name: 'Tester'}, {});
  }
};
