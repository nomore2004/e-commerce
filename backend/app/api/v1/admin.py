import uuid
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.api.deps import get_db, require_admin
from app.models.user import User
from app.models.business import Business, BusinessStatus
from app.models.complaint import Complaint, ComplaintStatus
from app.models.audit_log import AuditLog
from app.schemas.business import BusinessRead, BusinessVerifyRequest
from app.schemas.complaint import ComplaintRead, ComplaintStatusUpdate
from app.schemas.audit_log import AuditLogRead
from app.services.audit_service import create_audit_log

router = APIRouter(
    prefix="/admin",
    tags=["admin"],
    dependencies=[Depends(require_admin)],
)

# ----------------- BUSINESS VERIFICATION -----------------

@router.get("/businesses", response_model=List[BusinessRead])
def list_businesses(
    status_filter: Optional[BusinessStatus] = Query(None, alias="status"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    query = db.query(Business)
    if status_filter:
        query = query.filter(Business.status == status_filter)
    return query.offset(skip).limit(limit).all()

@router.get("/businesses/{business_id}", response_model=BusinessRead)
def get_business(
    business_id: uuid.UUID,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    business = db.query(Business).filter(Business.id == business_id).first()
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    return business

@router.post("/businesses/{business_id}/verify", response_model=BusinessRead)
def verify_business(
    business_id: uuid.UUID,
    payload: BusinessVerifyRequest,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    business = db.query(Business).filter(Business.id == business_id).first()
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    
    previous_status = business.status.value
    business.status = payload.status
    business.verified_by = admin.id
    business.verified_at = datetime.now(timezone.utc)
    
    if payload.status == BusinessStatus.REJECTED:
        business.rejection_reason = payload.rejection_reason or "Verification rejected by administrator."
    else:
        business.rejection_reason = None

    db.commit()
    db.refresh(business)

    # ProcureX Rule: Every admin write action must create an AuditLog row
    create_audit_log(
        db=db,
        actor_id=admin.id,
        action=f"BUSINESS_{payload.status.value.upper()}",
        target_type="business",
        target_id=str(business.id),
        details={
            "business_name": business.name,
            "previous_status": previous_status,
            "new_status": payload.status.value,
            "rejection_reason": business.rejection_reason,
        },
    )

    return business

# ----------------- COMPLAINTS MODERATION -----------------

@router.get("/complaints", response_model=List[ComplaintRead])
def list_complaints(
    status_filter: Optional[ComplaintStatus] = Query(None, alias="status"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    query = db.query(Complaint)
    if status_filter:
        query = query.filter(Complaint.status == status_filter)
    return query.offset(skip).limit(limit).all()

@router.patch("/complaints/{complaint_id}/status", response_model=ComplaintRead)
def update_complaint_status(
    complaint_id: uuid.UUID,
    payload: ComplaintStatusUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    
    previous_status = complaint.status.value
    complaint.status = payload.status
    if payload.resolution_notes is not None:
        complaint.resolution_notes = payload.resolution_notes

    db.commit()
    db.refresh(complaint)

    # ProcureX Rule: Every admin write action must create an AuditLog row
    create_audit_log(
        db=db,
        actor_id=admin.id,
        action=f"COMPLAINT_STATUS_{payload.status.value.upper()}",
        target_type="complaint",
        target_id=str(complaint.id),
        details={
            "complaint_title": complaint.title,
            "previous_status": previous_status,
            "new_status": payload.status.value,
            "resolution_notes": complaint.resolution_notes,
        },
    )

    return complaint

# ----------------- AUDIT LOGS -----------------

@router.get("/audit-logs", response_model=List[AuditLogRead])
def list_audit_logs(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    return (
        db.query(AuditLog)
        .order_by(AuditLog.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

# ----------------- ADMIN DASHBOARD STATS -----------------

@router.get("/dashboard-stats")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    pending_businesses = db.query(Business).filter(Business.status == BusinessStatus.PENDING).count()
    verified_businesses = db.query(Business).filter(Business.status == BusinessStatus.VERIFIED).count()
    rejected_businesses = db.query(Business).filter(Business.status == BusinessStatus.REJECTED).count()
    open_complaints = db.query(Complaint).filter(Complaint.status == ComplaintStatus.OPEN).count()

    return {
        "businesses": {
            "total": pending_businesses + verified_businesses + rejected_businesses,
            "pending": pending_businesses,
            "verified": verified_businesses,
            "rejected": rejected_businesses,
        },
        "complaints": {
            "open": open_complaints,
        },
    }
