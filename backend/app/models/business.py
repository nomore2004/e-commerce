import enum
import uuid
from datetime import datetime
from typing import TYPE_CHECKING, List, Optional
from sqlalchemy import String, Text, DateTime, Enum, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.types import Uuid
from app.models.base import Base, TimestampMixin, generate_uuid

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.complaint import Complaint

class BusinessStatus(str, enum.Enum):
    PENDING = "pending"
    VERIFIED = "verified"
    REJECTED = "rejected"

class Business(Base, TimestampMixin):
    __tablename__ = "businesses"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=generate_uuid,
    )
    name: Mapped[str] = mapped_column(String(255), index=True, nullable=False)
    business_type: Mapped[str] = mapped_column(String(100), nullable=False)  # Manufacturer, Wholesaler, etc.
    status: Mapped[BusinessStatus] = mapped_column(
        Enum(BusinessStatus, native_enum=False),
        default=BusinessStatus.PENDING,
        index=True,
        nullable=False,
    )
    gst_no: Mapped[str] = mapped_column(String(15), unique=True, index=True, nullable=False)
    address: Mapped[str] = mapped_column(Text, nullable=False)
    rejection_reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    verified_by: Mapped[Optional[uuid.UUID]] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    verified_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    owner_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )

    # Relationships
    verifier: Mapped[Optional["User"]] = relationship(
        "User",
        back_populates="verified_businesses",
        foreign_keys=[verified_by],
    )
    owner: Mapped[Optional["User"]] = relationship(
        "User",
        back_populates="owned_businesses",
        foreign_keys=[owner_id],
    )
    complaints: Mapped[List["Complaint"]] = relationship(
        "Complaint",
        back_populates="business",
        cascade="all, delete-orphan",
    )
