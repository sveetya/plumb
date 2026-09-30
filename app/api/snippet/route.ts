import { NextResponse } from "next/server"
import { fail, ok } from "@/src/core/envelope"
import { renderAgentSnippet } from "@/src/core/snippet"
import { loadConfig } from "@/src/server/config"
import { loadIntent, loadModel } from "@/src/server/load"
import { intentIdSchema } from "@/src/server/run-check"
import { z } from "zod"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const intentId = intentIdSchema.parse(
      url.searchParams.get("intent") ?? "bot-ingest",
    )
    const config = loadConfig()
    const model = loadModel(config.archDir)
    const intent = loadIntent(config.archDir, intentId)
    return NextResponse.json(
      ok({ markdown: renderAgentSnippet(intent, model), intentId }),
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(fail(error.issues[0]?.message ?? "Invalid intent"), {
        status: 400,
      })
    }
    console.error("GET /api/snippet failed", error)
    const message = error instanceof Error ? error.message : "Snippet failed"
    return NextResponse.json(fail(message), { status: 500 })
  }
}
