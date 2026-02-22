const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

class AuthService {
    // Store token in localStorage
    static setToken(token) {
        localStorage.setItem('token', token);
    }

    // Get token from localStorage
    static getToken() {
        return localStorage.getItem('token');
    }

    // Remove token from localStorage
    static removeToken() {
        localStorage.removeItem('token');
    }

    // Check if user is authenticated
    static isAuthenticated() {
        return !!this.getToken();
    }

    // Get auth headers
    static getAuthHeaders() {
        const token = this.getToken();
        return {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
        };
    }

    // Register user
    static async register(userData) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Registration failed');
            }

            // Store token
            this.setToken(data.token);
            
            return {
                success: true,
                user: data.user,
                message: data.message
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Login user
    static async login(email, password) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Login failed');
            }

            // Store token
            this.setToken(data.token);
            
            return {
                success: true,
                user: data.user,
                message: data.message
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Logout user
    static logout() {
        this.removeToken();
    }

    // Get user profile
    static async getProfile() {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/profile`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to get profile');
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

    // Update user profile
    static async updateProfile(profileData) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/profile`, {
                method: 'PUT',
                headers: this.getAuthHeaders(),
                body: JSON.stringify(profileData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to update profile');
            }

            return {
                success: true,
                user: data.user,
                message: data.message
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Get all users (admin/staff only)
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
}

export default AuthService;
