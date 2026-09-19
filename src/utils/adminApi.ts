export interface ManagedUser {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'COMPTABLE' | 'LECTURE_SEULE';
  createdAt: string;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`/api/admin${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Erreur API (${res.status})`);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json();
}

export const adminApi = {
  listUsers: () => request<ManagedUser[]>('/users'),
  updateRole: (id: string, role: ManagedUser['role']) =>
    request<ManagedUser>(`/users/${id}/role`, { method: 'PATCH', body: JSON.stringify({ role }) }),
  deleteUser: (id: string) => request<void>(`/users/${id}`, { method: 'DELETE' }),
};
