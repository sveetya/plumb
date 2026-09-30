"""Apply check_runs SQL using gitignored .env.local. Do not print secrets."""

from __future__ import annotations

import sys
from pathlib import Path
from urllib.parse import quote

ROOT = Path(__file__).resolve().parents[1]
SQL_PATH = ROOT / "supabase" / "migrations" / "0001_check_runs.sql"
ENV_PATH = ROOT / ".env.local"


def read_env(path: Path) -> dict[str, str]:
    if not path.exists():
        raise SystemExit("missing .env.local")
    result: dict[str, str] = {}
    for line in path.read_text(encoding="utf-8").splitlines():
        trimmed = line.strip()
        if not trimmed or trimmed.startswith("#") or "=" not in trimmed:
            continue
        key, value = trimmed.split("=", 1)
        result[key.strip()] = value.strip()
    return result


def project_ref(env: dict[str, str]) -> str:
    url = env.get("NEXT_PUBLIC_SUPABASE_URL", "")
    if "://" not in url:
        raise SystemExit("NEXT_PUBLIC_SUPABASE_URL is missing")
    host = url.split("://", 1)[1].split("/", 1)[0]
    return host.split(".")[0]


def candidate_urls(project: str, password: str) -> list[str]:
    encoded = quote(password, safe="")
    prefixes = ("aws-1", "aws-0")
    regions = (
        "eu-central-1",
        "eu-west-1",
        "eu-west-2",
        "us-east-1",
        "us-west-1",
        "ap-southeast-1",
    )
    urls: list[str] = []
    for prefix in prefixes:
        for region in regions:
            host = f"{prefix}-{region}.pooler.supabase.com"
            urls.append(
                f"postgresql://postgres.{project}:{encoded}@{host}:6543/postgres"
            )
    return urls


def apply_sql(project: str, password: str) -> str:
    try:
        import psycopg
    except ImportError as exc:
        raise SystemExit("psycopg is not installed") from exc
    sql = SQL_PATH.read_text(encoding="utf-8")
    last_error = "none"
    for url in candidate_urls(project, password):
        host = url.split("@", 1)[1].split("/", 1)[0]
        try:
            with psycopg.connect(url, connect_timeout=8, sslmode="require") as conn:
                conn.execute(sql)
                conn.commit()
            return host
        except Exception as exc:  # noqa: BLE001
            last_error = f"{type(exc).__name__}"
            continue
    raise SystemExit(f"all connection attempts failed; last={last_error}")


if __name__ == "__main__":
    env = read_env(ENV_PATH)
    password = env.get("SUPABASE_DB_PASSWORD", "")
    if not password:
        raise SystemExit("SUPABASE_DB_PASSWORD missing from .env.local")
    host = apply_sql(project_ref(env), password)
    print("migration_applied")
    print("host_ok")
