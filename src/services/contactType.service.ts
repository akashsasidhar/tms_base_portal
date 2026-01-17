import apiClient from '@/lib/api-client';
import type { ContactType } from '@/types/contact.types';
import type { ApiResponse } from '@/types/common.types';

class ContactTypeService {
  /**
   * Get all contact types
   */
  async getAll(): Promise<ContactType[]> {
    const response = await apiClient.get<ApiResponse<ContactType[]>>('/contact-types');
    return response.data.data || [];
  }

  /**
   * Get contact type by ID
   */
  async getById(id: string): Promise<ContactType> {
    const response = await apiClient.get<ApiResponse<ContactType>>(`/contact-types/${id}`);
    return response.data.data!;
  }
}

export const contactTypeService = new ContactTypeService();
