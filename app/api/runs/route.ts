import { NextResponse } from "next/server"
import { fail, ok } from "@/src/core/envelope"
import { loadConfig } from "@/src/server/config"
import { listCheckRuns } from "@/src/server/runs"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const result = await listCheckRuns(loadConfig())
    return NextResponse.json(ok(result))
  } catch (error) {
    console.error("GET /api/runs failed", error)
    const message = error instanceof Error ? error.message : "Runs failed"
    return NextResponse.json(fail(message), { status: 500 })
  }
}
