import type { PatternId } from "./types"

export type PatternLearnMore = Readonly<{
  href: string
  label: string
}>

export type PatternExplanation = Readonly<{
  hint: string
  summary: string
  learnMore?: PatternLearnMore
}>

export const PATTERN_EXPLANATIONS: Record<PatternId, PatternExplanation> = {
  "modular-monolith": {
    hint: "Plumb found one deployable app with several modules inside it.",
    summary:
      "A modular monolith is still one service, split by folders instead of by network. You keep a single deploy while the map can name the parts that would otherwise hide in one blob.",
    learnMore: {
      href: "https://en.wikipedia.org/wiki/Monolithic_application",
      label: "Monolithic application on Wikipedia",
    },
  },
  "next-app-router": {
    hint: "Plumb saw App Router pages and route handlers.",
    summary:
      "App Router puts screens in page files and APIs in route files under one app tree. That is how this repo splits the dashboard from the HTTP surface you inspect on the map.",
  },
  "route-groups": {
    hint: "Route groups split the app tree into separate surfaces.",
    summary:
      "Route groups are folders in parentheses that do not appear in the URL. Here they keep collect traffic and the dashboard in different trees so the map can tell those surfaces apart.",
  },
  "route-handler-bff": {
    hint: "The UI talks to same-origin route handlers instead of a separate API host.",
    summary:
      "A backend for frontend sits next to the page and serves the browser on the same origin. You avoid a second public API host for dashboard calls, and those handlers show up as ingest, analytics, and platform APIs.",
    learnMore: {
      href: "https://en.wikipedia.org/wiki/Backend_for_frontend",
      label: "Backend for frontend on Wikipedia",
    },
  },
  "repository-query-layer": {
    hint: "Data access lives under a dedicated queries folder.",
    summary:
      "A repository layer hides storage behind named query modules. HTTP routes then stay thin, and the map can pin reads and writes on that layer instead of on every handler.",
    learnMore: {
      href: "https://en.wikipedia.org/wiki/Data_access_object",
      label: "Data access object on Wikipedia",
    },
  },
  "verb-split-queries": {
    hint: "Writes and reads share one query module but split by verb in the filename.",
    summary:
      "Save and create functions sit beside get functions in the same queries tree. You still share the module, while the map can color writes and analytics reads as different jobs.",
  },
  "dual-store": {
    hint: "Plumb found both Prisma Postgres and ClickHouse in this repo.",
    summary:
      "A dual store keeps operational records in one database and analytics events in another. You pay for two schemas so dashboard entities and high-volume events do not share the same engine.",
  },
  "env-store-dispatch": {
    hint: "One database helper chooses Postgres or ClickHouse from the environment.",
    summary:
      "Runtime flags send the same query helper down different drivers. That lets you swap stores without rewriting callers, which is why so many paths funnel through one dispatch file.",
  },
  "optional-event-stream": {
    hint: "Kafka is present as an optional client, not a required hop.",
    summary:
      "An event stream can sit beside the databases when you enable it. The map shows Kafka as a node you can use, without pretending every request already goes through the broker.",
    learnMore: {
      href: "https://en.wikipedia.org/wiki/Apache_Kafka",
      label: "Apache Kafka on Wikipedia",
    },
  },
  "embeddable-tracker": {
    hint: "The tracker is a separate bundle, not just a page script.",
    summary:
      "An embeddable tracker is a small bundle sites include on their own origin. Building it apart from the app keeps that snippet small and makes the tracker a first-class node on the map.",
  },
  "schema-migrations": {
    hint: "Schema files and migration scripts change the databases together.",
    summary:
      "Schema-first migrations describe the target shape, then apply ordered scripts to reach it. You can replay that history instead of editing live tables by hand.",
    learnMore: {
      href: "https://en.wikipedia.org/wiki/Schema_migration",
      label: "Schema migration on Wikipedia",
    },
  },
  "container-deploy": {
    hint: "The repo ships both a container image and a PaaS config.",
    summary:
      "A container describes how the process runs, while a PaaS file describes how a host runs it. Having both means you can land the same app in more than one environment.",
  },
  "collect-plane": {
    hint: "Several ingest routes skip session auth so browsers can send events.",
    summary:
      "A collect plane is the unauthenticated edge that receives tracker traffic. You keep it small and loud on the map because those routes must stay reachable from any site.",
  },
  "three-collectors": {
    hint: "Website, link, and pixel each have their own collect path.",
    summary:
      "One product can ingest from a script, a redirect link, and a tracking pixel. Separate collectors share send logic while letting you see each entry on the map.",
  },
  "batch-fan-in": {
    hint: "The batch route reuses the send handler instead of a second ingest path.",
    summary:
      "Fan-in means many events arrive together and then follow the same send path. You keep one set of rules for validation and storage, even when the client batches.",
  },
  "session-replay-sidecar": {
    hint: "Session replay is a sidecar bundle with its own record route.",
    summary:
      "A sidecar is a second client build that records the session and posts it aside from pageview ingest. Replay cost then only hits sites that opt in, instead of riding along with every tracker.",
  },
  "bot-gate": {
    hint: "Ingest checks for bots before it writes an event.",
    summary:
      "A bot gate drops crawler traffic at the door of send and record. That keeps analytics counts closer to human visits without pushing the check into every query.",
  },
  "geo-enrichment": {
    hint: "Ingest looks up location with a local GeoIP database.",
    summary:
      "GeoIP enrichment attaches country and city from the request address. Doing it locally avoids a third-party lookup on every collect hit.",
  },
  "oltp-olap": {
    hint: "Prisma owns entities while SQL files own analytics reads.",
    summary:
      "OLTP stores the records you edit, and OLAP stores the events you scan. Splitting those query trees keeps website settings off the heavy analytics path.",
    learnMore: {
      href: "https://en.wikipedia.org/wiki/Online_analytical_processing",
      label: "OLAP on Wikipedia",
    },
  },
  "analytics-modules": {
    hint: "Funnels, retention, and other capabilities each have their own SQL module.",
    summary:
      "Feature modules group analytics queries by product question, not by table. You can open one folder and see the whole capability the API exposes.",
  },
  "read-replica": {
    hint: "Prisma can send reads to an optional Postgres replica.",
    summary:
      "A read replica is a copy of the primary that serves queries. You keep writes on the source of truth and shed dashboard load when the replica is configured.",
    learnMore: {
      href: "https://en.wikipedia.org/wiki/Replication_(computing)",
      label: "Replication on Wikipedia",
    },
  },
  "redis-cache": {
    hint: "Redis is wired for cache and rate limits, not as the system of record.",
    summary:
      "A cache sits in front of slower stores and can also count requests. Optional Redis means those jobs exist in the code without forcing every deploy to run a cache node.",
    learnMore: {
      href: "https://en.wikipedia.org/wiki/Cache_(computing)",
      label: "Cache on Wikipedia",
    },
  },
  "resource-authz": {
    hint: "API routes check website-scoped permissions before they return data.",
    summary:
      "Authorization decides what a signed-in actor may touch. Scoping that to a website keeps one tenant from reading another tenant's stats.",
    learnMore: {
      href: "https://en.wikipedia.org/wiki/Authorization",
      label: "Authorization on Wikipedia",
    },
  },
  "multi-credential": {
    hint: "Auth accepts a session, an API key, a share token, and a second factor.",
    summary:
      "Different clients prove themselves in different ways. One auth module still owns the rules, so the map can treat login as a single node with several entry methods.",
  },
  "in-process-mcp": {
    hint: "The MCP package calls the app inside the same process, not a second server.",
    summary:
      "A facade presents a simpler interface over work the app already does. Here the MCP route reuses platform and analytics handlers without standing up another service.",
    learnMore: {
      href: "https://refactoring.guru/design-patterns/facade",
      label: "Facade on Refactoring Guru",
    },
  },
  "generated-contracts": {
    hint: "OpenAPI is generated into a typed client instead of written by hand.",
    summary:
      "A contract file is the shared description of the HTTP API. Generating it keeps the dashboard client and the routes from drifting apart in silence.",
    learnMore: {
      href: "https://en.wikipedia.org/wiki/OpenAPI_Specification",
      label: "OpenAPI Specification on Wikipedia",
    },
  },
  "polled-realtime": {
    hint: "Realtime is a JSON poll, not a push socket.",
    summary:
      "The dashboard asks for a fresh snapshot on an interval. That is simpler to host than a socket, and the map can treat realtime as another analytics read.",
  },
  "collect-edge": {
    hint: "A proxy rewrites collect paths and sets CORS for the tracker.",
    summary:
      "Browsers will not send events across origins unless the edge allows it. Path rewrite plus CORS keeps the public collect URL stable while the app route can live elsewhere.",
    learnMore: {
      href: "https://en.wikipedia.org/wiki/Cross-origin_resource_sharing",
      label: "CORS on Wikipedia",
    },
  },
  "public-share": {
    hint: "A share page can show stats without a full dashboard login.",
    summary:
      "Public share issues a constrained token for a read-only surface. You can send a link without handing over the rest of the account.",
  },
  "zod-boundary": {
    hint: "Route handlers validate input with Zod before they touch storage.",
    summary:
      "A schema at the HTTP boundary rejects bad payloads in one place. You keep that check out of query files so the map can show validation as part of the API nodes.",
    learnMore: {
      href: "https://en.wikipedia.org/wiki/Data_validation",
      label: "Data validation on Wikipedia",
    },
  },
  "env-switches": {
    hint: "ClickHouse, Kafka, Redis, and the replica each switch on from the environment.",
    summary:
      "Strategy here means picking an implementation at runtime from config. Optional stores stay in the codebase, and you turn them on per deploy instead of forking the app.",
    learnMore: {
      href: "https://refactoring.guru/design-patterns/strategy",
      label: "Strategy on Refactoring Guru",
    },
  },
  "client-state-split": {
    hint: "The UI store holds local state while a server cache holds API data.",
    summary:
      "Local store is for what the user is doing in the page. Server cache is for what the API last returned, so the dashboard does not mix those lifetimes.",
  },
  "i18n-catalog": {
    hint: "UI strings live in a message catalog instead of inside components.",
    summary:
      "A message catalog keeps copy in one place so you can translate it. The dashboard then loads the right language without forking screens.",
    learnMore: {
      href: "https://en.wikipedia.org/wiki/Internationalization_and_localization",
      label: "Internationalization on Wikipedia",
    },
  },
  "cloud-entitlements": {
    hint: "Subscription code enforces plan limits for the hosted product.",
    summary:
      "Entitlements are the features a plan is allowed to use. Keeping them in one module makes cloud limits visible instead of scattering checks through routes.",
  },
  "health-probe": {
    hint: "A heartbeat route tells the host whether the process is alive.",
    summary:
      "Orchestrators poll a cheap endpoint instead of guessing from logs. Compose can point that probe at the same heartbeat the app exposes.",
    learnMore: {
      href: "https://en.wikipedia.org/wiki/Heartbeat_(computing)",
      label: "Heartbeat on Wikipedia",
    },
  },
}

export function getPatternExplanation(id: PatternId): PatternExplanation {
  return PATTERN_EXPLANATIONS[id]
}
