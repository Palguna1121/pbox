import "server-only";

/** Base URL of scripts/booth-agent.mjs, or null when no booth hardware is configured. */
export function boothAgentUrl(): string | null {
  const url = process.env.BOOTH_AGENT_URL?.trim();
  return url ? url.replace(/\/+$/, "") : null;
}

export function boothFetch(path: string, init: RequestInit & { timeoutMs?: number } = {}) {
  const base = boothAgentUrl();
  if (!base) throw new Error("BOOTH_AGENT_URL belum diatur");
  const { timeoutMs = 10_000, headers, ...rest } = init;
  const merged = new Headers(headers);
  if (process.env.BOOTH_AGENT_TOKEN) merged.set("x-booth-token", process.env.BOOTH_AGENT_TOKEN);
  return fetch(`${base}${path}`, {
    ...rest,
    headers: merged,
    cache: "no-store",
    signal: AbortSignal.timeout(timeoutMs),
  });
}

export function boothDisabled() {
  return Response.json({ enabled: false, error: "Booth agent tidak dikonfigurasi" }, { status: 503 });
}

export function boothError(error: unknown) {
  const timedOut = error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError");
  return Response.json(
    { error: timedOut ? "Booth agent tidak merespons" : "Booth agent tidak dapat dihubungi" },
    { status: timedOut ? 504 : 502 },
  );
}

/** Pass an agent image response through without caching. */
export async function passImage(res: Response) {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    return Response.json({ error: body.error ?? "Kamera booth gagal" }, { status: res.status });
  }
  return new Response(res.body, {
    headers: {
      "Content-Type": res.headers.get("content-type") ?? "image/jpeg",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
