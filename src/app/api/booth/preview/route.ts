import { boothAgentUrl, boothDisabled, boothError, boothFetch, passImage } from "@/lib/booth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!boothAgentUrl()) return boothDisabled();
  try {
    return await passImage(await boothFetch("/preview", { timeoutMs: 10_000 }));
  } catch (error) {
    return boothError(error);
  }
}
