export interface User {
  id: string;
  email: string;
}

export interface Project {
  id: string;
  name: string;
  apiKey: string;
  createdAt: string;
}

export interface Summary {
  totalEvents: number;
  uniqueUsers: number;
  uniqueEventTypes: number;
}

export interface EventByName {
  eventName: string;
  count: number;
}

export interface TimePoint {
  date: string;
  count: number;
}

export interface CountryPoint {
  country: string;
  count: number;
}

export interface DevicePoint {
  deviceType: string;
  count: number;
}

export interface TopUser {
  identifier: string;
  isAnonymous: boolean;
  eventCount: number;
}

export interface AuthResponse {
  user: User;
  token: string;
}
