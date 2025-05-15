import axios from 'axios';
import { Project } from '@/interfaces/interface';


// Create an axios instance with default config
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});


// API methods
export const projectApi = {
  // Get all projects
  getAll: async (): Promise<Project[]> => {
    const response = await api.get<Project[]>('/projects');
    return response.data;
  },

  // Get a single project
  getById: async (id: number): Promise<Project> => {
    const response = await api.get<Project>(`/projects/${id}`);
    return response.data;
  },

  // Create a new project
  create: async (project: Omit<Project, 'id'>): Promise<Project> => {
    const response = await api.post<Project>('/projects', project);
    return response.data;
  },

  // Update a project
  update: async (id: number, project: Partial<Project>): Promise<Project> => {
    const response = await api.put<Project>(`/projects/${id}`, project);
    return response.data;
  },

  // Delete a project
  delete: async (id: number): Promise<void> => {
    await api.delete(`/projects/${id}`);
  },

  // Search projects
  search: async (query: string): Promise<Project[]> => {
    const response = await api.get<Project[]>(`/projects/search?str=${encodeURIComponent(query)}`);
    return response.data;
  },
};

export default api; 