import axios from "axios";

export interface Transaction {
  id: string;
  amount: number;
  currency: string;
  status: "completed" | "pending" | "failed";
  timestamp: string;
  description: string;
  merchant: { name: string; id: string };
  payment_method: { type: string; last4: string; brand: string };
  sender: { name: string; account_id: string };
  receiver: { name: string; account_id: string };
  fees: { processing_fee: number; currency: string };
  metadata: { order_id: string; customer_id: string };
}

// Create Axios instance
export const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Add auth token if available (e.g., from localStorage or Redux)
    // const token = localStorage.getItem("token");
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle global errors (e.g., 401, 500)
    if (error.response?.status === 401) {
      // Handle unauthorized (e.g., redirect to login)
      console.error("Unauthorized request");
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
