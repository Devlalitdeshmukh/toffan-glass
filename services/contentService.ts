import { ContentPage } from '../types';

const API_BASE_URL =
  import.meta.env.VITE_CONTENT_API_URL ||
  `${import.meta.env.VITE_API_BASE_URL || '/api'}/content`;

interface ContentPageResponse {
  success: boolean;
  data?: ContentPage;
  message?: string;
}

interface ContentPagesResponse {
  success: boolean;
  data?: ContentPage[];
  message?: string;
}

class ContentService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  async getAllContentPages(): Promise<ContentPage[]> {
    try {
      const response = await fetch(`${API_BASE_URL}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      const result: ContentPagesResponse = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch content pages');
      }

      return result.data || [];
    } catch (error) {
      console.error('Error fetching content pages:', error);
      throw error instanceof Error ? error : new Error('Failed to fetch content pages');
    }
  }

  async getContentPageByPageName(pageName: string): Promise<ContentPage | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/${pageName}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }, // Public access, no auth required
      });

      const result: ContentPageResponse = await response.json();

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(result.message || 'Failed to fetch content page');
      }

      return result.data || null;
    } catch (error) {
      console.error('Error fetching content page:', error);
      throw error instanceof Error ? error : new Error('Failed to fetch content page');
    }
  }

  async createContentPage(contentPage: Omit<ContentPage, 'id' | 'createdAt'>, images?: File[]): Promise<ContentPage> {
    try {
      let response;
      let result: ContentPageResponse;
      
      if (images && images.length > 0) {
        // Handle multipart/form-data for image uploads
        const formData = new FormData();
        
        // Add non-file fields
        for (const key in contentPage) {
          const value = contentPage[key as keyof typeof contentPage];
          if (value !== undefined && value !== null) {
            if (typeof value === 'object' && !(value instanceof File)) {
              formData.append(key, JSON.stringify(value));
            } else {
              formData.append(key, value.toString());
            }
          }
        }
        
        // Add image files
        images.forEach((image) => {
          formData.append('images', image);
        });
        
        const authHeaders = this.getAuthHeaders();
        const headers: Record<string, string> = {
          'Authorization': typeof authHeaders === 'object' && authHeaders !== null && 'Authorization' in authHeaders
            ? (authHeaders as Record<string, string>)['Authorization']
            : ''
        };
        
        response = await fetch(`${API_BASE_URL}`, {
          method: 'POST',
          headers,
          body: formData
        });
      } else {
        // Standard JSON request
        response = await fetch(`${API_BASE_URL}`, {
          method: 'POST',
          headers: this.getAuthHeaders(),
          body: JSON.stringify(contentPage),
        });
      }

      result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to create content page');
      }

      return result.data!;
    } catch (error) {
      console.error('Error creating content page:', error);
      throw error instanceof Error ? error : new Error('Failed to create content page');
    }
  }

  async updateContentPage(pageName: string, contentPage: Partial<Omit<ContentPage, 'id' | 'createdAt'>>, images?: File[], existingImages?: string[]): Promise<ContentPage> {
    try {
      let response;
      let result: ContentPageResponse;
      
      if (images && images.length > 0) {
        // Handle multipart/form-data for image uploads
        const formData = new FormData();
        
        // Add non-file fields
        for (const key in contentPage) {
          const value = contentPage[key as keyof typeof contentPage];
          if (value !== undefined && value !== null) {
            if (typeof value === 'object' && !(value instanceof File)) {
              formData.append(key, JSON.stringify(value));
            } else {
              formData.append(key, value.toString());
            }
          }
        }
        
        // Add existing images
        if (existingImages && existingImages.length > 0) {
          existingImages.forEach(img => {
             formData.append('existingImages', img);
          });
        }

        // Add image files
        images.forEach((image) => {
          formData.append('images', image);
        });
        
        const authHeaders = this.getAuthHeaders();
        const headers: Record<string, string> = {
          'Authorization': typeof authHeaders === 'object' && authHeaders !== null && 'Authorization' in authHeaders
            ? (authHeaders as Record<string, string>)['Authorization']
            : ''
        };
        // Remove Content-Type to let browser set boundary
        
        response = await fetch(`${API_BASE_URL}/${pageName}`, {
          method: 'PUT',
          headers,
          body: formData
        });
      } else {
        // Standard JSON request
        response = await fetch(`${API_BASE_URL}/${pageName}`, {
          method: 'PUT',
          headers: this.getAuthHeaders(),
          body: JSON.stringify({
            ...contentPage,
            existingImages
          }),
        });
      }

      result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to update content page');
      }

      return result.data!;
    } catch (error) {
      console.error('Error updating content page:', error);
      throw error instanceof Error ? error : new Error('Failed to update content page');
    }
  }

  async deleteContentPage(pageName: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/${pageName}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      const result: ContentPageResponse = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to delete content page');
      }

      return true;
    } catch (error) {
      console.error('Error deleting content page:', error);
      throw error instanceof Error ? error : new Error('Failed to delete content page');
    }
  }
}

export default new ContentService();

