import api from './axios';
import type { Summary, EventByName, TimePoint, CountryPoint, DevicePoint, TopUser } from '../types';

export const getSummary = (projectId: string) =>
  api.get<Summary>(`/analytics/${projectId}/summary`);

export const getEventsByName = (projectId: string, limit = 10, offset = 0) =>
  api.get<{ total: number; limit: number; offset: number; events: EventByName[] }>(
    `/analytics/${projectId}/events`,
    { params: { limit, offset } }
  );

export const getEventsOverTime = (projectId: string, from?: string, to?: string) =>
  api.get<{ events: TimePoint[] }>(`/analytics/${projectId}/overtime`, { params: { from, to } });

export const getUsersOverTime = (projectId: string, from?: string, to?: string) =>
  api.get<{ users: TimePoint[] }>(`/analytics/${projectId}/users-overtime`, { params: { from, to } });

export const getEventsByCountry = (projectId: string, limit = 10, offset = 0) =>
  api.get<{ total: number; limit: number; offset: number; countries: CountryPoint[] }>(
    `/analytics/${projectId}/countries`,
    { params: { limit, offset } }
  );

export const getEventsByDevice = (projectId: string, limit = 10, offset = 0) =>
  api.get<{ total: number; limit: number; offset: number; devices: DevicePoint[] }>(
    `/analytics/${projectId}/devices`,
    { params: { limit, offset } }
  );

export const getTopUsers = (projectId: string, limit = 10, offset = 0) =>
  api.get<{ limit: number; offset: number; users: TopUser[] }>(
    `/analytics/${projectId}/users`,
    { params: { limit, offset } }
  );
