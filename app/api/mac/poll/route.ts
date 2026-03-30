import { getNextQueuedJob } from "../../../../lib/jobStore";

type PollRequest = {
  agent_name?: string;
  platform?: string;
};

function isAuthorized(req: Request): boolean {
  const expected = process.env.AGENT_SHARED_SECRET;
  if (!expected) return true;
  return req.headers.get("x-agent-secret") === expected;
}

export async function POST(req: Request) {
  if (!isAuthorized(req)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await req.json()) as PollRequest;
    const agentName = (body.agent_name ?? "unknown-agent").trim();

    const job = getNextQueuedJob(agentName);

    return Response.json({
      ok: true,
      job
    });
  } catch (err) {
    return Response.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}