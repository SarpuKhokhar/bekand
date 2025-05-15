const Product = require('../models/Product');
const mongoose = require('mongoose');

exports.addProduct = async (req, res) => {
  try {
    const {
      name,
      price,
      description,
      category,
      brand,
      stock,
      discountPercentage,
      altText,
    } = req.body;

    // Validate required fields
    if (!name || !price || !category || !brand || stock === undefined) {
      return res.status(400).json({ error: 'Missing required fields: name, price, category, brand, stock' });
    }

    // Validate field types and formats
    if (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 100) {
      return res.status(400).json({ error: 'Name must be a string between 2 and 100 characters' });
    }

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      return res.status(400).json({ error: 'Price must be a positive number' });
    }

    const parsedStock = parseInt(stock, 10);
    if (isNaN(parsedStock) || parsedStock < 0) {
      return res.status(400).json({ error: 'Stock must be a non-negative integer' });
    }

    const parsedDiscount = discountPercentage ? parseFloat(discountPercentage) : 0;
    if (discountPercentage && (isNaN(parsedDiscount) || parsedDiscount < 0 || parsedDiscount > 100)) {
      return res.status(400).json({ error: 'Discount percentage must be between 0 and 100' });
    }

    if (typeof category !== 'string' || category.trim().length < 2) {
      return res.status(400).json({ error: 'Category must be a string with at least 2 characters' });
    }

    if (typeof brand !== 'string' || brand.trim().length < 2) {
      return res.status(400).json({ error: 'Brand must be a string with at least 2 characters' });
    }

    if (description && (typeof description !== 'string' || description.trim().length > 1000)) {
      return res.status(400).json({ error: 'Description must be a string with at most 1000 characters' });
    }

    // Check for duplicate product
    const existingProduct = await Product.findOne({
      name: name.trim(),
      category: category.trim(),
      brand: brand.trim(),
    });
    if (existingProduct) {
      return res.status(400).json({ error: 'Product already exists with this name, category, and brand' });
    }

    // Handle images
    const images = req.files
      ? req.files.map((file) => ({
          url: `/uploads/${file.filename}`,
          alt: typeof altText === 'string' && altText.trim() ? altText.trim() : 'Product Image',
        }))
      : [];

    if (images.length > 5) {
      return res.status(400).json({ error: 'Cannot upload more than 5 images' });
    }

    const newProduct = new Product({
      name: name.trim(),
      price: parsedPrice,
      description: description ? description.trim() : undefined,
      category: category.trim(),
      brand: brand.trim(),
      stock: parsedStock,
      discountPercentage: parsedDiscount,
      images,
    });

    await newProduct.save();
    res.status(201).json({ message: 'Product added successfully', product: newProduct });
  } catch (err) {
    console.error('Add product error:', err.message, err.stack);
    res.status(500).json({ error: 'Failed to add product', details: err.message });
  }
};

exports.getProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, brand, sort } = req.query;
    const query = {};

    if (category) {
      if (typeof category !== 'string' || category.trim().length < 2) {
        return res.status(400).json({ error: 'Category must be a valid string' });
      }
      query.category = category.trim();
    }

    if (brand) {
      if (typeof brand !== 'string' || brand.trim().length < 2) {
        return res.status(400).json({ error: 'Brand must be a valid string' });
      }
      query.brand = brand.trim();
    }

    const parsedPage = parseInt(page, 10);
    const parsedLimit = parseInt(limit, 10);
    if (isNaN(parsedPage) || parsedPage < 1) {
      return res.status(400).json({ error: 'Page must be a positive integer' });
    }
    if (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 100) {
      return res.status(400).json({ error: 'Limit must be between 1 and 100' });
    }

    const validSortFields = ['price', 'createdAt', 'name'];
    const sortOption = sort && validSortFields.includes(sort) ? { [sort]: 1 } : { createdAt: -1 };

    const options = {
      page: parsedPage,
      limit: parsedLimit,
      sort: sortOption,
      populate: { path: 'reviews.user', select: 'name email' },
    };

    const products = await Product.paginate(query, options);
    res.status(200).json(products);
  } catch (err) {
    console.error('Get products error:', err.message, err.stack);
    res.status(500).json({ error: 'Failed to fetch products', details: err.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }

    const deleted = await Product.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error('Delete product error:', err.message, err.stack);
    res.status(500).json({ error: 'Failed to delete product', details: err.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }

    const {
      name,
      price,
      description,
      category,
      brand,
      stock,
      discountPercentage,
      existingImages,
      altText,
    } = req.body;

    // Validate fields if provided
    if (name && (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 100)) {
      return res.status(400).json({ error: 'Name must be a string between 2 and 100 characters' });
    }

    let parsedPrice;
    if (price !== undefined) {
      parsedPrice = parseFloat(price);
      if (isNaN(parsedPrice) || parsedPrice <= 0) {
        return res.status(400).json({ error: 'Price must be a positive number' });
      }
    }

    let parsedStock;
    if (stock !== undefined) {
      parsedStock = parseInt(stock, 10);
      if (isNaN(parsedStock) || parsedStock < 0) {
        return res.status(400).json({ error: 'Stock must be a non-negative integer' });
      }
    }

    let parsedDiscount;
    if (discountPercentage !== undefined) {
      parsedDiscount = parseFloat(discountPercentage);
      if (isNaN(parsedDiscount) || parsedDiscount < 0 || parsedDiscount > 100) {
        return res.status(400).json({ error: 'Discount percentage must be between 0 and 100' });
      }
    }

    if (category && (typeof category !== 'string' || category.trim().length < 2)) {
      return res.status(400).json({ error: 'Category must be a string with at least 2 characters' });
    }

    if (brand && (typeof brand !== 'string' || brand.trim().length < 2)) {
      return res.status(400).json({ error: 'Brand must be a string with at least 2 characters' });
    }

    if (description && (typeof description !== 'string' || description.trim().length > 1000)) {
      return res.status(400).json({ error: 'Description must be a string with at most 1000 characters' });
    }

    // Handle images
    let images = [];
    if (existingImages) {
      try {
        images = JSON.parse(existingImages);
        if (!Array.isArray(images) || !images.every(img => typeof img.url === 'string' && (!img.alt || typeof img.alt === 'string'))) {
          return res.status(400).json({ error: 'Existing images must be a valid array of image objects with url and optional alt' });
        }
      } catch (err) {
        return res.status(400).json({ error: 'Invalid existing images format' });
      }
    }

    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((file) => ({
        url: `/uploads/${file.filename}`,
        alt: typeof altText === 'string' && altText.trim() ? altText.trim() : 'Product Image',
      }));
      images = [...images, ...newImages];
    }

    if (images.length > 5) {
      return res.status(400).json({ error: 'Total images cannot exceed 5' });
    }

    const updateData = {
      ...(name && { name: name.trim() }),
      ...(parsedPrice !== undefined && { price: parsedPrice }),
      ...(description !== undefined && { description: description ? description.trim() : undefined }),
      ...(category && { category: category.trim() }),
      ...(brand && { brand: brand.trim() }),
      ...(parsedStock !== undefined && { stock: parsedStock }),
      ...(parsedDiscount !== undefined && { discountPercentage: parsedDiscount }),
      ...(images.length > 0 && { images }),
      updatedAt: Date.now(),
    };

    const updated = await Product.findByIdAndUpdate(id, updateData, { new: true });
    if (!updated) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.status(200).json({ message: 'Product updated successfully', product: updated });
  } catch (err) {
    console.error('Update product error:', err.message, err.stack);
    res.status(500).json({ error: 'Failed to update product', details: err.message });
  }
};