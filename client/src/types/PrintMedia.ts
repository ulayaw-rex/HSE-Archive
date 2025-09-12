export interface PrintMedia {
  print_media_id: number;
  title: string;
  type: string;
  date: string;
  description: string;
  byline?: string;
  image_path?: string;
  file_path?: string;
  created_at: string;
  updated_at: string;
}

export interface CreatePrintMediaData {
  title: string;
  type: string;
  description: string;
  byline?: string;
  file?: File | null;
}
