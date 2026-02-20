const Product = require('../models/Product');
const fs = require('fs');
const path = require('path');

const normalizeExistingImages = (existingImages) => {
    if (Array.isArray(existingImages)) {
        return existingImages.filter((img) => typeof img === 'string' && img.trim() !== '');
    }

    if (typeof existingImages === 'string') {
        const trimmed = existingImages.trim();
        if (!trimmed) return [];

        // Multipart form usually sends comma-separated values
        return trimmed
            .split(',')
            .map((img) => img.trim())
            .filter(Boolean);
    }

    return null;
};

const getAllProducts = async (req, res) => {
    try {
        const products = await Product.getAll();
        res.json({
            message: 'Products retrieved successfully',
            products
        });
    } catch (error) {
        console.error('Get all products error:', error);
        res.status(500).json({ 
            error: 'Failed to retrieve products',
            message: error.message 
        });
    }
};

const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.getById(id);
        
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        
        res.json({
            message: 'Product retrieved successfully',
            product
        });
    } catch (error) {
        console.error('Get product by ID error:', error);
        res.status(500).json({ 
            error: 'Failed to retrieve product',
            message: error.message 
        });
    }
};

const getProductsByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        const products = await Product.getByCategory(category);
        
        res.json({
            message: `Products in category ${category} retrieved successfully`,
            category,
            products
        });
    } catch (error) {
        console.error('Get products by category error:', error);
        res.status(500).json({ 
            error: 'Failed to retrieve products by category',
            message: error.message 
        });
    }
};

const createProduct = async (req, res) => {
    try {
        const { name, category, description, price, stock, specifications } = req.body;
        
        // Handle specifications if it's sent as a string
        let parsedSpecs = specifications;
        if (typeof specifications === 'string') {
            try {
                parsedSpecs = JSON.parse(specifications);
            } catch (e) {
                // If parsing fails, keep original value
            }
        }
        
        // Validation
        if (!name || !category || !description || price === undefined || stock === undefined) {
            return res.status(400).json({ 
                error: 'Name, category, description, price, and stock are required' 
            });
        }
        
        // Create product first
        const productId = await Product.create({
            name,
            category,
            description,
            price: parseFloat(price),
            stock: parseInt(stock),
            specifications: parsedSpecs || {}
        });
        
        // Handle image uploads if any
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                // Add image to product_images table
                await Product.addImage(productId, `/uploads/product-images/${file.filename}`);
            }
        }
        
        const product = await Product.getById(productId);
        
        res.status(201).json({
            message: 'Product created successfully',
            product
        });
    } catch (error) {
        console.error('Create product error:', error);
        res.status(500).json({ 
            error: 'Failed to create product',
            message: error.message 
        });
    }
};

const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, category, description, price, stock, specifications, existingImages } = req.body;
        
        // Handle specifications if it's sent as a string
        let parsedSpecs = specifications;
        if (typeof specifications === 'string') {
            try {
                parsedSpecs = JSON.parse(specifications);
            } catch (e) {
                // If parsing fails, keep original value
            }
        }
        
        const updated = await Product.update(id, {
            name,
            category,
            description,
            price: parseFloat(price),
            stock: parseInt(stock),
            specifications: parsedSpecs || {}
        });
        
        if (!updated) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // If existingImages is provided, remove deleted images from DB + filesystem
        const keepImages = normalizeExistingImages(existingImages);
        if (keepImages !== null) {
            const currentImages = await Product.getImageUrls(id);
            const keepSet = new Set(keepImages);
            const imagesToDelete = currentImages.filter((imgUrl) => !keepSet.has(imgUrl));

            if (imagesToDelete.length > 0) {
                await Product.deleteImagesByUrls(id, imagesToDelete);

                for (const imageUrl of imagesToDelete) {
                    if (typeof imageUrl !== 'string' || !imageUrl.startsWith('/uploads/')) continue;
                    const absolutePath = path.join(__dirname, '../..', imageUrl);
                    if (fs.existsSync(absolutePath)) {
                        fs.unlink(absolutePath, (err) => {
                            if (err) {
                                console.error('Failed to delete product image file:', absolutePath, err.message);
                            }
                        });
                    }
                }
            }
        }
        
        // Handle image uploads if any
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                // Add image to product_images table
                await Product.addImage(id, `/uploads/product-images/${file.filename}`);
            }
        }
        
        const product = await Product.getById(id);
        
        res.json({
            message: 'Product updated successfully',
            product
        });
    } catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({ 
            error: 'Failed to update product',
            message: error.message 
        });
    }
};

const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Product.delete(id);
        
        if (!deleted) {
            return res.status(404).json({ error: 'Product not found' });
        }
        
        res.json({
            message: 'Product deleted successfully'
        });
    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({ 
            error: 'Failed to delete product',
            message: error.message 
        });
    }
};

const searchProducts = async (req, res) => {
    try {
        const { q } = req.query;
        
        if (!q) {
            return res.status(400).json({ error: 'Search query is required' });
        }
        
        const products = await Product.search(q);
        
        res.json({
            message: 'Products searched successfully',
            query: q,
            products
        });
    } catch (error) {
        console.error('Search products error:', error);
        res.status(500).json({ 
            error: 'Failed to search products',
            message: error.message 
        });
    }
};

module.exports = {
    getAllProducts,
    getProductById,
    getProductsByCategory,
    createProduct,
    updateProduct,
    deleteProduct,
    searchProducts
};
