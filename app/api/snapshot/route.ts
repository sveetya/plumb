import { NextResponse } from "next/server"
import { fail, ok } from "@/src/core/envelope"
import { loadConfig } from "@/src/server/config"
import { UnknownRepoError } from "@/src/server/repos"
import { buildRepoSnapshot } from "@/src/server/snapshot"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const repo = new URL(request.url).searchParams.get("repo") ?? ""
    const data = buildRepoSnapshot(repo, loadConfig())
    return NextResponse.json(ok(data))
  } catch (error) {
    if (error instanceof UnknownRepoError) {
      return NextResponse.json(fail(error.message), { status: 404 })
    }
    console.error("GET /api/snapshot failed", error)
    const message = error instanceof Error ? error.message : "Snapshot failed"
    return NextResponse.json(fail(message), { status: 500 })
  }
}
