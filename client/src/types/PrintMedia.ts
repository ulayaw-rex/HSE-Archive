export interface PrintMedia {
  print_media_id: number;
  title: string;
  type: string;
  date_published: string | null;
  description: string;
  byline?: string;
  user_id?: number;
  owner_name?: string | null;
  has_pending_request?: boolean;
  file_path: string;
  file_url: string | null;
  thumbnail_path?: string;
  thumbnail_url?: string | null;
  original_filename?: string;
  created_at: string;
  updated_at: string;
}

export interface CreatePrintMediaData {
  title: string;
  type: string;
  description: string;
  byline: string;
  date_published: string;
  file: File | null;
  thumbnail: File | null;
}

export type PrintMediaFormData = FormData;
