export interface FeedbackResponse {
  id: string;
  content: string;
  channel: string;
  customerLabel: string | null;
  sourceRef: string | null;
  status: string;
  createdAt: Date;
}