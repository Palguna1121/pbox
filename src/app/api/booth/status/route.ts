import { boothAgentUrl, boothFetch } from "@/lib/booth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!boothAgentUrl()) return Response.json({ enabled: false }, { headers: { "Cache-Control": "no-store" } });

  try {
    const res = await boothFetch("/status", { timeoutMs: 5_000 });
    const status = await res.json();
    if (!res.ok) return Response.json({ enabled: true, error: status.error ?? `Agent HTTP ${res.status}` });
    return Response.json({ enabled: true, ...status }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json(
      { enabled: true, error: "Booth agent tidak dapat dihubungi" },
      { headers: { "Cache-Control": "no-store" } },
    );
  }
}
