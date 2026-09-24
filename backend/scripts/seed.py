import sys
import random
from pathlib import Path
from datetime import datetime, timezone, timedelta

# Add backend directory to sys.path
sys.path.append(str(Path(__file__).resolve().parents[1]))

from app.core.config import settings
from app.core.database import SessionLocal
from app.core.security import get_password_hash
from app.models.user import User, UserRole
from app.models.business import Business, BusinessStatus
from app.models.complaint import Complaint, ComplaintStatus
from app.models.audit_log import AuditLog

SAMPLE_COMPANIES = [
    ("Apex Industrial Supplies Ltd", "Manufacturer", "27AABCA1234F1Z1", "Plot 42, MIDC Industrial Area, Andheri East, Mumbai, Maharashtra 400093"),
    ("Bharat Heavy Agro Equipment", "Manufacturer", "07AAACB2345D1Z4", "Sector 18, Industrial Hub, Gurugram, Haryana 122015"),
    ("Zenith Polymers & Plastics", "Manufacturer", "24AABCZ3456E1Z7", "GIDC Estate, Phase II, Vatva, Ahmedabad, Gujarat 382445"),
    ("Delta Textiles & Fabrics", "Wholesaler", "33AABCD4567G1ZA", "Ring Road Textile Market, Surat, Gujarat 395002"),
    ("Shree Ram Steel Corp", "Wholesaler", "19AABCE5678H1ZD", "Chowringhee Lane, Kolkata, West Bengal 700071"),
    ("Vanguard Electronics Wholesale", "Wholesaler", "29AABCF6789J1ZG", "SP Road Electronics Market, Bengaluru, Karnataka 560002"),
    ("Omkar Chemical Solutions", "Distributor", "27AABCG7890K1ZJ", "TTC Industrial Zone, Turbhe, Navi Mumbai, Maharashtra 400705"),
    ("Kaveri Precision Tools", "Manufacturer", "33AABCH8901L1ZM", "SIDCO Industrial Estate, Guindy, Chennai, Tamil Nadu 600032"),
    ("Global Logistics & Freight Spares", "Distributor", "06AABCJ9012M1ZP", "Udyog Vihar Phase 4, Gurugram, Haryana 122016"),
    ("Pinnacle Construction Materials", "Wholesaler", "23AABCK0123N1ZS", "Sanwer Road Industrial Area, Indore, Madhya Pradesh 452015"),
    ("Sunrise Packaging Solutions", "Manufacturer", "09AABCL1234P1ZV", "Site IV Industrial Area, Sahibabad, Ghaziabad, UP 201010"),
    ("Sterling Medical Devices", "Distributor", "29AABCM2345Q1ZY", "Peenya Industrial Area, Bengaluru, Karnataka 560058"),
    ("Falcon Auto Components", "Manufacturer", "27AABCN3456R1Z1", "Chakan Industrial Corridor, Pune, Maharashtra 410501"),
    ("Horizon Renewable Power Parts", "Wholesaler", "08AABCO4567S1Z4", "Sitapura Industrial Area, Jaipur, Rajasthan 302022"),
    ("Prime Minerals & Ores", "Distributor", "21AABCP5678T1Z7", "Bhubaneswar Industrial Estate, Rasulgarh, Odisha 751010"),
    ("Nova Clean Energy Tech", "Manufacturer", "36AABCQ6789U1ZA", "Cherlapally Industrial Estate, Hyderabad, Telangana 500051"),
    ("Ambience Office Supplies", "Wholesaler", "07AABCR7890V1ZD", "Okhla Industrial Area Phase III, New Delhi 110020"),
    ("Narmada Agro Commodities", "Wholesaler", "24AABCS8901W1ZG", "APMC Market Yard, Unjha, Gujarat 384170"),
    ("Everest HVAC & Refrigeration", "Distributor", "27AABCT9012X1ZJ", "Wagle Industrial Estate, Thane West, Maharashtra 400604"),
    ("Saffron Food Ingredients", "Manufacturer", "32AABCU0123Y1ZM", "Kakkanad Industrial Zone, Kochi, Kerala 682030"),
]

SAMPLE_COMPLAINTS = [
    ("Delayed order dispatch past SLA", "Supplier delayed delivery by 14 days without advance notice or tracking updates."),
    ("Damaged goods upon arrival", "Batch of 50 units received with severe packaging damage causing product loss."),
    ("Non-compliant GST invoice", "The issued GST invoice contains mismatched HSN codes preventing input tax credit claims."),
    ("Specification discrepancy in bulk shipment", "Tensile strength of delivered bolts does not match the ISO specification in PO."),
    ("Unresponsive customer support", "Support team failed to address ticketing inquiries regarding return of defective items."),
    ("Unauthorized price alteration post agreement", "Supplier raised unit price by 8% after PO was accepted and advance payment cleared."),
    ("Short shipment with missing inventory", "Consignment was missing 20 cartons out of 100 ordered according to bill of lading."),
    ("Defective electrical components", "Over 15% failure rate observed during incoming QA inspection of power supply units."),
    ("Refusal to honor warranty replacement", "Vendor rejected warranty RMA despite failure occurring within 30 days of installation."),
    ("Counterfeit packaging markings", "Product markings did not match OEM standards; suspected secondary market refurbishments."),
]

def seed():
    db = SessionLocal()
    try:
        print("🌱 Seeding ProcureX database...")

        # 1. Seed or retrieve Admin User
        admin_email = settings.FIRST_SUPERUSER_EMAIL
        admin = db.query(User).filter(User.email == admin_email).first()
        if not admin:
            admin = User(
                email=admin_email,
                hashed_password=get_password_hash(settings.FIRST_SUPERUSER_PASSWORD),
                full_name=settings.FIRST_SUPERUSER_NAME,
                role=UserRole.ADMIN,
                is_active=True,
            )
            db.add(admin)
            db.commit()
            db.refresh(admin)
            print(f"✅ Created Admin: {admin.email} (Password: {settings.FIRST_SUPERUSER_PASSWORD})")
        else:
            print(f"ℹ️ Admin {admin.email} already exists.")

        # 2. Seed Buyer for complaints
        test_buyer = db.query(User).filter(User.email == "buyer@procurex.com").first()
        if not test_buyer:
            test_buyer = User(
                email="buyer@procurex.com",
                hashed_password=get_password_hash("Buyer@123456"),
                full_name="ProcureX Verified Buyer",
                role=UserRole.BUYER,
                is_active=True,
            )
            db.add(test_buyer)
            db.commit()
            db.refresh(test_buyer)
            print(f"✅ Created Demo Buyer: {test_buyer.email}")

        # 3. Seed 20 Businesses across pending, verified, rejected
        existing_businesses_count = db.query(Business).count()
        if existing_businesses_count < 20:
            businesses = []
            statuses = (
                [BusinessStatus.PENDING] * 8 +
                [BusinessStatus.VERIFIED] * 8 +
                [BusinessStatus.REJECTED] * 4
            )
            random.seed(42)  # reproducible distribution

            for idx, (name, btype, gst, addr) in enumerate(SAMPLE_COMPANIES):
                status = statuses[idx]
                verified_by_id = admin.id if status in (BusinessStatus.VERIFIED, BusinessStatus.REJECTED) else None
                verified_at_dt = datetime.now(timezone.utc) - timedelta(days=random.randint(1, 30)) if verified_by_id else None
                rejection = "GST registration certificate blurred or invalid TIN mismatch." if status == BusinessStatus.REJECTED else None

                existing_b = db.query(Business).filter(Business.gst_no == gst).first()
                if not existing_b:
                    b = Business(
                        name=name,
                        business_type=btype,
                        status=status,
                        gst_no=gst,
                        address=addr,
                        rejection_reason=rejection,
                        verified_by=verified_by_id,
                        verified_at=verified_at_dt,
                    )
                    db.add(b)
                    businesses.append(b)
            db.commit()
            print(f"✅ Seeded 20 businesses across PENDING, VERIFIED, and REJECTED.")
        else:
            print(f"ℹ️ Businesses already seeded ({existing_businesses_count} found).")

        # 4. Seed 10 Complaints
        existing_complaints_count = db.query(Complaint).count()
        if existing_complaints_count < 10:
            all_businesses = db.query(Business).all()
            complaint_statuses = [
                ComplaintStatus.OPEN,
                ComplaintStatus.OPEN,
                ComplaintStatus.OPEN,
                ComplaintStatus.UNDER_REVIEW,
                ComplaintStatus.UNDER_REVIEW,
                ComplaintStatus.RESOLVED,
                ComplaintStatus.RESOLVED,
                ComplaintStatus.DISMISSED,
                ComplaintStatus.OPEN,
                ComplaintStatus.RESOLVED,
            ]

            for idx, (title, desc) in enumerate(SAMPLE_COMPLAINTS):
                assigned_biz = all_businesses[idx % len(all_businesses)]
                c_status = complaint_statuses[idx]
                resolution = "Credit note issued and replacement delivered." if c_status == ComplaintStatus.RESOLVED else None

                c = Complaint(
                    business_id=assigned_biz.id,
                    complainant_id=test_buyer.id,
                    title=title,
                    description=desc,
                    status=c_status,
                    resolution_notes=resolution,
                )
                db.add(c)
            db.commit()
            print(f"✅ Seeded 10 complaints across businesses.")
        else:
            print(f"ℹ️ Complaints already seeded ({existing_complaints_count} found).")

        # 5. ProcureX Rule: Record AuditLog for initial seed
        audit_log = AuditLog(
            actor_id=admin.id,
            action="SYSTEM_DATABASE_SEEDED",
            target_type="system",
            target_id="initial_seed",
            details={"businesses_seeded": 20, "complaints_seeded": 10},
        )
        db.add(audit_log)
        db.commit()
        print("✅ Logged seed action into AuditLog.")

    except Exception as e:
        db.rollback()
        print(f"❌ Error during seed: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed()
