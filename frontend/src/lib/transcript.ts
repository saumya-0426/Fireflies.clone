import type { ParticipantInput, TranscriptSegment } from "@/lib/meetings";

function timestampToSeconds(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value) && value >= 0) return value;
  if (typeof value !== "string") return null;
  const cleaned = value.trim().replace(/\[(.*)\]/, "$1").replace(",", ".");
  if (/^\d+(\.\d+)?$/.test(cleaned)) return Number(cleaned);
  const parts = cleaned.split(":").map(Number);
  if (parts.some((part) => !Number.isFinite(part))) return null;
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return null;
}

function splitSpeaker(text: string, fallback: string): { speaker: string; text: string } {
  const match = text.match(/^([^:\n]{1,60}):\s+(.+)$/);
  return match ? { speaker: match[1].trim(), text: match[2].trim() } : { speaker: fallback, text: text.trim() };
}

function makeSegments(rows: Array<{ start: number; end: number; speaker: string; text: string }>): TranscriptSegment[] {
  const sorted = rows.filter((row) => row.text.trim()).sort((a, b) => a.start - b.start);
  return sorted.map((row, position) => ({
    position,
    start_seconds: Math.max(0, row.start),
    end_seconds: Math.max(row.start, row.end),
    speaker: row.speaker.trim() || "Speaker",
    text: row.text.trim(),
  }));
}

function parseJsonTranscript(raw: string): TranscriptSegment[] {
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    throw new Error("The selected JSON file is not valid JSON.");
  }
  const record = data && typeof data === "object" && !Array.isArray(data) ? data as Record<string, unknown> : null;
  const list = Array.isArray(data) ? data : record?.transcript_segments ?? record?.segments;
  if (!Array.isArray(list)) throw new Error("JSON transcript must be an array or contain a segments array.");

  const rows = list.map((entry, index) => {
    if (!entry || typeof entry !== "object") throw new Error(`Transcript segment ${index + 1} is not an object.`);
    const item = entry as Record<string, unknown>;
    const start = timestampToSeconds(item.start_seconds ?? item.start ?? item.timestamp) ?? index * 5;
    const end = timestampToSeconds(item.end_seconds ?? item.end) ?? start + 5;
    const text = item.text ?? item.content;
    if (typeof text !== "string" || !text.trim()) throw new Error(`Transcript segment ${index + 1} has no text.`);
    return { start, end, speaker: String(item.speaker ?? item.speaker_name ?? "Speaker"), text };
  });
  return makeSegments(rows);
}

function parseVttTranscript(raw: string): TranscriptSegment[] {
  const blocks = raw.replace(/^\uFEFF?WEBVTT[^\n]*\n/i, "").split(/\n\s*\n/);
  const rows: Array<{ start: number; end: number; speaker: string; text: string }> = [];
  for (const block of blocks) {
    const lines = block.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    const timeIndex = lines.findIndex((line) => line.includes("-->"));
    if (timeIndex < 0) continue;
    const [from, to] = lines[timeIndex].split("-->").map((part) => part.trim().split(/\s+/)[0]);
    const start = timestampToSeconds(from);
    const end = timestampToSeconds(to);
    const content = lines.slice(timeIndex + 1).join(" ");
    if (start === null || !content) continue;
    const split = splitSpeaker(content, "Speaker");
    rows.push({ start, end: end ?? start + 5, ...split });
  }
  if (!rows.length) throw new Error("No timestamped captions were found in the VTT file.");
  return makeSegments(rows);
}

function parseTextTranscript(raw: string): TranscriptSegment[] {
  const lines = raw.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const rows = lines.map((line, index) => {
    const match = line.match(/^\[?((?:\d{1,2}:)?\d{1,2}:\d{2}(?:[.,]\d{1,3})?)\]?\s+(.+)$/);
    const start = match ? timestampToSeconds(match[1]) ?? index * 5 : index * 5;
    const content = match ? match[2] : line;
    return { start, end: start + 5, ...splitSpeaker(content, "Speaker") };
  });
  if (!rows.length) return [];
  return makeSegments(rows);
}

export function parseTranscript(raw: string, filename = ""): TranscriptSegment[] {
  const trimmed = raw.trim();
  if (!trimmed) return [];
  const isJson = filename.toLowerCase().endsWith(".json") || trimmed.startsWith("[") || trimmed.startsWith("{");
  const isVtt = filename.toLowerCase().endsWith(".vtt") || /^\uFEFF?WEBVTT/i.test(trimmed);
  return isJson ? parseJsonTranscript(trimmed) : isVtt ? parseVttTranscript(trimmed) : parseTextTranscript(trimmed);
}

export function parseParticipants(value: string): ParticipantInput[] {
  return value.split(/[\n,]/).map((entry) => entry.trim()).filter(Boolean).map((entry) => {
    const angleFormat = entry.match(/^(.+?)\s*<([^<>]+)>$/);
    if (angleFormat) return { name: angleFormat[1].trim(), email: angleFormat[2].trim().toLowerCase() };
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(entry)) {
      return { name: entry.split("@")[0].replace(/[._-]+/g, " "), email: entry.toLowerCase() };
    }
    return { name: entry, email: null };
  });
}
