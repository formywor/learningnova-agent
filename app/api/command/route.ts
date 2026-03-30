import { parseCommand } from "../../../lib/commandParser";
import { createJob } from "../../../lib/jobStore";

export const runtime = "nodejs";
export const maxDuration = 10;

type CommandRequest = {
  text?: string;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as CommandRequest;
    const text = (body.text ?? "").trim();

    if (!text) {
      return Response.json(
        {
          status: "Missing command",
          reply: "Sir, I did not receive any command text."
        },
        { status: 400 }
      );
    }

    const parsed = parseCommand(text);
    const job = createJob(text);

    return Response.json({
      status: parsed.status,
      reply: parsed.reply,
      mode: "queued",
      originalText: text,
      actionHint: parsed.actionHint,
      jobId: job.id
    });
  } catch (err) {
    return Response.json(
      {
        status: "Backend error",
        reply: "Sir, the backend ran into an error while handling your request.",
        error: err instanceof Error ? err.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}