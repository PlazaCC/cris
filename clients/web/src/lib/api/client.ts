import axios from 'axios'

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
if (import.meta.env.VITE_DEV_MODE === 'true') {
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
    if (import.meta.env.VITE_DEV_MODE === 'true') {
      console.log(`[API Response] ${response.config.url}`, response.data)
    }
    return response
  },
  (error) => {
    console.error('[API Response Error]', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.response?.data?.error?.message || error.message,
    })

    // Handle common errors
    if (error.response?.status === 401) {
      console.warn('Unauthorized request - check API token')
    }

    if (error.response?.status === 403) {
      console.warn('Forbidden - check Strapi permissions for public access')
    }

    if (error.response?.status === 404) {
      console.warn('Resource not found')
    }

    return Promise.reject(error)
  }
)

export { apiClient }
