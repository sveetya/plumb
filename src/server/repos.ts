export type RegisteredRepo = {
  id: string
  label: string
  github: string
}

const REPOS: Record<string, RegisteredRepo> = {
  umami: {
    id: "umami",
    label: "umami-software/umami",
    github: "umami-software/umami",
  },
}

export function getRepo(id: string): RegisteredRepo | undefined {
  return REPOS[id]
}

export function listRepos(): RegisteredRepo[] {
  return Object.values(REPOS)
}

export class UnknownRepoError extends Error {
  readonly status = 404

  constructor(repoId: string) {
    super(`Unknown repo: ${repoId}`)
    this.name = "UnknownRepoError"
  }
}
