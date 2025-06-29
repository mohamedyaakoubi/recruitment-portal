// src/lib/job-categories.ts

export const JOB_CATEGORIES = [
  'Agricole',
  'Bâtiment et travail publique',
  'Development & IT',
  'Industriel',
  'Restauration',
  'Santé',
  'Services',
  'Sociale',
  'Tourisme'
] as const;

export type JobCategory = typeof JOB_CATEGORIES[number];

