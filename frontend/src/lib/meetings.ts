export type Participant = {
  id?: number;
  name: string;
  email: string | null;
};

export type TranscriptSegment = {
  id?: number;
  position: number;
  start_seconds: number;
  end_seconds: number;
  speaker: string;
  text: string;
};

export type MeetingSummary = { overview: string; updated_at?: string };

export type MeetingTopic = {
  id?: number;
  position: number;
  title: string;
  start_seconds: number | null;
};

export type ActionItem = {
  id: number;
  meeting_id: number;
  description: string;
  assignee: string | null;
  due_date: string | null;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
};

export type Meeting = {
  id: number;
  title: string;
  started_at: string;
  duration_seconds: number;
  created_at: string;
  updated_at: string;
  participants: Participant[];
};

export type MeetingDetail = Meeting & {
  transcript_segments: TranscriptSegment[];
  summary: MeetingSummary | null;
  topics: MeetingTopic[];
  action_items: ActionItem[];
};

export type ParticipantInput = { name: string; email: string | null };

export type MeetingPayload = {
  title: string;
  started_at: string;
  duration_seconds: number;
  participants: ParticipantInput[];
  transcript_segments: TranscriptSegment[];
};
