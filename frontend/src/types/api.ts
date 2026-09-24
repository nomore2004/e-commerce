// Exact TypeScript representations matching FastAPI / Pydantic schemas

export type UserRole = "admin" | "buyer" | "supplier";

export type BusinessStatus = "pending" | "verified" | "rejected";

export type ComplaintStatus = "open" | "under_review" | "resolved" | "dismissed";

export interface UserRead {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Token {
  access_token: string;
  token_type: string;
  user: UserRead;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface BusinessRead {
  id: string;
  name: string;
  business_type: string;
  gst_no: string;
  address: string;
  status: BusinessStatus;
  rejection_reason: string | null;
  verified_by: string | null;
  verified_at: string | null;
  owner_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface BusinessVerifyRequest {
  status: BusinessStatus;
  rejection_reason?: string | null;
}

export interface ComplaintRead {
  id: string;
  business_id: string;
  complainant_id: string | null;
  title: string;
  description: string;
  status: ComplaintStatus;
  resolution_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ComplaintStatusUpdate {
  status: ComplaintStatus;
  resolution_notes?: string | null;
}

export interface AuditLogRead {
  id: string;
  actor_id: string | null;
  action: string;
  target_type: string;
  target_id: string;
  details: Record<string, unknown> | null;
  created_at: string;
}

export interface DashboardStats {
  businesses: {
    total: number;
    pending: number;
    verified: number;
    rejected: number;
  };
  complaints: {
    open: number;
  };
}
