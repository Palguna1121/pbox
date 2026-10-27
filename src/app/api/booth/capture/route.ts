import { boothAgentUrl, boothDisabled, boothError, boothFetch, passImage } from "@/lib/booth";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!boothAgentUrl()) return boothDisabled();
  const limit = rateLimit(request, { name: "booth-capture", limit: 30, windowMs: 60_000 });
  if (!limit.ok) {
    return Response.json({ error: "Terlalu banyak permintaan" }, { status: 429, headers: { "Retry-After": String(limit.retryAfter) } });
  }
  try {
    return await passImage(await boothFetch("/capture", { method: "POST", timeoutMs: 35_000 }));
  } catch (error) {
    return boothError(error);
  }
}
