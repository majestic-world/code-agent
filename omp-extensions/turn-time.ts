// Shows the total prompt-to-yield time and token usage above the editor after
// the agent finishes a turn, instead of changing the conversation transcript.
import { Text } from "@oh-my-pi/pi-tui";

const CUSTOM_TYPE = "local.turn-time";
const STATUS_KEY = "turn-time";
const CLOCK_ICON = "⏳";
const IDLE_RECHECK_MS = 25;
const IDLE_RECHECK_MAX_MS = 250;

type TurnUsage = { input: number; output: number; cacheRead: number };
type TurnDetails = TurnUsage & { elapsedMs: number };

function formatElapsed(ms: number): string {
  const totalSeconds = ms / 1000;
  if (totalSeconds < 60) return `${totalSeconds.toFixed(1)}s`;
  const seconds = Math.floor(totalSeconds % 60);
  const minutes = Math.floor(totalSeconds / 60) % 60;
  const hours = Math.floor(totalSeconds / 3600);
  const pad = (n: number) => String(n).padStart(2, "0");
  return hours > 0 ? `${hours}h ${pad(minutes)}m ${pad(seconds)}s` : `${minutes}m ${pad(seconds)}s`;
}

function formatTokens(n: number): string {
  if (n < 1_000) return String(n);
  if (n < 10_000) return `${(n / 1_000).toFixed(1)}K`;
  if (n < 1_000_000) return `${Math.round(n / 1_000)}K`;
  return `${(n / 1_000_000).toFixed(1)}M`;
}

// Same buckets as omp's own usage row: in = input + cacheWrite, cache = cacheRead.
function formatLine(d: TurnDetails, icons: { input: string; output: string; cache: string }): string {
  const parts = [
    `${icons.input} ${formatTokens(d.input)}`,
    `${icons.output} ${formatTokens(d.output)}`,
  ];
  if (d.cacheRead > 0) parts.push(`${icons.cache} ${formatTokens(d.cacheRead)}`);
  return parts.join("  ");
}

export default function turnTime(pi) {
  pi.setLabel("Turn Time");

  // Start of the current user turn; kept across agent_end -> agent_start
  // continuations that happen before the session goes idle.
  let startedAt: number | undefined;
  let usage: TurnUsage = { input: 0, output: 0, cacheRead: 0 };
  let pendingCheck: unknown;

  const cancelPending = (ctx) => {
    if (pendingCheck === undefined) return;
    ctx.clearTimer(pendingCheck);
    pendingCheck = undefined;
  };

  pi.on("agent_start", (_event, ctx) => {
    if (ctx.mode !== "tui" || !ctx.hasUI || (ctx.agent?.kind ?? "main") !== "main") return;
    if (pendingCheck !== undefined) {
      cancelPending(ctx);
      return;
    }
    ctx.ui.setWidget(STATUS_KEY, undefined);
    startedAt = Date.now();
    usage = { input: 0, output: 0, cacheRead: 0 };
  });

  pi.on("message_end", (event) => {
    const message = event.message;
    if (startedAt === undefined || message?.role !== "assistant" || !message.usage) return;
    usage.input += (message.usage.input ?? 0) + (message.usage.cacheWrite ?? 0);
    usage.output += message.usage.output ?? 0;
    usage.cacheRead += message.usage.cacheRead ?? 0;
  });

  pi.on("agent_end", (_event, ctx) => {
    // startedAt is only set for the main TUI session (see agent_start).
    if (startedAt === undefined) return;
    const endedAt = Date.now();
    let delay = IDLE_RECHECK_MS;
    const check = () => {
      pendingCheck = undefined;
      if (startedAt === undefined) return;
      if (!ctx.isIdle()) {
        pendingCheck = ctx.setTimeout(check, delay);
        delay = Math.min(delay * 2, IDLE_RECHECK_MAX_MS);
        return;
      }
      const details: TurnDetails = { elapsedMs: endedAt - startedAt, ...usage };
      startedAt = undefined;
      const line = `${formatElapsed(details.elapsedMs)}  ${formatLine(details, ctx.ui.theme.icon)}`;
      ctx.ui.setWidget(
        STATUS_KEY,
        () => new Text(`${CLOCK_ICON} ${ctx.ui.theme.fg("dim", line)}`, 1, 0),
        { placement: "aboveEditor" },
      );
    };
    cancelPending(ctx);
    pendingCheck = ctx.setTimeout(check, 0);
  });

  pi.on("session_shutdown", (_event, ctx) => {
    startedAt = undefined;
    pendingCheck = undefined;
    ctx.ui.setWidget(STATUS_KEY, undefined);
  });

  // Display-only: never send the marker to the model.
  pi.on("context", (event) => ({
    messages: event.messages.filter((m) => !(m.role === "custom" && m.customType === CUSTOM_TYPE)),
  }));

  pi.registerMessageRenderer(CUSTOM_TYPE, (message, _options, theme) => {
    const d = message.details as Partial<TurnDetails> | undefined;
    if (typeof d?.elapsedMs !== "number" || typeof d.input !== "number") {
      const text = typeof message.content === "string"
        ? message.content
        : message.content.filter((c) => c.type === "text").map((c) => c.text).join("");
      return new Text(theme.fg("dim", text), 1, 0);
    }
    const line = `${formatElapsed(d.elapsedMs)}  ${formatLine(d as TurnDetails, theme.icon)}`;
    return new Text(`${CLOCK_ICON} ${theme.fg("dim", line)}`, 1, 0);
  });
}
