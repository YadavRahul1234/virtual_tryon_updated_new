import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface MeasurementRequest {
  front_image: string;
  side_image?: string | null;
  calibration_height: number;
  units: 'metric' | 'imperial';
  gender: 'male' | 'female';
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  confirm_password: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
  is_active: boolean;
  created_at: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface MeasurementResponse {
  success: boolean;
  measurements: {
    shoulder_width: number;
    chest: number;
    waist: number;
    hip: number;
    height: number;
    inseam: number;
    units: string;
  };
  front_landmarks?: any;
  side_landmarks?: any;
  message?: string;
}

export interface GarmentRecommendation {
  garment_id: string;
  name: string;
  recommended_size: string;
  fit_score: number;
  fit_feedback: string;
  measurements_match: any;
}

export interface SizeRecommendationRequest {
  measurements: {
    shoulder_width: number;
    chest: number;
    waist: number;
    hip: number;
    height: number;
    inseam: number;
    units: string;
  };
  garment_category: string;
}

export interface SizeFitAnalysis {
  measurement: string;
  analysis: string;
}

export interface SingleSizeRecommendation {
  size: string;
  fit_score: number;
  fit_category: string;
  measurements: Record<string, number>;
  fit_analysis: SizeFitAnalysis[];
}

export interface SizeRecommendationResponse {
  success: boolean;
  garment_category: string;
  garment_name: string;
  recommendations: SingleSizeRecommendation[];
  message?: string;
}

export interface GarmentCategoryInfo {
  key: string;
  name: string;
}

export interface DemoRequest {
  name: string;
  email: string;
  company: string;
  phone?: string;
  message?: string;
}

export interface DemoResponse {
  success: boolean;
  message: string;
}

// API Endpoints
export const measurementApi = {
  calculate: async (data: MeasurementRequest): Promise<MeasurementResponse> => {
    const response = await api.post('/measurements/calculate', data);
    return response.data;
  },
  
  getHistory: async () => {
    const response = await api.get('/measurements/history');
    return response.data;
  },
};

export const recommendationsApi = {
  getRecommendation: async (data: SizeRecommendationRequest): Promise<SizeRecommendationResponse> => {
    const response = await api.post('/size-recommendations/recommend', data);
    return response.data;
  },
  
  getCategories: async () => {
    const response = await api.get('/size-recommendations/categories');
    return response.data;
  },
};

export const tryonApi = {
  getGarments: async () => {
    const response = await api.get('/tryon/garments');
    return response.data;
  },
  
  simulate: async (avatarId: string, garmentId: string, garmentSize: string) => {
    const response = await api.post('/tryon/simulate', {
      avatar_id: avatarId,
      garment_id: garmentId,
      garment_size: garmentSize,
    });
    return response.data;
  },
};

export const demoApi = {
  submitRequest: async (data: DemoRequest): Promise<DemoResponse> => {
    const response = await api.post('/demo/request', data);
    return response.data;
  },
};

export default api;
