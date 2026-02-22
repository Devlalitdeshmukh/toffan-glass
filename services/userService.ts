const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// This is a service file, no React imports needed

class UserService {
    // Get auth headers
    static getAuthHeaders() {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
        };
    }

    // Get all users (Admin only)
    static async getAllUsers() {
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

    // Get user by ID (Admin/Staff only)
    static async getUserById(id: string) {
        try {
            const response = await fetch(`${API_BASE_URL}/users/${id}`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to get user');
            }

            return {
                success: true,
                user: data.user
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Create new user (Admin only)
    static async createUser(userData: any) {
        try {
            const response = await fetch(`${API_BASE_URL}/users`, {
                method: 'POST',
                headers: this.getAuthHeaders(),
                body: JSON.stringify(userData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create user');
            }

            return {
                success: true,
                user: data.user
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Update user (Admin only)
    static async updateUser(id: string, userData: any) {
        try {
            const response = await fetch(`${API_BASE_URL}/users/${id}`, {
                method: 'PUT',
                headers: this.getAuthHeaders(),
                body: JSON.stringify(userData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to update user');
            }

            return {
                success: true,
                user: data.user
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Delete user (Admin only)
    static async deleteUser(id: string) {
        try {
            const response = await fetch(`${API_BASE_URL}/users/${id}`, {
                method: 'DELETE',
                headers: this.getAuthHeaders()
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to delete user');
            }

            return {
                success: true
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
}

export default UserService;
