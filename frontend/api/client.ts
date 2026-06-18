import { handleResponse } from "@/utils/handle-response"

const baseUrl = process.env.NEXT_PUBLIC_API_URL

type FetchOptions = Omit<RequestInit, "method" | "body">

interface Fetcher {
  get<T>(url: string, options?: FetchOptions): Promise<T>
  post<T>(url: string, data?: unknown, options?: FetchOptions): Promise<T>
  put<T>(url: string, data?: unknown, options?: FetchOptions): Promise<T>
  patch<T>(url: string, data?: unknown, options?: FetchOptions): Promise<T>
  delete<T>(url: string, options?: FetchOptions): Promise<T>
}

const JSON_HEADERS: HeadersInit = {
  "Content-Type": "application/json",
}

function buildRequest(
  method: string,
  options: FetchOptions,
  data?: unknown
): RequestInit {
  const hasBody = data !== undefined
  return {
    ...options,
    method,
    headers: {
      ...(hasBody ? JSON_HEADERS : {}),
      ...options.headers,
    },
    ...(hasBody ? { body: JSON.stringify(data) } : {}),
  }
}

const apiClient: Fetcher = {
  get: <T>(url: string, options: FetchOptions = {}) =>
    fetch(`${baseUrl}${url}`, buildRequest("GET", options)).then(
      (res) => handleResponse(res) as Promise<T>
    ),

  post: <T>(url: string, data?: unknown, options: FetchOptions = {}) =>
    fetch(`${baseUrl}${url}`, buildRequest("POST", options, data)).then(
      (res) => handleResponse(res) as Promise<T>
    ),

  put: <T>(url: string, data?: unknown, options: FetchOptions = {}) =>
    fetch(`${baseUrl}${url}`, buildRequest("PUT", options, data)).then(
      (res) => handleResponse(res) as Promise<T>
    ),

  patch: <T>(url: string, data?: unknown, options: FetchOptions = {}) =>
    fetch(`${baseUrl}${url}`, buildRequest("PATCH", options, data)).then(
      (res) => handleResponse(res) as Promise<T>
    ),

  delete: <T>(url: string, options: FetchOptions = {}) =>
    fetch(`${baseUrl}${url}`, buildRequest("DELETE", options)).then(
      (res) => handleResponse(res) as Promise<T>
    ),
}

export default apiClient
