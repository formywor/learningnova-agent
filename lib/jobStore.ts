export type JobStatus =
  | "queued"
  | "assigned"
  | "completed"
  | "failed";

export type JobRecord = {
  id: string;
  text: string;
  command?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
  status: JobStatus;
  assignedTo?: string | null;
  lastPollAt?: string | null;
  ok?: boolean | null;
  reply?: string | null;
  result?: unknown;
  error?: string | null;
};

declare global {
  var __jarvisJobs: Map<string, JobRecord> | undefined;
}

function getStore(): Map<string, JobRecord> {
  if (!globalThis.__jarvisJobs) {
    globalThis.__jarvisJobs = new Map<string, JobRecord>();
  }
  return globalThis.__jarvisJobs;
}

export function createJob(text: string, command?: Record<string, unknown> | null): JobRecord {
  const now = new Date().toISOString();
  const id = `job_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  const job: JobRecord = {
    id,
    text,
    command: command ?? null,
    createdAt: now,
    updatedAt: now,
    status: "queued",
    assignedTo: null,
    lastPollAt: null,
    ok: null,
    reply: null,
    result: null,
    error: null
  };

  getStore().set(id, job);
  return job;
}

export function getNextQueuedJob(agentName: string): JobRecord | null {
  const store = getStore();
  const jobs = Array.from(store.values())
    .filter((job) => job.status === "queued")
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  const job = jobs[0];
  if (!job) return null;

  const now = new Date().toISOString();
  const updated: JobRecord = {
    ...job,
    status: "assigned",
    assignedTo: agentName,
    lastPollAt: now,
    updatedAt: now
  };

  store.set(updated.id, updated);
  return updated;
}

export function updateJobReport(input: {
  jobId: string;
  ok: boolean;
  reply: string;
  statusText: string;
  result?: unknown;
  error?: string | null;
  agentName?: string | null;
}): JobRecord | null {
  const store = getStore();
  const job = store.get(input.jobId);
  if (!job) return null;

  const updated: JobRecord = {
    ...job,
    status: input.ok ? "completed" : "failed",
    ok: input.ok,
    reply: input.reply,
    result: input.result ?? null,
    error: input.error ?? null,
    assignedTo: input.agentName ?? job.assignedTo ?? null,
    updatedAt: new Date().toISOString()
  };

  store.set(updated.id, updated);
  return updated;
}

export function getJob(jobId: string): JobRecord | null {
  return getStore().get(jobId) ?? null;
}