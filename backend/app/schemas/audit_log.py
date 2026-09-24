import uuid
from datetime import datetime
from typing import Optional, Any, Dict
from pydantic import BaseModel, ConfigDict

class AuditLogRead(BaseModel):
    id: uuid.UUID
    actor_id: Optional[uuid.UUID] = None
    action: str
    target_type: str
    target_id: str
    details: Optional[Dict[str, Any]] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
