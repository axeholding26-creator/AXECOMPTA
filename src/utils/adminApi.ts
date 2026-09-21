export interface ManagedUser {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'COMPTABLE' | 'LECTURE_SEULE';
  createdAt: string;
}

/**
 * Client d'administration. Mutations émises en POST avec suffixe descriptif
 * (/role, /delete) : aucune méthode PATCH ou DELETE n'est utilisée.
 */
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
    request<ManagedUser>(`/users/${id}/role`, { method: 'POST', body: JSON.stringify({ role }) }),
  deleteUser: (id: string) => request<void>(`/users/${id}/delete`, { method: 'POST' }),
};
