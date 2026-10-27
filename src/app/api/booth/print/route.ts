import { z } from "zod";
import { getAuthSession } from "@/lib/auth";
import { boothAgentUrl, boothDisabled, boothError, boothFetch } from "@/lib/booth";
import { rateLimit } from "@/lib/rate-limit";
import { keyFromMediaUrl, readStoredFile } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({
  imageUrl: z.string().min(1).max(1024),
  copies: z.number().int().min(1).max(10).optional(),
  media: z
    .string()
    .regex(/^[A-Za-z0-9_.\-]{1,64}$/)
    .optional(),
});

export async function POST(request: Request) {
  if (!boothAgentUrl()) return boothDisabled();

  if (process.env.BOOTH_PUBLIC_PRINT !== "true") {
    const session = await getAuthSession();
    if (!session?.user?.id) return Response.json({ error: "Masuk dulu untuk mencetak" }, { status: 401 });
  }

  const limit = rateLimit(request, { name: "booth-print", limit: 10, windowMs: 10 * 60_000 });
  if (!limit.ok) {
    return Response.json({ error: "Terlalu banyak cetakan" }, { status: 429, headers: { "Retry-After": String(limit.retryAfter) } });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Data cetak tidak valid" }, { status: 400 });

  // Only files from our own storage can be printed; no arbitrary URLs.
  const key = keyFromMediaUrl(parsed.data.imageUrl);
  if (!key) return Response.json({ error: "Hanya foto PBOX yang bisa dicetak" }, { status: 400 });
  const file = await readStoredFile(key);
  if (!file) return Response.json({ error: "Foto tidak ditemukan" }, { status: 404 });

  const query = new URLSearchParams({ copies: String(parsed.data.copies ?? 1) });
  if (parsed.data.media) query.set("media", parsed.data.media);

  try {
    const res = await boothFetch(`/print?${query}`, {
      method: "POST",
      body: new Uint8Array(file.data),
      headers: { "Content-Type": file.mimeType },
      timeoutMs: 25_000,
    });
    const result = await res.json().catch(() => ({}));
    return Response.json(res.ok ? result : { error: result.error ?? "Printer booth gagal" }, { status: res.status });
  } catch (error) {
    return boothError(error);
  }
}
