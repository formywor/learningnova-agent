type TTSRequest = {
  text?: string;
  voiceId?: string;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as TTSRequest;
    const text = (body.text ?? "").trim();
    const voiceId = (body.voiceId ?? "Matthew").trim();

    if (!text) {
      return new Response("Missing text", { status: 400 });
    }

    const apiKey = process.env.MURF_API_KEY;
    if (!apiKey) {
      return new Response("Missing MURF_API_KEY", { status: 500 });
    }

    const murfResponse = await fetch("https://global.api.murf.ai/v1/speech/stream", {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        voice_id: voiceId,
        text,
        locale: "en-US",
        model: "FALCON",
        format: "MP3",
        sampleRate: 24000,
        channelType: "MONO"
      })
    });

    if (!murfResponse.ok || !murfResponse.body) {
      const errText = await safeReadText(murfResponse);
      return new Response(`Murf error: ${errText}`, { status: 502 });
    }

    return new Response(murfResponse.body, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store"
      }
    });
  } catch (err) {
    return new Response(
      err instanceof Error ? err.message : "Unknown backend error",
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