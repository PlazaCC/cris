import axios from 'axios'

const isDevMode = import.meta.env.VITE_DEV_MODE === 'true'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_STRAPI_API_URL || 'http://localhost:1337',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth token if available
if (import.meta.env.VITE_STRAPI_API_TOKEN) {
  apiClient.defaults.headers.common['Authorization'] =
    `Bearer ${import.meta.env.VITE_STRAPI_API_TOKEN}`
}

// Request interceptor for logging in development
if (isDevMode) {
  apiClient.interceptors.request.use(
    (config) => {
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`)
      return config
    },
    (error) => {
      console.error('[API Request Error]', error)
      return Promise.reject(error)
    }
  )
}

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    if (isDevMode) {
      console.log(`[API Response] ${response.config.url}`, response.data)
    }
    return response
  },
  (error) => {
    if (isDevMode) {
      console.error('[API Response Error]', {
        url: error.config?.url,
        status: error.response?.status,
        message: error.response?.data?.error?.message || error.message,
      })
    }

    // Handle common errors
    if (error.response?.status === 401 && isDevMode) {
      console.warn('Unauthorized request - check API token')
    }

    if (error.response?.status === 403 && isDevMode) {
      console.warn('Forbidden - check Strapi permissions for public access')
    }

    if (error.response?.status === 404 && isDevMode) {
      console.warn('Resource not found')
    }

    return Promise.reject(error)
  }
)

export { apiClient }
