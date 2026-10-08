"""Validated request and response schemas for the meeting API."""

from datetime import datetime
from typing import Annotated

from pydantic import BaseModel, ConfigDict, Field, StringConstraints, model_validator


NonEmptyString = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1)]
ParticipantName = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=160)]
ParticipantEmail = Annotated[str, StringConstraints(strip_whitespace=True, max_length=320)]
MeetingTitle = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=240)]
SpeakerLabel = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=160)]
TopicTitle = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=200)]
ActionDescription = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=500)]


class ParticipantInput(BaseModel):
    name: ParticipantName
    email: ParticipantEmail | None = None


class ParticipantRead(ParticipantInput):
    model_config = ConfigDict(from_attributes=True)
    id: int


class TranscriptSegmentInput(BaseModel):
    position: int = Field(ge=0)
    start_seconds: float = Field(ge=0)
    end_seconds: float = Field(ge=0)
    speaker: SpeakerLabel
    text: NonEmptyString

    @model_validator(mode="after")
    def end_must_follow_start(self):
        if self.end_seconds < self.start_seconds:
            raise ValueError("end_seconds must be greater than or equal to start_seconds")
        return self


class TranscriptSegmentRead(TranscriptSegmentInput):
    model_config = ConfigDict(from_attributes=True)
    id: int


class SummaryInput(BaseModel):
    overview: NonEmptyString


class SummaryRead(SummaryInput):
    model_config = ConfigDict(from_attributes=True)
    updated_at: datetime


class TopicInput(BaseModel):
    position: int = Field(ge=0)
    title: TopicTitle
    start_seconds: float | None = Field(default=None, ge=0)


class TopicRead(TopicInput):
    model_config = ConfigDict(from_attributes=True)
    id: int


class ActionItemInput(BaseModel):
    description: ActionDescription
    assignee: ParticipantName | None = None
    due_date: datetime | None = None
    is_completed: bool = False


class ActionItemCreate(ActionItemInput):
    pass


class ActionItemUpdate(BaseModel):
    description: ActionDescription | None = None
    assignee: ParticipantName | None = None
    due_date: datetime | None = None
    is_completed: bool | None = None


class ActionItemRead(ActionItemInput):
    model_config = ConfigDict(from_attributes=True)
    id: int
    meeting_id: int
    created_at: datetime
    updated_at: datetime


class MeetingCreate(BaseModel):
    title: MeetingTitle
    started_at: datetime
    duration_seconds: int = Field(ge=0)
    participants: list[ParticipantInput] = Field(default_factory=list)
    transcript_segments: list[TranscriptSegmentInput] = Field(default_factory=list)
    summary: SummaryInput | None = None
    topics: list[TopicInput] = Field(default_factory=list)
    action_items: list[ActionItemCreate] = Field(default_factory=list)


class MeetingUpdate(BaseModel):
    title: MeetingTitle | None = None
    started_at: datetime | None = None
    duration_seconds: int | None = Field(default=None, ge=0)
    participants: list[ParticipantInput] | None = None


class MeetingRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    title: str
    started_at: datetime
    duration_seconds: int
    created_at: datetime
    updated_at: datetime
    participants: list[ParticipantRead]


class MeetingDetail(MeetingRead):
    transcript_segments: list[TranscriptSegmentRead]
    summary: SummaryRead | None
    topics: list[TopicRead]
    action_items: list[ActionItemRead]


