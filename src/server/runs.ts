import type { CheckCounts, CheckRunRow, FileVerdict } from "../core/types"
import type { PlumbConfig } from "./config"
import { canInsertRuns, canReadRuns, createAnonClient, createSecretClient } from "./supabase"

export type CheckRunInsert = {
  intent_id: string
  target_repo: string
  git_head: string | null
  source: string
  model_hash: string
  intent_hash: string
  pass: boolean
  counts: CheckCounts
  files: FileVerdict[]
}

export async function insertCheckRun(
  config: PlumbConfig,
  row: CheckRunInsert,
): Promise<{ saved: boolean; error?: string }> {
  if (!canInsertRuns(config)) {
    return { saved: false }
  }
  const client = createSecretClient(config)
  const { error } = await client.from("check_runs").insert(row)
  if (error) {
    console.error("supabase insert failed", error)
    return { saved: false, error: error.message }
  }
  return { saved: true }
}

export async function listCheckRuns(
  config: PlumbConfig,
): Promise<{ available: boolean; runs: CheckRunRow[]; error?: string }> {
  if (!canReadRuns(config)) {
    return { available: false, runs: [] }
  }
  const client = createAnonClient(config)
  const { data, error } = await client
    .from("check_runs")
    .select(
      "id, created_at, intent_id, target_repo, git_head, source, model_hash, intent_hash, pass, counts, files",
    )
    .order("created_at", { ascending: false })
    .limit(20)
  if (error) {
    console.error("supabase list failed", error)
    return { available: false, runs: [], error: error.message }
  }
  return { available: true, runs: (data ?? []) as CheckRunRow[] }
}
