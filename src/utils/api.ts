import type { ClientDossier, JournalEntry, AppNotification, PlatformSettings } from '../types';

export interface BootstrapData {
  dossiers: ClientDossier[];
  entries: JournalEntry[];
  notifications: AppNotification[];
  settings: PlatformSettings;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, {
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

export const api = {
  getBootstrap: () => request<BootstrapData>('/bootstrap'),

  createDossier: (data: Omit<ClientDossier, 'id'>) =>
    request<ClientDossier>('/dossiers', { method: 'POST', body: JSON.stringify(data) }),
  updateDossier: (dossier: ClientDossier) =>
    request<ClientDossier>(`/dossiers/${dossier.id}`, { method: 'PUT', body: JSON.stringify(dossier) }),
  deleteDossier: (id: string) => request<void>(`/dossiers/${id}`, { method: 'DELETE' }),

  createEntry: (entry: JournalEntry) =>
    request<JournalEntry>('/entries', { method: 'POST', body: JSON.stringify(entry) }),
  importEntries: (entries: JournalEntry[]) =>
    request<JournalEntry[]>('/entries/import', { method: 'POST', body: JSON.stringify({ entries }) }),
  updateEntry: (entry: JournalEntry) =>
    request<JournalEntry>(`/entries/${entry.id}`, { method: 'PUT', body: JSON.stringify(entry) }),
  batchValidateEntries: (ids: string[]) =>
    request<JournalEntry[]>('/entries/batch-validate', { method: 'POST', body: JSON.stringify({ ids }) }),

  createNotification: (notification: AppNotification) =>
    request<AppNotification>('/notifications', { method: 'POST', body: JSON.stringify(notification) }),
  markNotificationRead: (id: string) => request<AppNotification>(`/notifications/${id}/read`, { method: 'PATCH' }),
  markAllNotificationsRead: () => request<void>('/notifications/read-all', { method: 'PATCH' }),
  deleteNotification: (id: string) => request<void>(`/notifications/${id}`, { method: 'DELETE' }),
  clearAllNotifications: () => request<void>('/notifications', { method: 'DELETE' }),

  updateSettings: (settings: PlatformSettings) =>
    request<PlatformSettings>('/settings', { method: 'PUT', body: JSON.stringify(settings) }),

  resetAllData: () => request<BootstrapData>('/reset', { method: 'POST' }),
  importBackup: (backup: { settings?: PlatformSettings; dossiers?: ClientDossier[]; entries?: JournalEntry[] }) =>
    request<BootstrapData>('/import-backup', { method: 'POST', body: JSON.stringify(backup) }),
};
