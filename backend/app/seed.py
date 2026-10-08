"""Insert a small set of complete, reusable local demo meetings."""

from datetime import datetime

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models import ActionItem, Meeting, MeetingSummary, MeetingTopic, Participant, TranscriptSegment

SEED_MEETINGS = [
    {
        "title": "Product launch planning",
        "started_at": datetime(2026, 10, 7, 10, 0),
        "duration_seconds": 2700,
        "participants": [
            ("Maya Chen", "maya.chen@example.com"),
            ("Arjun Rao", "arjun.rao@example.com"),
            ("Priya Nair", "priya.nair@example.com"),
        ],
        "summary": "The team aligned on a November launch window for the new onboarding flow. Product will freeze scope by October 14, design will deliver the revised empty states, and engineering will protect one week for release validation. The team will review activation and completion rates after launch.",
        "topics": [("Launch window and goals", 0), ("Scope and onboarding changes", 510), ("Release readiness and metrics", 1650)],
        "segments": [
            (0, 18, "Maya Chen", "Thanks, everyone. I want us to leave with a launch window, a scope cut, and clear owners for the remaining onboarding work."),
            (23, 47, "Arjun Rao", "The current build is stable on the main path. The open issues are the import error state, retry behavior, and one analytics event."),
            (54, 78, "Priya Nair", "Design can finish the import and empty-state revisions by next Tuesday if we lock the copy today."),
            (92, 117, "Maya Chen", "Let's target the week of November ninth. That gives us time for a focused validation week before we announce it."),
            (138, 170, "Arjun Rao", "I recommend we keep the first release to account setup, calendar connection, and the first meeting recap. Team controls can follow later."),
            (188, 215, "Priya Nair", "Agreed. I'll send the revised empty states and final copy for those three steps by October thirteenth."),
            (332, 359, "Maya Chen", "For success metrics, let's watch activation, calendar connection completion, and how many users reach their first recap."),
            (545, 573, "Arjun Rao", "We should reserve a week for regression checks and support handoff. I can own the release checklist and report blockers every day."),
            (810, 838, "Priya Nair", "I will also document the interaction states so engineering can confirm loading, failure, and retry behavior consistently."),
            (1170, 1204, "Maya Chen", "Great. Product scope is frozen on the fourteenth, design follows on the fifteenth, and we will review readiness on the twenty-third."),
        ],
        "action_items": [
            ("Freeze launch scope and confirm the November release window", "Maya Chen", "2026-10-14"),
            ("Deliver revised onboarding empty states and final copy", "Priya Nair", "2026-10-13"),
            ("Draft release validation checklist and daily blocker update", "Arjun Rao", "2026-10-23"),
        ],
    },
    {
        "title": "Customer feedback: Northstar onboarding",
        "started_at": datetime(2026, 10, 6, 14, 30),
        "duration_seconds": 2100,
        "participants": [
            ("Leo Martin", "leo.martin@example.com"),
            ("Nina Patel", "nina.patel@example.com"),
            ("Sam Rivera", "sam.rivera@example.com"),
        ],
        "summary": "Northstar's operations team finds the initial setup clear but wants better visibility into calendar permissions and a faster way to invite colleagues. The team agreed to share a short setup guide, investigate role-based invitations, and schedule a follow-up after the next onboarding release.",
        "topics": [("What is working today", 0), ("Calendar permissions and invitations", 420), ("Follow-up plan", 1320)],
        "segments": [
            (0, 23, "Leo Martin", "Thanks for joining. We want to understand where setup felt smooth and where your team had to stop and ask for help."),
            (31, 57, "Nina Patel", "Creating the workspace was straightforward. The part that took time was understanding which calendar permissions were needed."),
            (74, 100, "Sam Rivera", "The connection screen lists the permission, but it doesn't explain why it is needed or what changes if we skip it."),
            (139, 163, "Leo Martin", "That makes sense. Would a short explanation beside each permission help, or would you prefer a single setup guide?"),
            (186, 210, "Nina Patel", "Both would help. The in-product note is useful during setup, and a guide makes it easier for our IT team to review."),
            (351, 382, "Sam Rivera", "Inviting coworkers is the other friction point. I had to add people one at a time and wasn't sure whether they joined the right group."),
            (476, 504, "Leo Martin", "We'll look at a batch invitation flow and make group membership clearer before the invite is sent."),
            (650, 676, "Nina Patel", "If the guide is ready this week, I can ask two new hires to try the flow and tell you whether the explanation is enough."),
            (1010, 1040, "Sam Rivera", "We can also share the permission text with our IT lead so we can get an answer without scheduling another call."),
            (1335, 1368, "Leo Martin", "I'll send the guide and permission notes by Friday. Let's reconnect after the next onboarding update and review the invitation flow."),
        ],
        "action_items": [
            ("Send the calendar permission guide and in-product explanation", "Leo Martin", "2026-10-09"),
            ("Review batch invitations and clearer group selection", "Leo Martin", "2026-10-16"),
            ("Ask two new hires to try the onboarding flow", "Nina Patel", "2026-10-12"),
        ],
    },
    {
        "title": "Engineering weekly: reliability review",
        "started_at": datetime(2026, 10, 5, 9, 15),
        "duration_seconds": 3000,
        "participants": [
            ("Arjun Rao", "arjun.rao@example.com"),
            ("Elena Brooks", "elena.brooks@example.com"),
            ("Chris Wong", "chris.wong@example.com"),
        ],
        "summary": "The team reviewed a rise in background-job retries and agreed to prioritize clearer retry metrics, a bounded retry policy, and a runbook update. The database maintenance window remains on schedule. Elena will own the retry dashboard, Chris will prepare the policy change, and Arjun will coordinate the release window.",
        "topics": [("Background-job retry trend", 0), ("Retry policy and observability", 560), ("Database maintenance", 1540), ("Owners and release timing", 2100)],
        "segments": [
            (0, 20, "Arjun Rao", "Let's start with the reliability review. We saw more retries last week, but the customer-facing error rate stayed flat."),
            (42, 70, "Elena Brooks", "The increase is concentrated in two background queues. Our dashboard counts attempts but doesn't show how many jobs eventually succeed."),
            (103, 131, "Chris Wong", "I checked the worker logs. Most retries recover, but a few jobs retry indefinitely because one older path has no maximum."),
            (192, 221, "Arjun Rao", "Let's add a bounded retry policy and make the dashboard distinguish recovered jobs from jobs that exhausted retries."),
            (342, 370, "Elena Brooks", "I can add the recovered-versus-failed view and alert on the exhaustion rate. I will include a queue filter so on-call can isolate the source."),
            (595, 625, "Chris Wong", "I'll draft the policy change with a maximum attempt count and a longer delay after the first few attempts."),
            (877, 906, "Arjun Rao", "The database maintenance window is still planned for Thursday. We need a clear rollback step in the runbook before then."),
            (1115, 1144, "Elena Brooks", "I'll add the dashboard link and the rollback note to the on-call runbook when I finish the alert changes."),
            (1450, 1480, "Chris Wong", "I can put up a review build by Wednesday morning. That leaves a day to compare retry behavior before the maintenance window."),
            (1810, 1842, "Arjun Rao", "Good. Elena owns dashboard and alerting, Chris owns the retry policy, and I'll coordinate the release and maintenance check-in."),
        ],
        "action_items": [
            ("Add recovered-versus-failed retry metrics and an exhaustion alert", "Elena Brooks", "2026-10-12"),
            ("Draft a bounded retry policy for background workers", "Chris Wong", "2026-10-7"),
            ("Update the on-call runbook with rollback steps", "Arjun Rao", "2026-10-8"),
        ],
    },
]


def _get_participant(db: Session, name: str, email: str) -> Participant:
    participant = db.scalar(select(Participant).where(Participant.email == email))
    return participant or Participant(name=name, email=email)


def seed_meetings(db: Session) -> int:
    inserted = 0
    for fixture in SEED_MEETINGS:
        exists = db.scalar(select(Meeting.id).where(Meeting.title == fixture["title"]))
        if exists:
            continue

        people = [_get_participant(db, name, email) for name, email in fixture["participants"]]
        meeting = Meeting(
            title=fixture["title"],
            started_at=fixture["started_at"],
            duration_seconds=fixture["duration_seconds"],
            participants=people,
            summary=MeetingSummary(overview=fixture["summary"]),
            topics=[
                MeetingTopic(position=i, title=title, start_seconds=start)
                for i, (title, start) in enumerate(fixture["topics"])
            ],
            transcript_segments=[
                TranscriptSegment(
                    position=i,
                    start_seconds=start,
                    end_seconds=end,
                    speaker=speaker,
                    text=text,
                )
                for i, (start, end, speaker, text) in enumerate(fixture["segments"])
            ],
            action_items=[
                ActionItem(
                    description=description,
                    assignee=assignee,
                    due_date=datetime.strptime(due_date, "%Y-%m-%d"),
                )
                for description, assignee, due_date in fixture["action_items"]
            ],
        )
        db.add(meeting)
        # Make newly seen participants visible to later fixtures in this transaction.
        db.flush()
        inserted += 1
    db.commit()
    return inserted


def main() -> None:
    with SessionLocal() as db:
        inserted = seed_meetings(db)
    print(f"Seed complete: added {inserted} meeting(s); existing seed meetings were left unchanged.")


if __name__ == "__main__":
    main()
