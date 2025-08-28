import axios from 'axios'
import { mockApiService } from './mockApi'

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
})

// Check if we're in development mode and should use mock data
const isDevelopment = import.meta.env.MODE === 'development'
const useMockData = isDevelopment && import.meta.env.VITE_USE_MOCK_DATA !== 'false'

// Create a wrapper that tries real API first, falls back to mock data in development
const createApiMethod = <T>(realApiCall: () => Promise<T>, mockApiCall: () => Promise<T>) => {
  return async (): Promise<T> => {
    if (useMockData) {
      return mockApiCall()
    }

    try {
      return await realApiCall()
    } catch (error) {
      // In development, fall back to mock data if real API fails
      if (isDevelopment) {
        console.warn('API call failed, falling back to mock data:', error)
        return mockApiCall()
      }
      throw error
    }
  }
}

export const apiService = {
  // Dashboard data
  getDashboard: createApiMethod(
    () => api.get('/dashboard').then(res => res.data),
    mockApiService.getDashboard
  ),

  // Containers
  getContainers: createApiMethod(
    () => api.get('/containers').then(res => res.data),
    mockApiService.getContainers
  ),

  // Images
  getImages: createApiMethod(
    () => api.get('/images').then(res => res.data),
    mockApiService.getImages
  ),

  // Volumes
  getVolumes: createApiMethod(
    () => api.get('/volumes').then(res => res.data),
    mockApiService.getVolumes
  ),

  // Cache
  getCache: createApiMethod(
    () => api.get('/build-cache').then(res => res.data),
    mockApiService.getCache
  ),

  // Container logs
  getLogs: createApiMethod(
    () => api.get('/logs').then(res => res.data),
    mockApiService.getLogs
  ),

  // Bind mounts
  getBindMounts: createApiMethod(
    () => api.get('/bind-mounts').then(res => res.data),
    mockApiService.getBindMounts
  ),

  // Overlay2 data
  getOverlay2: createApiMethod(
    () => api.get('/overlay2').then(res => res.data),
    mockApiService.getOverlay2
  ),

  // Container logs (real-time from Docker API)
  getContainerLogs: (containerId: string, lines: number = 100) => {
    if (useMockData) {
      return mockApiService.getContainerLogs(containerId, lines)
    }
    return api.get(`/container-logs/${containerId}?lines=${lines}`).then(res => res.data)
  },

  // System information
  getSystemInfo: createApiMethod(
    () => api.get('/system-info').then(res => res.data),
    mockApiService.getSystemInfo
  ),

  // Docker daemon ping
  pingDocker: createApiMethod(
    () => api.get('/system-ping').then(res => res.data),
    mockApiService.pingDocker
  ),

  // Docker authentication check
  checkAuth: createApiMethod(
    () => api.get('/system-auth').then(res => res.data),
    mockApiService.checkAuth
  ),

  // Docker events
  getEvents: createApiMethod(
    () => api.get('/events').then(res => res.data),
    mockApiService.getEvents
  ),

  // Trigger scan
  triggerScan: createApiMethod(
    () => api.post('/scan').then(res => res.data),
    mockApiService.triggerScan
  ),
}
