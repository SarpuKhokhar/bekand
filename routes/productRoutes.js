const express = require('express');
const router = express.Router();
const {
  addProduct,
  getProducts,
  deleteProduct,
  updateProduct
} = require('../controllers/productController');
const upload = require('../middleware/multer');

// Routes
router.post('/products', upload.array('images', 5), addProduct); // Allow up to 5 images
router.get('/products', getProducts);
router.delete('/products/:id', deleteProduct);
router.put('/products/:id', upload.array('images', 5), updateProduct);

module.exports = router;