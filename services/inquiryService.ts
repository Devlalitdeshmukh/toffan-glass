const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

class InquiryService {
    // Get auth headers
    static getAuthHeaders() {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
        };
    }

    // Get all inquiries (Admin/Staff only)
    static async getAllInquiries() {
        try {
            const response = await fetch(`${API_BASE_URL}/inquiries`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to get inquiries');
            }

            return {
                success: true,
                inquiries: data.inquiries
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Get inquiry by ID (Admin/Staff only)
    static async getInquiryById(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/inquiries/${id}`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to get inquiry');
            }

            return {
                success: true,
                inquiry: data.inquiry
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Create new inquiry (Public)
    static async createInquiry(inquiryData) {
        try {
            const response = await fetch(`${API_BASE_URL}/inquiries`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(inquiryData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create inquiry');
            }

            return {
                success: true,
                inquiry: data.inquiry
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Update inquiry (Admin/Staff only)
    static async updateInquiry(id, inquiryData) {
        try {
            const response = await fetch(`${API_BASE_URL}/inquiries/${id}`, {
                method: 'PUT',
                headers: this.getAuthHeaders(),
                body: JSON.stringify(inquiryData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to update inquiry');
            }

            return {
                success: true,
                inquiry: data.inquiry
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Update inquiry status (Admin/Staff only)
    static async updateInquiryStatus(id, status) {
        try {
            const response = await fetch(`${API_BASE_URL}/inquiries/${id}/status`, {
                method: 'PUT',
                headers: this.getAuthHeaders(),
                body: JSON.stringify({ status })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to update inquiry status');
            }

            return {
                success: true,
                inquiry: data.inquiry
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Delete inquiry (Admin only)
    static async deleteInquiry(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/inquiries/${id}`, {
                method: 'DELETE',
                headers: this.getAuthHeaders()
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to delete inquiry');
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

    // Get inquiries by status (Admin/Staff only)
    static async getInquiriesByStatus(status) {
        try {
            const response = await fetch(`${API_BASE_URL}/inquiries/status/${status}`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to get inquiries');
            }

            return {
                success: true,
                inquiries: data.inquiries
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
}

export default InquiryService;
