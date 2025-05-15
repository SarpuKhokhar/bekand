// routes/productRoutes.js
const express = require('express');
const router = express.Router();
const {
  addProduct,
  getProducts,
  deleteProduct,
  updateProduct,
} = require('../controllers/productController');
const upload = require('../middleware/multer');
const { verifyToken } = require('../middleware/auth');

// Routes
router.post('/products', verifyToken, upload.array('images', 5), addProduct); // Protected
router.get('/products', getProducts); // Public
router.delete('/products/:id', verifyToken, deleteProduct); // Protected
router.put('/products/:id', verifyToken, upload.array('images', 5), updateProduct); // Protected

module.exports = router;