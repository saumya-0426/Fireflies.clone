import MeetingDetailView from "@/components/meeting-detail-view";

type MeetingPageProps = { params: Promise<{ meetingId: string }> };

export const instant = false;

export default async function MeetingPage({ params }: MeetingPageProps) {
  const { meetingId } = await params;
  return <MeetingDetailView meetingId={meetingId} />;
}
