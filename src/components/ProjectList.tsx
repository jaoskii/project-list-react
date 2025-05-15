'use client';

import { useState, useEffect } from 'react';
import { projectApi } from '@/services/api';
import { Project } from '@/interfaces/interface';
import { ProjectModal } from './formModal';
import { ProjectCard } from './ProjectCard';

export function ProjectList() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // Load projects
  const loadProjects = async () => {
    try {
      setIsLoading(true);
      const data = await projectApi.getAll();
      setProjects(data);
      setError(null);
    } catch (err) {
      setError('Failed to load projects');
      console.error('Error loading projects:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Search projects
  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      loadProjects();
      return;
    }
    
    try {
      setIsLoading(true);
      const data = await projectApi.search(query);
      setProjects(data);
      setError(null);
    } catch (err) {
      setError('Failed to search projects');
      console.error('Error searching projects:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Delete project
  const handleDelete = async (id: number) => {
    try {
      setIsLoading(true);
      await projectApi.delete(id);
      setProjects(projects.filter(project => project.id !== id));
      setError(null);
    } catch (err) {
      setError('Failed to delete project');
      console.error('Error deleting project:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Open modal for create/edit
  const openModal = (project?: Project) => {
    setEditingProject(project || null);
    setIsModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProject(null);
  };

  // Handle form submission (create or edit)
  const handleSubmit = async (formData: { name: string; description: string }) => {
    try {
      setIsLoading(true);
      if (editingProject) {
        // Update existing project
        const updated = await projectApi.update(editingProject.id, formData);
        setProjects(projects.map(p => p.id === editingProject.id ? updated : p));
      } else {
        // Create new project
        const created = await projectApi.create(formData);
        setProjects([...projects, created]);
      }
      closeModal();
      setError(null);
    } catch (err) {
      setError(`Failed to ${editingProject ? 'update' : 'create'} project`);
      console.error(`Error ${editingProject ? 'updating' : 'creating'} project:`, err);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadProjects();
  }, []);

  // Search effect
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery) {
        handleSearch(searchQuery);
      } else {
        loadProjects();
      }
    }, 300);

    return () => {
      clearTimeout(delayDebounceFn);
      setIsLoading(false); // Reset loading state when search is cancelled
    };
  }, [searchQuery]);

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Project List</h1>
          <button 
            onClick={() => openModal()}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add Project
          </button>
        </div>

        <ProjectModal
          isOpen={isModalOpen}
          onClose={closeModal}
          onSubmit={handleSubmit}
          editingProject={editingProject}
        />

        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 pl-10 pr-4 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <svg
              className="absolute left-3 top-2.5 h-5 w-5 text-gray-400 dark:text-gray-500"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="grid gap-4">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onEdit={openModal}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 