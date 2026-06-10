const API_URL = import.meta.env.VITE_API_URL || "/api";

function getToken(): string | null {
  return localStorage.getItem("admin_token");
}

export function setToken(token: string) {
  localStorage.setItem("admin_token", token);
}

export function clearToken() {
  localStorage.removeItem("admin_token");
}

export function isAuthenticated(): boolean {
  const token = getToken();
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, { ...options, headers });
  } catch {
    throw new Error("Não foi possível conectar ao servidor. Verifique se o backend está rodando.");
  }

  let data: unknown;
  try {
    data = await res.json();
  } catch {
    throw new Error(`Resposta inválida do servidor (${res.status})`);
  }

  if (res.status === 401) {
    clearToken();
    window.location.href = "/admin/login";
    throw new Error("Sessão expirada. Redirecionando para o login...");
  }
  if (!res.ok) throw new Error((data as any)?.error || "Request failed");
  return data as T;
}

async function uploadRequest<T>(path: string, formData: FormData): Promise<T> {
  const headers: Record<string, string> = {};
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, { method: "POST", headers, body: formData });
  } catch {
    throw new Error("Não foi possível conectar ao servidor.");
  }

  let data: unknown;
  try {
    data = await res.json();
  } catch {
    throw new Error(`Resposta inválida do servidor (${res.status})`);
  }

  if (!res.ok) throw new Error((data as any)?.error || "Upload failed");
  return data as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) => request<T>(path, { method: "POST", body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) => request<T>(path, { method: "PUT", body: JSON.stringify(body) }),
  del: <T>(path: string) => request<T>(path, { method: "DELETE" }),
  upload: <T>(path: string, formData: FormData) => uploadRequest<T>(path, formData),
};
