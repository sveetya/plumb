import { NextResponse } from "next/server"
import { fail, ok } from "@/src/core/envelope"
import { loadConfig } from "@/src/server/config"
import {
  checkSourceSchema,
  fixtureNameSchema,
  intentIdSchema,
  runPlumbCheck,
} from "@/src/server/run-check"
import { z } from "zod"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const bodySchema = z
  .object({
    intent: intentIdSchema.default("bot-ingest"),
    source: checkSourceSchema,
    fixture: fixtureNameSchema.optional(),
  })
  .refine((value) => value.source !== "fixture" || Boolean(value.fixture), {
    message: "fixture is required when source is fixture",
  })

export async function POST(request: Request) {
  try {
    const json: unknown = await request.json()
    const body = bodySchema.parse(json)
    const data = await runPlumbCheck({
      config: loadConfig(),
      intentId: body.intent,
      source: body.source,
      fixture: body.fixture,
    })
    return NextResponse.json(ok(data))
  } catch (error) {
    return jsonError(error)
  }
}

function jsonError(error: unknown) {
  if (error instanceof z.ZodError) {
    return NextResponse.json(fail(error.issues[0]?.message ?? "Invalid request"), {
      status: 400,
    })
  }
  console.error("POST /api/check failed", error)
  const message = error instanceof Error ? error.message : "Check failed"
  return NextResponse.json(fail(message), { status: 500 })
}
