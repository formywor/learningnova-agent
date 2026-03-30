export const runtime = "nodejs";
export const maxDuration = 10;

export async function GET() {
  return Response.json({
    ok: true,
    service: "jarvis-backend",
    timestamp: new Date().toISOString()
  });
}