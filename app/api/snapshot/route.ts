import { NextResponse } from "next/server"
import { fail, ok } from "@/src/core/envelope"
import { publishedSnapshot } from "@/src/server/published-snapshot"
import { UnknownRepoError } from "@/src/server/repos"

export const runtime = "nodejs"

export async function GET(request: Request) {
  try {
    const repo = new URL(request.url).searchParams.get("repo")?.trim() || "umami"
    const data = publishedSnapshot()
    if (repo !== data.repo.id) {
      throw new UnknownRepoError(repo)
    }
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
