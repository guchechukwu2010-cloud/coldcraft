import { supabase } from "./supabase";

const BASE_URL = import.meta.env.VITE_API_URL || "/api";

async function getAuthHeaders() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Not authenticated");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${session.access_token}`,
  };
}

export async function generateEmails(data) {
  const headers = await getAuthHeaders();
  const res = await fetch(`${BASE_URL}/email/generate`, {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw { status: res.status, ...json };
  return json;
}

export async function getUserProfile() {
  const headers = await getAuthHeaders();
  const res = await fetch(`${BASE_URL}/user/profile`, { headers });
  const json = await res.json();
  if (!res.ok) throw json;
  return json;
}

export async function createCheckout() {
  const headers = await getAuthHeaders();
  const res = await fetch(`${BASE_URL}/payment/create-checkout`, {
    method: "POST",
    headers,
  });
  const json = await res.json();
  if (!res.ok) throw json;
  return json;
}

export async function getPaymentStatus() {
  const headers = await getAuthHeaders();
  const res = await fetch(`${BASE_URL}/payment/status`, { headers });
  const json = await res.json();
  if (!res.ok) throw json;
  return json;
}
