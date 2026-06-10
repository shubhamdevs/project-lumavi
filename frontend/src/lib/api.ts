'use client';

const BACKEND = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000').replace(/\/$/, '');

async function request<T>(
  path: string,
  options: RequestInit & { token?: string } = {}
): Promise<T> {
  const { token, ...init } = options;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BACKEND}${path}`, { ...init, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || `Request failed: ${res.status}`);
  }
  return res.json();
}

// ── Onboarding ──────────────────────────────────────────────────────────────

export async function completeOnboarding(token: string, data: {
  org: { name: string; industry: string; useCase: string };
  workspace: { name: string; description: string };
  brand: Record<string, unknown>;
  invites: string[];
}) {
  return request<{ success: boolean; workspace_id: string }>(
    '/onboarding/complete',
    { method: 'POST', token, body: JSON.stringify(data) }
  );
}

// ── Brand ────────────────────────────────────────────────────────────────────

export async function getBrand(token: string, workspaceId: string) {
  return request<Record<string, unknown>>(`/brand/${workspaceId}`, { token });
}

export async function saveBrandSection(token: string, workspaceId: string, section: string, data: Record<string, unknown>) {
  return request<{ success: boolean; completeness: number }>(
    '/brand/section',
    { method: 'PATCH', token, body: JSON.stringify({ workspace_id: workspaceId, section, data }) }
  );
}

export async function uploadBrandLogo(token: string, workspaceId: string, logoBase64: string, mimeType: string, variant = 'light') {
  return request<{ success: boolean; url: string; completeness: number }>(
    '/brand/upload-logo',
    { method: 'POST', token, body: JSON.stringify({ workspace_id: workspaceId, logo_base64: logoBase64, mime_type: mimeType, variant }) }
  );
}

export async function analyzeLogo(token: string, logoBase64: string, mimeType: string) {
  return request<Record<string, unknown>>(
    '/brand/analyze-logo',
    { method: 'POST', token, body: JSON.stringify({ logo_base64: logoBase64, mime_type: mimeType }) }
  );
}

// ── Image Generation ─────────────────────────────────────────────────────────

export async function submitImageJob(token: string, workspaceId: string, prompt: string, aspectRatio: string, quality: string) {
  return request<{ job_id: string; status: string; credits_reserved: number }>(
    '/generate/image',
    { method: 'POST', token, body: JSON.stringify({ workspace_id: workspaceId, prompt, aspect_ratio: aspectRatio, quality }) }
  );
}

export async function submitVariations(token: string, workspaceId: string, prompt: string, aspectRatio: string) {
  return request<{ job_ids: string[]; status: string }>(
    '/generate/image/variations',
    { method: 'POST', token, body: JSON.stringify({ workspace_id: workspaceId, prompt, aspect_ratio: aspectRatio, quality: 'standard' }) }
  );
}

export async function getJob(token: string, jobId: string) {
  return request<{ id: string; status: string; output_url?: string | null; error_message?: string | null; prompt_constructed?: string | null }>(
    `/jobs/${jobId}`,
    { token }
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

export async function getDashboardSummary(token: string, workspaceId: string) {
  return request<{
    workspace: { id: string; name: string };
    organization: { id: string; name: string; plan_tier: string };
    credit_balance: number;
    brand_completeness: number;
    member_count: number;
    asset_count: number;
    recent_assets: { id: string; type: string; name: string; url: string; thumbnail_url?: string; created_at: string }[];
  }>(`/dashboard/${workspaceId}/summary`, { token });
}

export async function topUpCredits(token: string, workspaceId: string) {
  return request<{ success: boolean; new_balance: number }>(
    `/dashboard/${workspaceId}/top-up-credits`,
    { method: 'POST', token }
  );
}

// ── SSE job stream (returns native EventSource) ───────────────────────────────

export function createJobStream(jobId: string, token: string): EventSource {
  const url = `${BACKEND}/jobs/${jobId}/stream?token=${encodeURIComponent(token)}`;
  return new EventSource(url);
}
