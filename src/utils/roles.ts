import type { CurrentUser } from './authApi';

// Miroir de server/access.ts pour l'affichage ; le serveur reste la seule autorité.
type Role = CurrentUser['role'] | undefined;
export const seesAllDossiers = (r: Role) => r === 'ADMIN' || r === 'DAF' || r === 'CHEF_COMPTABLE';
export const canValidate = (r: Role) => r === 'ADMIN' || r === 'DAF' || r === 'CHEF_COMPTABLE';
export const canUnvalidate = (r: Role) => r === 'ADMIN' || r === 'CHEF_COMPTABLE';
export const canWrite = (r: Role) => r !== 'LECTURE_SEULE';

/** Séparation des tâches : on ne valide pas ce que l'on a saisi ou modifié. */
export const isOwnWork = (row: { createdById?: string; updatedById?: string }, userId: string) =>
  row.createdById === userId || row.updatedById === userId;
