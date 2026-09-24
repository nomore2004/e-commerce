import { apiClient } from "./client";
import type { LoginRequest, Token, UserRead } from "../types/api";

export async function loginAdmin(data: LoginRequest): Promise<Token> {
  const response = await apiClient.post<Token>("/auth/login", data);
  // Condition 4: Non-admin users must be rejected at login
  if (response.data.user.role !== "admin") {
    throw new Error("Access denied: Admin privileges are required to access this portal.");
  }
  return response.data;
}

export async function getCurrentUser(): Promise<UserRead> {
  const response = await apiClient.get<UserRead>("/auth/me");
  return response.data;
}
