import axios from "axios"

/**
 * Axios instance med basis konfiguration
 *
 * Vite proxyer /api requests til backend (se vite.config.ts)
 */
export const api = axios.create({
  baseURL: "/",
  headers: {
    "Content-Type": "application/json",
  },
})

// Request interceptor (til auth, logging, etc.)
api.interceptors.request.use(
  (config) => {
    // Tilføj auth token hvis relevant:
    // const token = localStorage.getItem("token")
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`
    // }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor (til error handling)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log fejl til konsol i development
    if (import.meta.env.DEV) {
      console.error("API Error:", error.response?.data ?? error.message)
    }

    // Håndter specifik fejl her hvis nødvendigt
    // if (error.response?.status === 401) {
    //   // Redirect til login
    // }

    return Promise.reject(error)
  }
)
