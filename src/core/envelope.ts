export const MAX_CHECK_FILES = 500

export type ApiEnvelope<T> = {
  success: boolean
  data: T | null
  error: string | null
}

export function ok<T>(data: T): ApiEnvelope<T> {
  return { success: true, data, error: null }
}

export function fail(error: string): ApiEnvelope<null> {
  return { success: false, data: null, error }
}
