import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import type { PlumbConfig } from "./config"

export function canInsertRuns(config: PlumbConfig): boolean {
  return Boolean(config.supabaseUrl && config.supabaseSecretKey)
}

export function canReadRuns(config: PlumbConfig): boolean {
  return Boolean(config.supabaseUrl && config.supabasePublishableKey)
}

export function createSecretClient(config: PlumbConfig): SupabaseClient {
  if (!config.supabaseUrl || !config.supabaseSecretKey) {
    throw new Error("Supabase secret client is not configured")
  }
  return createClient(config.supabaseUrl, config.supabaseSecretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

export function createAnonClient(config: PlumbConfig): SupabaseClient {
  if (!config.supabaseUrl || !config.supabasePublishableKey) {
    throw new Error("Supabase anon client is not configured")
  }
  return createClient(config.supabaseUrl, config.supabasePublishableKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
