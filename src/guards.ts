/**
 * Type Guards
 *
 * Runtime type checking functions for API responses and other types.
 * Uses TypeScript type predicates to enable type narrowing.
 *
 * Used by both job-finder-FE and job-finder-BE for runtime validation.
 */

import type { ApiResponse, ApiSuccessResponse, ApiErrorResponse } from "./api.types"

/**
 * Type guard to check if API response is successful
 * Uses discriminated union property 'success'
 *
 * @example
 * const response = await apiCall()
 * if (isApiSuccess(response)) {
 *   // response.data is typed correctly here
 *   console.log(response.data)
 * }
 */
export function isApiSuccess<T>(
  response: ApiResponse<T>
): response is ApiSuccessResponse<T> {
  return response.success === true
}

/**
 * Type guard to check if API response is an error
 * Uses discriminated union property 'success'
 *
 * @example
 * const response = await apiCall()
 * if (isApiError(response)) {
 *   // response.error is typed correctly here
 *   console.error(response.error.message)
 * }
 */
export function isApiError<T>(
  response: ApiResponse<T>
): response is ApiErrorResponse {
  return response.success === false
}

/**
 * Type guard to check if value is a valid API response
 * Validates the discriminated union structure
 *
 * @example
 * const data = JSON.parse(responseBody)
 * if (isApiResponse(data)) {
 *   // data is typed as ApiResponse<unknown>
 * }
 */
export function isApiResponse(value: unknown): value is ApiResponse<unknown> {
  if (!value || typeof value !== "object") {
    return false
  }

  const obj = value as Record<string, unknown>

  // Check for success discriminator
  if (typeof obj.success !== "boolean") {
    return false
  }

  // Validate success response structure
  if (obj.success === true) {
    return "data" in obj
  }

  // Validate error response structure
  if (obj.success === false) {
    if (!obj.error || typeof obj.error !== "object") {
      return false
    }

    const error = obj.error as Record<string, unknown>
    return typeof error.code === "string" && typeof error.message === "string"
  }

  return false
}

/**
 * Type guard to check if error has a specific error code
 * Useful for handling specific error cases
 *
 * @example
 * if (isApiError(response) && hasErrorCode(response, 'NOT_FOUND')) {
 *   // Handle not found error
 * }
 */
export function hasErrorCode(
  response: ApiErrorResponse,
  code: string
): boolean {
  return response.error.code === code
}

/**
 * Type guard to check if value is a Date object
 * Useful for validating timestamp fields
 */
export function isDate(value: unknown): value is Date {
  return value instanceof Date && !isNaN(value.getTime())
}

/**
 * Type guard to check if value is a valid ISO date string
 * Useful for validating date string fields from API
 */
export function isISODateString(value: unknown): value is string {
  if (typeof value !== "string") {
    return false
  }

  const date = new Date(value)
  return !isNaN(date.getTime()) && date.toISOString() === value
}

/**
 * Type guard to check if value is a non-empty string
 * Useful for validating required string fields
 */
export function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0
}

/**
 * Type guard to check if value is a non-empty array
 * Useful for validating required array fields
 */
export function isNonEmptyArray<T>(value: unknown): value is T[] {
  return Array.isArray(value) && value.length > 0
}

/**
 * Type guard to check if value is a valid URL string
 * Useful for validating URL fields
 */
export function isValidUrl(value: unknown): value is string {
  if (typeof value !== "string") {
    return false
  }

  try {
    // Use a simple regex pattern instead of URL constructor for Node.js compatibility
    const urlPattern = /^https?:\/\/.+/
    return urlPattern.test(value)
  } catch {
    return false
  }
}

/**
 * Type guard to check if value is a valid email string
 * Useful for validating email fields
 */
export function isValidEmail(value: unknown): value is string {
  if (typeof value !== "string") {
    return false
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(value)
}

/**
 * Helper function to create a success response
 * Ensures type safety when building API responses
 */
export function createSuccessResponse<T>(
  data: T,
  message?: string
): ApiSuccessResponse<T> {
  return {
    success: true,
    data,
    ...(message && { message }),
  }
}

/**
 * Helper function to create an error response
 * Ensures type safety when building API error responses
 */
export function createErrorResponse(
  code: string,
  message: string,
  details?: Record<string, unknown>
): ApiErrorResponse {
  return {
    success: false,
    error: {
      code,
      message,
      ...(details && { details }),
    },
  }
}
