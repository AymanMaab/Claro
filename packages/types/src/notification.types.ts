export type NotificationType = 'budget_warning' | 'budget_exceeded';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  isRead: boolean;
  createdAt: string;
}
