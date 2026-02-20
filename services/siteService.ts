const API_BASE_URL = 'http://localhost:5000/api';

class SiteService {
    // Get auth headers
    static getAuthHeaders() {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
        };
    }

    // Get all sites (Public)
    static async getAllSites() {
        try {
            const response = await fetch(`${API_BASE_URL}/sites`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to get sites');
            }

            return {
                success: true,
                sites: data.sites
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Get site by ID (Public)
    static async getSiteById(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/sites/${id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to get site');
            }

            return {
                success: true,
                site: data.site
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Create new site (Admin/Staff only)
    static async createSite(siteData) {
        try {
            let response;
            let data;

            // Check if siteData contains images that need to be uploaded
            if (siteData.images && siteData.images.length > 0 && siteData.images.some(img => img instanceof File)) {
                const formData = new FormData();
                
                // Add non-file fields
                for (const key in siteData) {
                    if (key !== 'images') {
                        formData.append(key, siteData[key]);
                    }
                }
                
                // Add image files
                siteData.images.forEach((image) => {
                    if (image instanceof File) {
                        formData.append(`images`, image);
                    }
                });
                
                response = await fetch(`${API_BASE_URL}/sites`, {
                    method: 'POST',
                    headers: {
                        'Authorization': this.getAuthHeaders()['Authorization'],
                    },
                    body: formData
                });
            } else {
                response = await fetch(`${API_BASE_URL}/sites`, {
                    method: 'POST',
                    headers: this.getAuthHeaders(),
                    body: JSON.stringify(siteData)
                });
            }

            data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create site');
            }

            return {
                success: true,
                site: data.site
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Update site (Admin/Staff only)
    static async updateSite(id, siteData) {
        try {
            let response;
            let data;

            // Check if siteData contains images that need to be uploaded
            if (siteData.images && siteData.images.length > 0 && siteData.images.some(img => img instanceof File)) {
                const formData = new FormData();
                
                // Add non-file fields
                for (const key in siteData) {
                    if (key !== 'images' && key !== 'existingImages') {
                        formData.append(key, siteData[key]);
                    }
                }
                
                // Add image files
                siteData.images.forEach((image) => {
                    if (image instanceof File) {
                        formData.append(`images`, image);
                    }
                });

                // Add existing images list for retention
                if (siteData.existingImages) {
                    const imagesToKeep = Array.isArray(siteData.existingImages) 
                        ? siteData.existingImages.join(',') 
                        : siteData.existingImages;
                    formData.append('existingImages', imagesToKeep);
                }
                
                response = await fetch(`${API_BASE_URL}/sites/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': this.getAuthHeaders()['Authorization'],
                    },
                    body: formData
                });
            } else {
                response = await fetch(`${API_BASE_URL}/sites/${id}`, {
                    method: 'PUT',
                    headers: this.getAuthHeaders(),
                    body: JSON.stringify(siteData)
                });
            }

            data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to update site');
            }

            return {
                success: true,
                site: data.site
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Update site status (Admin/Staff only)
    static async updateSiteStatus(id, status) {
        try {
            const response = await fetch(`${API_BASE_URL}/sites/${id}/status`, {
                method: 'PUT',
                headers: this.getAuthHeaders(),
                body: JSON.stringify({ status })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to update site status');
            }

            return {
                success: true,
                site: data.site
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Delete site (Admin only)
    static async deleteSite(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/sites/${id}`, {
                method: 'DELETE',
                headers: this.getAuthHeaders()
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to delete site');
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

    // Get sites by status (Public)
    static async getSitesByStatus(status) {
        try {
            const response = await fetch(`${API_BASE_URL}/sites/status/${status}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to get sites');
            }

            return {
                success: true,
                sites: data.sites
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Get sites with images (Public)
    static async getSitesWithImages() {
        try {
            const response = await fetch(`${API_BASE_URL}/sites-with-images`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to get sites with images');
            }

            return {
                success: true,
                sites: data.sites
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
}

export default SiteService;