import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict
from app.models.business import BusinessStatus

class BusinessBase(BaseModel):
    name: str
    business_type: str
    gst_no: str
    address: str

class BusinessCreate(BusinessBase):
    pass

class BusinessVerifyRequest(BaseModel):
    status: BusinessStatus  # VERIFIED or REJECTED
    rejection_reason: Optional[str] = None

class BusinessRead(BusinessBase):
    id: uuid.UUID
    status: BusinessStatus
    rejection_reason: Optional[str] = None
    verified_by: Optional[uuid.UUID] = None
    verified_at: Optional[datetime] = None
    owner_id: Optional[uuid.UUID] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
