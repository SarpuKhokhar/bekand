const express = require('express');
const router = express.Router();
const {
  addProduct,
  getProducts,
  deleteProduct,
  updateProduct
} = require('../controllers/productController');

router.post('/products', addProduct);
router.get('/products', getProducts);
router.delete('/products/:id', deleteProduct);
router.put('/products/:id', updateProduct);

module.exports = router;
