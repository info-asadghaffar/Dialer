import axios, { AxiosInstance, AxiosResponse } from 'axios'

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000/api/v1'

/**
 * Global Axios Instance
 */
export const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request Interceptor
api.interceptors.request.use(
  (config) => {
    if (__DEV__) {
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`)
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response Interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.error?.message || error.message || 'API Error'
    console.error(`[API Error] ${message}`)
    return Promise.reject(new Error(message))
  }
)

/**
 * Generic GET helper
 */
export async function get<T>(url: string, params?: Record<string, any>): Promise<T> {
  const response: AxiosResponse<{ data: T }> = await api.get(url, { params })
  return response.data.data
}

/**
 * Generic POST helper
 */
export async function post<T>(url: string, body?: any): Promise<T> {
  const response: AxiosResponse<{ data: T }> = await api.post(url, body)
  return response.data.data
}

/**
 * Generic DELETE helper
 */
export async function del<T>(url: string): Promise<T> {
  const response: AxiosResponse<{ data: T }> = await api.delete(url)
  return response.data.data
}
