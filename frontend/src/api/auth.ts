import api from './axios';
import type { AuthResponse } from '../types';

export const signup = (email: string, password: string) =>
  api.post<AuthResponse>('/auth/signup', { email, password });

export const login = (email: string, password: string) =>
  api.post<AuthResponse>('/auth/login', { email, password });
