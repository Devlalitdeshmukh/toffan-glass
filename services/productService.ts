const API_BASE_URL = 'http://localhost:5000/api';

class ProductService {
    static normalizeProduct(product) {
        if (!product) return product;

        const rawImages = Array.isArray(product.imageUrls)
            ? product.imageUrls
            : Array.isArray(product.images)
                ? product.images
                : [];

        return {
            ...product,
            imageUrls: rawImages,
            imageUrl: product.imageUrl || rawImages[0] || null
        };
    }

    static normalizeProducts(products) {
        if (!Array.isArray(products)) return [];
        return products.map((product) => this.normalizeProduct(product));
    }

    // Get auth headers
    static getAuthHeaders() {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
        };
    }

    // Get all products
    static async getAllProducts() {
        try {
            const response = await fetch(`${API_BASE_URL}/products`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to get products');
            }

            return {
                success: true,
                products: this.normalizeProducts(data.products)
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Get product by ID
    static async getProductById(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/products/${id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to get product');
            }

            return {
                success: true,
                product: this.normalizeProduct(data.product)
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Get products by category
    static async getProductsByCategory(category) {
        try {
            const response = await fetch(`${API_BASE_URL}/products/category/${category}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to get products by category');
            }

            return {
                success: true,
                products: this.normalizeProducts(data.products),
                category: data.category
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Search products
    static async searchProducts(query) {
        try {
            const response = await fetch(`${API_BASE_URL}/products/search?q=${encodeURIComponent(query)}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to search products');
            }

            return {
                success: true,
                products: this.normalizeProducts(data.products),
                query: data.query
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Create product (admin/staff only)
    static async createProduct(productData) {
        try {
            let response;
            let data;
            
            // Check if productData contains images that need to be uploaded
            if (productData.images && productData.images.length > 0 && productData.images.some(img => img instanceof File)) {
                // Handle multipart/form-data for image uploads
                const formData = new FormData();
                
                // Add non-file fields
                for (const key in productData) {
                    if (key !== 'images') {
                        if (typeof productData[key] === 'object' && productData[key] !== null) {
                            formData.append(key, JSON.stringify(productData[key]));
                        } else {
                            formData.append(key, productData[key]);
                        }
                    }
                }
                
                // Add image files
                productData.images.forEach((image, index) => {
                    if (image instanceof File) {
                        formData.append(`images`, image);
                    }
                });
                
                response = await fetch(`${API_BASE_URL}/products`, {
                    method: 'POST',
                    headers: {
                        'Authorization': this.getAuthHeaders()['Authorization'],
                        // Don't set Content-Type header, let browser set it with boundary
                    },
                    body: formData
                });
            } else {
                // Standard JSON request
                response = await fetch(`${API_BASE_URL}/products`, {
                    method: 'POST',
                    headers: this.getAuthHeaders(),
                    body: JSON.stringify(productData)
                });
            }

            data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create product');
            }

            return {
                success: true,
                product: this.normalizeProduct(data.product),
                message: data.message
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Update product (admin/staff only)
    static async updateProduct(id, productData) {
        try {
            let response;
            let data;
            
            // Check if productData contains images that need to be uploaded
            const hasNewImageFiles = productData.images && productData.images.length > 0 && productData.images.some(img => img instanceof File);
            
            if (hasNewImageFiles) {
                // Handle multipart/form-data for image uploads
                const formData = new FormData();
                
                // Add non-file fields
                for (const key in productData) {
                    if (key !== 'images') {
                        if (key === 'existingImages' && Array.isArray(productData[key])) {
                            formData.append(key, productData[key].join(','));
                        } else if (typeof productData[key] === 'object' && productData[key] !== null) {
                            formData.append(key, JSON.stringify(productData[key]));
                        } else {
                            formData.append(key, productData[key]);
                        }
                    }
                }
                
                // Add image files
                productData.images.forEach((image) => {
                    if (image instanceof File) {
                        formData.append(`images`, image);
                    }
                });
                
                response = await fetch(`${API_BASE_URL}/products/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': this.getAuthHeaders()['Authorization'],
                    },
                    body: formData
                });
            } else {
                // Standard JSON request
                response = await fetch(`${API_BASE_URL}/products/${id}`, {
                    method: 'PUT',
                    headers: this.getAuthHeaders(),
                    body: JSON.stringify(productData)
                });
            }

            data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to update product');
            }

            return {
                success: true,
                product: this.normalizeProduct(data.product),
                message: data.message
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Delete product (admin only)
    static async deleteProduct(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/products/${id}`, {
                method: 'DELETE',
                headers: this.getAuthHeaders()
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to delete product');
            }

            return {
                success: true,
                message: data.message
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
}

export default ProductService;
