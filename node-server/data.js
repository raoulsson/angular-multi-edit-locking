const students = require('./db-students.json');
const products = require('./db-products.json');

module.exports = () => ({
  students: students,
  products: products
});
