// Event model types
export type EventStatus = "pending" | "approved" | "rejected";

export interface ExternalEvent {
  id: number;
  title: string;
  slug: string;
  short_description: string;
  description: string;
  start_datetime: string | null; // ISO
  end_datetime: string | null; // ISO
  location: string;
  organizer: number | null;
  organizer_name: string;
  event_url: string;
  contact_email: string;
  tags: string[];
  status: EventStatus;
  is_public: boolean;
  is_featured: boolean;
  review_notes?: string;
  created_at: string;
  updated_at: string;
  posted_by_id?: number;
  posted_by_email?: string;
}

export interface CreateExternalEventInput {
  title: string;
  short_description?: string;
  description?: string;
  start_datetime?: string | null;
  end_datetime?: string | null;
  location?: string;
  organizer?: number | null;
  organizer_name?: string;
  event_url?: string;
  contact_email?: string;
  tags?: string[];
  is_featured?: boolean; // admin only
}
