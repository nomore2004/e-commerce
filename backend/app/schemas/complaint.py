import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict
from app.models.complaint import ComplaintStatus

class ComplaintBase(BaseModel):
    business_id: uuid.UUID
    title: str
    description: str

class ComplaintCreate(ComplaintBase):
    pass

class ComplaintStatusUpdate(BaseModel):
    status: ComplaintStatus
    resolution_notes: Optional[str] = None

class ComplaintRead(ComplaintBase):
    id: uuid.UUID
    complainant_id: Optional[uuid.UUID] = None
    status: ComplaintStatus
    resolution_notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
