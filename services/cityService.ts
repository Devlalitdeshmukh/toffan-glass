const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

class CityService {
    // Get auth headers
    static getAuthHeaders() {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
        };
    }

    // Get all cities (Public)
    static async getAllCities() {
        try {
            const response = await fetch(`${API_BASE_URL}/cities`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to get cities');
            }

            return {
                success: true,
                cities: data.cities
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Get city by ID (Public)
    static async getCityById(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/cities/${id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to get city');
            }

            return {
                success: true,
                city: data.city
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Create new city (Admin only)
    static async createCity(cityData) {
        try {
            const response = await fetch(`${API_BASE_URL}/cities`, {
                method: 'POST',
                headers: this.getAuthHeaders(),
                body: JSON.stringify(cityData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create city');
            }

            return {
                success: true,
                city: data.city
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Update city (Admin only)
    static async updateCity(id, cityData) {
        try {
            const response = await fetch(`${API_BASE_URL}/cities/${id}`, {
                method: 'PUT',
                headers: this.getAuthHeaders(),
                body: JSON.stringify(cityData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to update city');
            }

            return {
                success: true,
                city: data.city
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Delete city (Admin only)
    static async deleteCity(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/cities/${id}`, {
                method: 'DELETE',
                headers: this.getAuthHeaders()
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to delete city');
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

export default CityService;
