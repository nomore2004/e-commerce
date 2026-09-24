import enum
import uuid
from typing import TYPE_CHECKING, Optional
from sqlalchemy import String, Text, Enum, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.types import Uuid
from app.models.base import Base, TimestampMixin, generate_uuid

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.business import Business

class ComplaintStatus(str, enum.Enum):
    OPEN = "open"
    UNDER_REVIEW = "under_review"
    RESOLVED = "resolved"
    DISMISSED = "dismissed"

class Complaint(Base, TimestampMixin):
    __tablename__ = "complaints"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=generate_uuid,
    )
    business_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("businesses.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    complainant_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[ComplaintStatus] = mapped_column(
        Enum(ComplaintStatus, native_enum=False),
        default=ComplaintStatus.OPEN,
        index=True,
        nullable=False,
    )
    resolution_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Relationships
    business: Mapped["Business"] = relationship(
        "Business",
        back_populates="complaints",
    )
    complainant: Mapped[Optional["User"]] = relationship(
        "User",
        back_populates="complaints",
        foreign_keys=[complainant_id],
    )
