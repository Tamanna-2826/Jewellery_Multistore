// migrations/YYYYMMDDHHMMSS-add-search-vector-to-products.js
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      ALTER TABLE "Products" ADD COLUMN search_vector tsvector;
      UPDATE "Products" SET search_vector = to_tsvector('english', product_name || ' ' || main_description || ' ' || basic_description);
      CREATE INDEX idx_products_search ON "Products" USING GIN (search_vector);
      CREATE EXTENSION IF NOT EXISTS pg_trgm;
      CREATE INDEX idx_products_name_trgm ON "Products" USING GIN (product_name gin_trgm_ops);
    `);
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      DROP INDEX idx_products_search;
      DROP INDEX idx_products_name_trgm;
      ALTER TABLE "Products" DROP COLUMN search_vector;
    `);
  }
};