import { apiFetch } from "./client";
import type { Company, User } from "@/lib/types";

export interface LoginResponse {
  access_token: string;
  token_type: string;
  role: string;
  user_id: string;
  company_id?: string | null;
}

export interface MeResponse {
  user: User;
  company: Company | null;
}

function mapUser(raw: any): User {
  return {
    id: raw.id,
    companyId: raw.company_id ?? raw.companyId,
    email: raw.email,
    name: raw.name,
    role: raw.role,
    isActive: raw.is_active ?? raw.isActive ?? true,
    createdAt: new Date(raw.created_at ?? raw.createdAt ?? Date.now()),
    updatedAt: new Date(raw.updated_at ?? raw.updatedAt ?? Date.now()),
  };
}

function mapCompany(raw: any): Company {
  return {
    id: raw.id,
    name: raw.name,
    types: raw.types ?? [],
    logo: raw.logo?.replace('http://localhost:8000', 'https://duka-salesplatform-1.onrender.com') ?? raw.logo,
    address: raw.address,
    phone: raw.phone,
    email: raw.email,
    taxId: raw.tax_id ?? raw.taxId,
    currency: raw.currency ?? "TSH",
    currencySymbol: raw.currency_symbol ?? raw.currencySymbol ?? "TSh",
    subscriptionPlan: raw.subscription_plan ?? raw.subscriptionPlan ?? "free",
    subscriptionExpiry: raw.subscription_expiry ? new Date(raw.subscription_expiry) : undefined,
    isActive: raw.is_active ?? raw.isActive ?? true,
    createdAt: new Date(raw.created_at ?? raw.createdAt ?? Date.now()),
    updatedAt: new Date(raw.updated_at ?? raw.updatedAt ?? Date.now()),
  };
}

export async function loginApi(email: string, password: string) {
  const response = await apiFetch<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  // Persist the access token for subsequent requests
  if (typeof window !== "undefined" && response.access_token) {
    try {
      window.localStorage.setItem("access_token", response.access_token);
    } catch (e) {
      console.warn("Failed to store access token", e);
    }
  }
  return response;
}

function getStoredToken(): string | null {
  if (typeof window !== "undefined") {
    try {
      return window.localStorage.getItem("access_token");
    } catch (e) {
      console.warn("Failed to read access token", e);
    }
  }
  return null;
}

export async function getMeApi(token?: string) {
  const authToken = token ?? getStoredToken();
  const raw = await apiFetch<any>("/auth/me", { token: authToken });
  return {
    user: mapUser(raw.user),
    company: raw.company ? mapCompany(raw.company) : null,
  } as MeResponse;
}
