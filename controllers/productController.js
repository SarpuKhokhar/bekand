const Product = require('../models/Product');

// Add Product
exports.addProduct = async (req, res) => {
  try {
    const {
      name, price, description, category, brand, stock, discountPercentage
    } = req.body;

    // Validate required fields
    if (!name || !price || !category || !brand || !stock) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Handle image uploads
    const images = req.files ? req.files.map(file => ({
      url: `/uploads/${file.filename}`,
      alt: req.body.altText || 'Product Image'
    })) : [];

    const newProduct = new Product({
      name,
      price,
      description,
      category,
      brand,
      stock,
      discountPercentage,
      images
    });

    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get All Products
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find().populate('reviews.user', 'name email');
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete Product
exports.deleteProduct = async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ msg: 'Product not found' });
    res.json({ msg: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update Product
exports.updateProduct = async (req, res) => {
  try {
    const {
      name, price, description, category, brand, stock, discountPercentage
    } = req.body;

    // Handle image uploads (append new images, keep existing if not replaced)
    let images = req.body.existingImages ? JSON.parse(req.body.existingImages) : [];
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => ({
        url: `/uploads/${file.filename}`,
        alt: req.body.altText || 'Product Image'
      }));
      images = [...images, ...newImages];
    }

    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name,
        price,
        description,
        category,
        brand,
        stock,
        discountPercentage,
        images,
        updatedAt: Date.now()
      },
      { new: true }
    );

    if (!updated) return res.status(404).json({ msg: 'Product not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};