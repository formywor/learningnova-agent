import { updateJobReport } from "../../../../lib/jobStore";

type ReportRequest = {
  job_id?: string;
  agent_name?: string;
  ok?: boolean;
  status?: string;
  reply?: string;
  result?: unknown;
  error?: string | null;
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
    const body = (await req.json()) as ReportRequest;
    const jobId = (body.job_id ?? "").trim();

    if (!jobId) {
      return Response.json({ error: "Missing job_id" }, { status: 400 });
    }

    const updated = updateJobReport({
      jobId,
      ok: Boolean(body.ok),
      reply: body.reply ?? "",
      statusText: body.status ?? "",
      result: body.result,
      error: body.error ?? null,
      agentName: body.agent_name ?? null
    });

    if (!updated) {
      return Response.json({ error: "Job not found" }, { status: 404 });
    }

    return Response.json({
      ok: true,
      job: updated
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