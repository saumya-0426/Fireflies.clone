"""Meeting library and meeting-detail API routes."""

from datetime import date
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import ActionItem, Meeting, MeetingSummary, MeetingTopic, Participant, TranscriptSegment
from app.schemas import (
    ActionItemCreate,
    ActionItemRead,
    ActionItemUpdate,
    MeetingCreate,
    MeetingDetail,
    MeetingRead,
    MeetingUpdate,
    ParticipantInput,
    SummaryRead,
    TranscriptSegmentRead,
)
from app.summaries import generate_meeting_summary

router = APIRouter(prefix="/api", tags=["meetings"])


def _get_meeting(db: Session, meeting_id: int) -> Meeting:
    meeting = db.get(Meeting, meeting_id)
    if meeting is None:
        raise HTTPException(status_code=404, detail="Meeting not found")
    return meeting


def _resolve_participants(db: Session, inputs: list[ParticipantInput]) -> list[Participant]:
    resolved: list[Participant] = []
    seen_emails: set[str] = set()
    for item in inputs:
        email = item.email.strip().lower() if item.email else None
        if email and email in seen_emails:
            continue
        if email:
            participant = db.scalar(select(Participant).where(Participant.email == email))
            if participant is None:
                participant = Participant(name=item.name.strip(), email=email)
            else:
                participant.name = item.name.strip()
        else:
            participant = Participant(name=item.name.strip())
        resolved.append(participant)
        if email:
            seen_emails.add(email)
    return resolved


@router.get("/meetings", response_model=list[MeetingRead])
def list_meetings(
    q: str | None = Query(default=None, min_length=1, max_length=200, description="Search titles, participants, and email addresses"),
    date_from: date | None = None,
    date_to: date | None = None,
    participant: str | None = Query(default=None, min_length=1, max_length=160),
    sort: Literal["newest", "oldest"] = "newest",
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
) -> list[Meeting]:
    if date_from and date_to and date_to < date_from:
        raise HTTPException(status_code=422, detail="date_to must be on or after date_from")

    statement = select(Meeting)
    if q:
        term = f"%{q.strip()}%"
        statement = statement.outerjoin(Meeting.participants).where(
            or_(Meeting.title.ilike(term), Participant.name.ilike(term), Participant.email.ilike(term))
        ).distinct()
    if participant:
        term = f"%{participant.strip()}%"
        statement = statement.where(
            Meeting.participants.any(or_(Participant.name.ilike(term), Participant.email.ilike(term)))
        )
    if date_from:
        statement = statement.where(func.date(Meeting.started_at) >= date_from.isoformat())
    if date_to:
        statement = statement.where(func.date(Meeting.started_at) <= date_to.isoformat())

    order = Meeting.started_at.desc() if sort == "newest" else Meeting.started_at.asc()
    statement = statement.order_by(order, Meeting.id.desc()).offset(offset).limit(limit)
    return list(db.scalars(statement).unique().all())


@router.post("/meetings", response_model=MeetingDetail, status_code=status.HTTP_201_CREATED)
def create_meeting(payload: MeetingCreate, db: Session = Depends(get_db)) -> Meeting:
    summary_overview = payload.summary.overview if payload.summary else None
    if summary_overview is None and payload.transcript_segments:
        # Make the potentially slow model request before opening a DB transaction.
        summary_overview = generate_meeting_summary(payload.transcript_segments)

    meeting = Meeting(
        title=payload.title.strip(),
        started_at=payload.started_at,
        duration_seconds=payload.duration_seconds,
        participants=_resolve_participants(db, payload.participants),
        transcript_segments=[TranscriptSegment(**item.model_dump()) for item in payload.transcript_segments],
        topics=[MeetingTopic(**item.model_dump()) for item in payload.topics],
        action_items=[ActionItem(**item.model_dump()) for item in payload.action_items],
    )
    if summary_overview:
        meeting.summary = MeetingSummary(overview=summary_overview)
    db.add(meeting)
    db.commit()
    db.refresh(meeting)
    return meeting


@router.get("/meetings/{meeting_id}", response_model=MeetingDetail)
def get_meeting(meeting_id: int, db: Session = Depends(get_db)) -> Meeting:
    return _get_meeting(db, meeting_id)


@router.patch("/meetings/{meeting_id}", response_model=MeetingDetail)
def update_meeting(meeting_id: int, payload: MeetingUpdate, db: Session = Depends(get_db)) -> Meeting:
    meeting = _get_meeting(db, meeting_id)
    changes = payload.model_dump(exclude_unset=True)
    if "participants" in changes:
        participants = changes.pop("participants")
        meeting.participants = _resolve_participants(db, [ParticipantInput(**item) for item in participants or []])
    if "title" in changes and changes["title"] is not None:
        changes["title"] = changes["title"].strip()
    for field, value in changes.items():
        setattr(meeting, field, value)
    db.commit()
    db.refresh(meeting)
    return meeting


@router.delete("/meetings/{meeting_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_meeting(meeting_id: int, db: Session = Depends(get_db)) -> Response:
    meeting = _get_meeting(db, meeting_id)
    db.delete(meeting)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/meetings/{meeting_id}/transcript", response_model=list[TranscriptSegmentRead])
def get_transcript(meeting_id: int, db: Session = Depends(get_db)) -> list[TranscriptSegment]:
    _get_meeting(db, meeting_id)
    statement = select(TranscriptSegment).where(TranscriptSegment.meeting_id == meeting_id).order_by(TranscriptSegment.position)
    return list(db.scalars(statement).all())


@router.get("/meetings/{meeting_id}/summary", response_model=SummaryRead | None)
def get_summary(meeting_id: int, db: Session = Depends(get_db)) -> MeetingSummary | None:
    meeting = _get_meeting(db, meeting_id)
    return meeting.summary


@router.post("/meetings/{meeting_id}/action-items", response_model=ActionItemRead, status_code=status.HTTP_201_CREATED)
def create_action_item(meeting_id: int, payload: ActionItemCreate, db: Session = Depends(get_db)) -> ActionItem:
    _get_meeting(db, meeting_id)
    item = ActionItem(meeting_id=meeting_id, **payload.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.patch("/action-items/{action_item_id}", response_model=ActionItemRead)
def update_action_item(action_item_id: int, payload: ActionItemUpdate, db: Session = Depends(get_db)) -> ActionItem:
    item = db.get(ActionItem, action_item_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Action item not found")
    changes = payload.model_dump(exclude_unset=True)
    if "description" in changes:
        if changes["description"] is None:
            raise HTTPException(status_code=422, detail="description cannot be null")
        changes["description"] = changes["description"].strip()
    for field, value in changes.items():
        setattr(item, field, value)
    db.commit()
    db.refresh(item)
    return item


@router.delete("/action-items/{action_item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_action_item(action_item_id: int, db: Session = Depends(get_db)) -> Response:
    item = db.get(ActionItem, action_item_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Action item not found")
    db.delete(item)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
