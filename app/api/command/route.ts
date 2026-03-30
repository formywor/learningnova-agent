import { parseCommand } from "../../../lib/commandParser";

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

    const macAgentEndpoint = process.env.MAC_AGENT_ENDPOINT;
    const sharedSecret = process.env.AGENT_SHARED_SECRET;

    if (!macAgentEndpoint) {
      return Response.json({
        status: parsed.status,
        reply: parsed.reply,
        mode: "mock",
        originalText: text,
        actionHint: parsed.actionHint
      });
    }

    try {
      const macResponse = await fetch(macAgentEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(sharedSecret ? { "x-agent-secret": sharedSecret } : {})
        },
        body: JSON.stringify({
          text,
          source: "iphone"
        }),
        cache: "no-store"
      });

      if (!macResponse.ok) {
        const fallback = await safeReadText(macResponse);
        return Response.json({
          status: "Mac agent unavailable",
          reply: "Sir, your backend is online, but the Mac agent did not complete the request.",
          mode: "backend_only",
          originalText: text,
          actionHint: parsed.actionHint,
          macAgentError: fallback
        });
      }

      const data = await macResponse.json();

      return Response.json({
        status: typeof data.status === "string" ? data.status : parsed.status,
        reply: typeof data.reply === "string" ? data.reply : parsed.reply,
        mode: "live",
        originalText: text,
        actionHint: typeof data.actionHint === "string" ? data.actionHint : parsed.actionHint,
        macResult: "result" in data ? data.result : null
      });
    } catch (err) {
      return Response.json({
        status: "Mac agent offline",
        reply: "Sir, your backend is online, but I could not reach your Mac agent.",
        mode: "backend_only",
        originalText: text,
        actionHint: parsed.actionHint,
        error: err instanceof Error ? err.message : "Unknown error"
      });
    }
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

async function safeReadText(response: Response): Promise<string> {
  try {
    return await response.text();
  } catch {
    return "Unable to read upstream error.";
  }
}