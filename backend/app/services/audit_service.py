import uuid
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from app.models.audit_log import AuditLog

def create_audit_log(
    db: Session,
    action: str,
    target_type: str,
    target_id: str,
    actor_id: Optional[uuid.UUID] = None,
    details: Optional[Dict[str, Any]] = None,
) -> AuditLog:
    """
    ProcureX Rule: Every admin write action must create an AuditLog row.
    """
    log_entry = AuditLog(
        actor_id=actor_id,
        action=action,
        target_type=target_type,
        target_id=str(target_id),
        details=details or {},
    )
    db.add(log_entry)
    db.commit()
    db.refresh(log_entry)
    return log_entry
