export type ParsedCommand = {
  status: string;
  reply: string;
  actionHint: string;
};

export function parseCommand(text: string): ParsedCommand {
  const input = text.trim();
  const lower = input.toLowerCase();

  if (!input) {
    return {
      status: "No command received",
      reply: "Sir, I did not hear a command.",
      actionHint: "none"
    };
  }

  if (lower.includes("text ") || lower.includes("message ")) {
    return {
      status: "Preparing message task",
      reply: "Sir, I am preparing your messaging request now.",
      actionHint: "messaging"
    };
  }

  if (lower.includes("open messages")) {
    return {
      status: "Opening Messages",
      reply: "Sir, I am opening Messages now.",
      actionHint: "open_messages"
    };
  }

  if (lower.includes("open gmail")) {
    return {
      status: "Opening Gmail",
      reply: "Sir, I am opening Gmail now.",
      actionHint: "open_gmail"
    };
  }

  if (lower.includes("open google chrome") || lower.includes("open chrome")) {
    return {
      status: "Opening Google Chrome",
      reply: "Sir, I am opening Google Chrome now.",
      actionHint: "open_chrome"
    };
  }

  if (lower.includes("read the current chrome page") || lower.includes("read current chrome page")) {
    return {
      status: "Reading current page",
      reply: "Sir, I am reading the current Chrome page now.",
      actionHint: "read_chrome_page"
    };
  }

  if (lower.includes("what is on my current screen") || lower.includes("read my screen")) {
    return {
      status: "Inspecting current screen",
      reply: "Sir, I am checking the current screen now.",
      actionHint: "screen_inspection"
    };
  }

  return {
    status: "Command received",
    reply: "Sir, I received your request and I am preparing to handle it.",
    actionHint: "general"
  };
}