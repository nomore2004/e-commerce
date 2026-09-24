import enum
import uuid
from typing import TYPE_CHECKING, List, Optional
from sqlalchemy import String, Boolean, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.types import Uuid
from app.models.base import Base, TimestampMixin, generate_uuid

if TYPE_CHECKING:
    from app.models.business import Business
    from app.models.complaint import Complaint
    from app.models.audit_log import AuditLog

class UserRole(str, enum.Enum):
    ADMIN = "admin"
    BUYER = "buyer"
    SUPPLIER = "supplier"

class User(Base, TimestampMixin):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=generate_uuid,
    )
    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        index=True,
        nullable=False,
    )
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[UserRole] = mapped_column(
        Enum(UserRole, native_enum=False),
        default=UserRole.BUYER,
        nullable=False,
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Relationships
    verified_businesses: Mapped[List["Business"]] = relationship(
        "Business",
        back_populates="verifier",
        foreign_keys="Business.verified_by",
    )
    owned_businesses: Mapped[List["Business"]] = relationship(
        "Business",
        back_populates="owner",
        foreign_keys="Business.owner_id",
    )
    complaints: Mapped[List["Complaint"]] = relationship(
        "Complaint",
        back_populates="complainant",
        foreign_keys="Complaint.complainant_id",
    )
    audit_logs: Mapped[List["AuditLog"]] = relationship(
        "AuditLog",
        back_populates="actor",
    )
