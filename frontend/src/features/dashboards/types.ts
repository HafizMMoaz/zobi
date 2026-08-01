export type DashboardObject = {
  dashboard_title: string;
  description?: string;
  css?: string;
  slug?: string;
  position?: string;
  metadata?: string;
};

export enum DashboardStatus {
  PUBLISHED = 'published',
  DRAFT = 'draft',
}
