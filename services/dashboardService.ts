const API_BASE_URL = 'http://localhost:5000/api';

class DashboardService {
    // Get auth headers
    static getAuthHeaders() {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
        };
    }

    // Get dashboard statistics
    static async getDashboardStats() {
        try {
            // For now, we'll return mock data but this could be expanded to fetch real analytics
            // In a real implementation, you'd have specific endpoints for:
            // - Active sites/projects
            // - Sales statistics
            // - Inventory levels
            // - Payment status
            const stats = [
                { 
                    label: 'Active Projects', 
                    value: '12', 
                    icon: 'MapIcon', 
                    color: 'bg-blue-500',
                    description: 'Current active installations'
                },
                { 
                    label: 'Total Revenue', 
                    value: '₹14.2L', 
                    icon: 'TrendingUp', 
                    color: 'bg-green-500',
                    description: 'This financial year'
                },
                { 
                    label: 'Products In Stock', 
                    value: '85%', 
                    icon: 'Package', 
                    color: 'bg-orange-500',
                    description: 'Inventory utilization'
                },
                { 
                    label: 'Pending Payments', 
                    value: '₹2.1L', 
                    icon: 'AlertCircle', 
                    color: 'bg-red-500',
                    description: 'Outstanding invoices'
                }
            ];

            return {
                success: true,
                stats
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Get all users (admin only)
    static async getUsers() {
        try {
            const response = await fetch(`${API_BASE_URL}/users`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to get users');
            }

            return {
                success: true,
                users: data.users
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Get all products
    static async getProducts() {
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
                products: data.products
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Create new product (admin/staff only)
    static async createProduct(productData) {
        try {
            const response = await fetch(`${API_BASE_URL}/products`, {
                method: 'POST',
                headers: this.getAuthHeaders(),
                body: JSON.stringify(productData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create product');
            }

            return {
                success: true,
                product: data.product,
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
            const response = await fetch(`${API_BASE_URL}/products/${id}`, {
                method: 'PUT',
                headers: this.getAuthHeaders(),
                body: JSON.stringify(productData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to update product');
            }

            return {
                success: true,
                product: data.product,
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

export default DashboardService;