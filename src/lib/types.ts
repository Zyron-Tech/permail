export type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
};

export type GoogleAccount = {
  user_id: string;
  google_email: string;
  scopes: string | null;
  can_send: boolean;
  connected_at: string;
};

export type Audience = {
  id: string;
  user_id: string;
  name: string;
  fields: string[];
  created_at: string;
  updated_at: string;
};

export type Contact = {
  id: string;
  audience_id: string;
  user_id: string;
  email: string;
  data: Record<string, string>;
  position: number;
};

export type CampaignStatus = "draft" | "sending" | "sent" | "failed";

export type Campaign = {
  id: string;
  user_id: string;
  audience_id: string | null;
  name: string;
  subject: string;
  body: string;
  from_name: string | null;
  reply_to: string | null;
  status: CampaignStatus;
  total_count: number;
  sent_count: number;
  failed_count: number;
  created_at: string;
  updated_at: string;
  sent_at: string | null;
};

export type RecipientStatus = "pending" | "sending" | "sent" | "failed";

export type CampaignRecipient = {
  id: string;
  campaign_id: string;
  user_id: string;
  email: string;
  data: Record<string, string>;
  rendered_subject: string | null;
  status: RecipientStatus;
  error: string | null;
  message_id: string | null;
  claimed_at: string | null;
  sent_at: string | null;
};
