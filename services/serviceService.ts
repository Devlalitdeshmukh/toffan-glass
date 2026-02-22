
const API_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export interface Service {
  id: number;
  title: string;
  shortDescription: string;
  description: string;
  status: 'ACTIVE' | 'INACTIVE';
  icon?: string;
  createdAt: string;
  updatedAt: string;
  images?: ServiceImage[];
}

export interface ServiceImage {
  id: number;
  imageUrl: string;
  caption?: string;
  isPrimary: boolean;
  sortOrder: number;
}

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`
  };
};

const getAllServices = async (params?: { page?: number; limit?: number; sortField?: string; sortDirection?: string; search?: string }) => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.sortField) queryParams.append('sortField', params.sortField);
    if (params?.sortDirection) queryParams.append('sortDirection', params.sortDirection);
    if (params?.search) queryParams.append('search', params.search);
    
    const url = `${API_URL}/services${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (response.ok) {
      return { 
        success: true, 
        services: data.services,
        pagination: data.pagination
      };
    } else {
      return { success: false, error: data.error || 'Failed to fetch services' };
    }
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

const getServiceById = async (id: number | string) => {
  try {
    const response = await fetch(`${API_URL}/services/${id}`);
    const data = await response.json();
    if (response.ok) {
      return { success: true, service: data.service };
    } else {
      return { success: false, error: data.error || 'Failed to fetch service' };
    }
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

const createService = async (formData: FormData) => {
  try {
    const response = await fetch(`${API_URL}/services`, {
      method: 'POST',
      headers: {
        ...getAuthHeader()
      },
      body: formData
    });
    const data = await response.json();
    if (response.ok) {
      return { success: true, service: data.service };
    } else {
      return { success: false, error: data.error || 'Failed to create service' };
    }
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

const updateService = async (id: number | string, formData: FormData) => {
  try {
    const response = await fetch(`${API_URL}/services/${id}`, {
      method: 'PUT',
      headers: {
        ...getAuthHeader()
      },
      body: formData
    });
    const data = await response.json();
    if (response.ok) {
      return { success: true, service: data.service };
    } else {
      return { success: false, error: data.error || 'Failed to update service' };
    }
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

const deleteService = async (id: number | string) => {
  try {
    const response = await fetch(`${API_URL}/services/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      }
    });
    if (response.ok) {
      return { success: true };
    } else {
      const data = await response.json();
      return { success: false, error: data.error || 'Failed to delete service' };
    }
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

const deleteServiceImage = async (serviceId: number | string, imageId: number | string) => {
    try {
        const response = await fetch(`${API_URL}/services/${serviceId}/images/${imageId}`, {
            method: 'DELETE',
            headers: {
                ...getAuthHeader()
            }
        });
        if (response.ok) {
            return { success: true };
        } else {
            const data = await response.json();
            return { success: false, error: data.error || 'Failed to delete image' };
        }
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

const ServiceService = {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
  deleteServiceImage
};

export default ServiceService;
