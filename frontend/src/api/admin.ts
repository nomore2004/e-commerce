import { apiClient } from "./client";
import type {
  DashboardStats,
  BusinessRead,
  BusinessStatus,
  BusinessVerifyRequest,
  ComplaintRead,
  ComplaintStatus,
  ComplaintStatusUpdate,
  AuditLogRead,
} from "../types/api";

// Dashboard Stats: exact backend path is /admin/dashboard-stats
export async function getDashboardStats(): Promise<DashboardStats> {
  const response = await apiClient.get<DashboardStats>("/admin/dashboard-stats");
  return response.data;
}

// Businesses: exact backend path is /admin/businesses
export async function getBusinesses(params?: {
  status?: BusinessStatus;
  skip?: number;
  limit?: number;
}): Promise<BusinessRead[]> {
  const response = await apiClient.get<BusinessRead[]>("/admin/businesses", {
    params,
  });
  return response.data;
}

// Business Detail: exact backend path is /admin/businesses/:id
export async function getBusinessById(id: string): Promise<BusinessRead> {
  const response = await apiClient.get<BusinessRead>(`/admin/businesses/${id}`);
  return response.data;
}

// Verify Business: exact backend path is /admin/businesses/:id/verify
export async function verifyBusiness(
  id: string,
  payload: BusinessVerifyRequest
): Promise<BusinessRead> {
  const response = await apiClient.post<BusinessRead>(
    `/admin/businesses/${id}/verify`,
    payload
  );
  return response.data;
}

// Complaints: exact backend path is /admin/complaints
export async function getComplaints(params?: {
  status?: ComplaintStatus;
  skip?: number;
  limit?: number;
}): Promise<ComplaintRead[]> {
  const response = await apiClient.get<ComplaintRead[]>("/admin/complaints", {
    params,
  });
  return response.data;
}

// Update Complaint Status: exact backend path is /admin/complaints/:id/status
export async function updateComplaintStatus(
  id: string,
  payload: ComplaintStatusUpdate
): Promise<ComplaintRead> {
  const response = await apiClient.patch<ComplaintRead>(
    `/admin/complaints/${id}/status`,
    payload
  );
  return response.data;
}

// Audit Logs: exact backend path is /admin/audit-logs
export async function getAuditLogs(params?: {
  skip?: number;
  limit?: number;
}): Promise<AuditLogRead[]> {
  const response = await apiClient.get<AuditLogRead[]>("/admin/audit-logs", {
    params,
  });
  return response.data;
}
