import api from './axios';
import type { Project } from '../types';

export const createProject = (name: string) =>
  api.post<Project>('/project/create', { name });

export const listProjects = () =>
  api.get<{ projects: Project[] }>('/project/list');

export const getProject = (id: string) =>
  api.get<Project>(`/project/${id}`);

export const deleteProject = (id: string) =>
  api.delete(`/project/${id}`);

export const rotateApiKey = (id: string) =>
  api.post<{ apiKey: string }>(`/project/${id}/rotate-key`);
