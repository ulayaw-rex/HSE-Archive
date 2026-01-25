import type { User } from "./User";

export interface Publication {
  publication_id: number;
  user_id: number;
  title: string;
  byline: string;
  body: string;
  category: string;
  image?: string;
  photo_credits?: string;
  date_published: string | null;
  created_at: string;
  updated_at: string;
  status:
    | "draft"
    | "submitted"
    | "reviewed"
    | "approved"
    | "published"
    | "returned"
    | "rejected"
    | "pending";
  writers?: User[];
  thumbnail?: string;
}

export interface CreatePublicationData {
  title: string;
  byline: string;
  body: string;
  category: string;
  image?: File | null;
  photo_credits?: string;
  writer_ids: number[];
  date_published?: string;
}
