import type { ClientDossier, JournalEntry, AppNotification, PlatformSettings } from '../types';

export interface BootstrapData {
  dossiers: ClientDossier[];
  entries: JournalEntry[];
  notifications: AppNotification[];
  settings: PlatformSettings;
}

/**
 * Client API AxeCompta.
 *
 * Politique de sécurité : toutes les mutations sont émises en POST avec un suffixe
 * descriptif (/update, /delete, /read, /clear). Aucune méthode PUT, PATCH ou DELETE
 * n'est jamais utilisée (alignement sur la politique CORS stricte du serveur).
 */
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

  // Dossiers comptables
  createDossier: (data: Omit<ClientDossier, 'id' | 'ownerId' | 'ownerName'>) =>
    request<ClientDossier>('/dossiers', { method: 'POST', body: JSON.stringify(data) }),
  updateDossier: (dossier: ClientDossier) =>
    request<ClientDossier>(`/dossiers/${dossier.id}/update`, { method: 'POST', body: JSON.stringify(dossier) }),
  deleteDossier: (id: string) => request<void>(`/dossiers/${id}/delete`, { method: 'POST' }),

  // Écritures comptables
  createEntry: (entry: JournalEntry) =>
    request<JournalEntry>('/entries', { method: 'POST', body: JSON.stringify(entry) }),
  importEntries: (entries: JournalEntry[]) =>
    request<JournalEntry[]>('/entries/import', { method: 'POST', body: JSON.stringify({ entries }) }),
  updateEntry: (entry: JournalEntry) =>
    request<JournalEntry>(`/entries/${entry.id}/update`, { method: 'POST', body: JSON.stringify(entry) }),
  batchValidateEntries: (ids: string[]) =>
    request<JournalEntry[]>('/entries/batch-validate', { method: 'POST', body: JSON.stringify({ ids }) }),

  // Notifications
  createNotification: (notification: AppNotification) =>
    request<AppNotification>('/notifications', { method: 'POST', body: JSON.stringify(notification) }),
  markNotificationRead: (id: string) => request<AppNotification>(`/notifications/${id}/read`, { method: 'POST' }),
  markAllNotificationsRead: () => request<void>('/notifications/read-all', { method: 'POST' }),
  deleteNotification: (id: string) => request<void>(`/notifications/${id}/delete`, { method: 'POST' }),
  clearAllNotifications: () => request<void>('/notifications/clear', { method: 'POST' }),

  // Réglages de la plateforme
  updateSettings: (settings: PlatformSettings) =>
    request<PlatformSettings>('/settings/update', { method: 'POST', body: JSON.stringify(settings) }),

  // Sauvegarde / restauration (périmètre de l'utilisateur connecté)
  importBackup: (backup: { settings?: PlatformSettings; dossiers?: ClientDossier[]; entries?: JournalEntry[] }) =>
    request<BootstrapData>('/import-backup', { method: 'POST', body: JSON.stringify(backup) }),
};
