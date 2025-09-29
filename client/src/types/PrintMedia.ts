export interface PrintMedia {
  print_media_id: number;
  title: string;
  type: string;
  date: string;
  description: string;
  byline?: string;
  image_path?: string;
  original_file_path?: string;
  created_at: string;
  updated_at: string;
  file_url: string;
  file_path: string;
  thumbnail_url?: string;
  image_url?: string;
  original_filename?: string;
  thumbnail_path?: string;
}

export interface CreatePrintMediaData {
  title: string;
  type: string;
  description: string;
  byline: string;
  file: File | null;
  thumbnail: File | null;
}

export type PrintMediaFormData = FormData;
