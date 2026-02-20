interface Contact {
  id: number;
  type: string;
  contactValue: string;
  label: string;
  isPrimary: boolean;
  isActive: boolean;
  orderPriority: number;
  createdAt: string;
  updatedAt: string;
}

interface ContactResponse {
  success: boolean;
  message?: string;
  data?: Contact | Contact[] | null;
}

class ContactService {
  private API_BASE_URL = '/api/contact';
  private getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  async getAllContacts(): Promise<Contact[]> {
    try {
      const response = await fetch(`${this.API_BASE_URL}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result: ContactResponse = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch contacts');
      }

      return (result.data as Contact[]) || [];
    } catch (error) {
      console.error('Error fetching contacts:', error);
      throw error instanceof Error ? error : new Error('Failed to fetch contacts');
    }
  }

  async getContactsByType(type: string): Promise<Contact[]> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/type/${type}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result: ContactResponse = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch contacts by type');
      }

      return (result.data as Contact[]) || [];
    } catch (error) {
      console.error('Error fetching contacts by type:', error);
      throw error instanceof Error ? error : new Error('Failed to fetch contacts by type');
    }
  }

  async getContactById(id: number): Promise<Contact | null> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result: ContactResponse = await response.json();

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(result.message || 'Failed to fetch contact');
      }

      return result.data as Contact;
    } catch (error) {
      console.error('Error fetching contact:', error);
      throw error instanceof Error ? error : new Error('Failed to fetch contact');
    }
  }

  async createContact(contact: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>): Promise<Contact> {
    try {
      const response = await fetch(`${this.API_BASE_URL}`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(contact),
      });

      const result: ContactResponse = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to create contact');
      }

      return result.data as Contact;
    } catch (error) {
      console.error('Error creating contact:', error);
      throw error instanceof Error ? error : new Error('Failed to create contact');
    }
  }

  async updateContact(id: number, contact: Partial<Omit<Contact, 'id' | 'createdAt'>>): Promise<Contact> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/${id}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(contact),
      });

      const result: ContactResponse = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to update contact');
      }

      return result.data as Contact;
    } catch (error) {
      console.error('Error updating contact:', error);
      throw error instanceof Error ? error : new Error('Failed to update contact');
    }
  }

  async deleteContact(id: number): Promise<void> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      const result: ContactResponse = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to delete contact');
      }
    } catch (error) {
      console.error('Error deleting contact:', error);
      throw error instanceof Error ? error : new Error('Failed to delete contact');
    }
  }

  async setContactAsPrimary(id: number): Promise<void> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/${id}/set-primary`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
      });

      const result: ContactResponse = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to set contact as primary');
      }
    } catch (error) {
      console.error('Error setting contact as primary:', error);
      throw error instanceof Error ? error : new Error('Failed to set contact as primary');
    }
  }
}

export default new ContactService();
export type { Contact, ContactResponse };
