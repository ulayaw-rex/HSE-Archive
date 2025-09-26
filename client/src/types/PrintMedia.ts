// types/PrintMedia.ts
export interface PrintMedia {
  print_media_id: number;
  title: string;
  type: string;
  date: string;
  description: string;
  byline?: string;
  image_path?: string;
  file_path: string; // ✅ always present
  original_file_path?: string; // ✅ optional, used for downloads
  created_at: string;
  updated_at: string;
  file_url: string; // URL for accessing the file
  thumbnail_url?: string; // Optional thumbnail URL
  image_url?: string; // Optional image URL
  original_filename?: string; // Original name of uploaded file
}

export interface CreatePrintMediaData {
  title: string;
  type: string;
  description: string;
  byline?: string;
  file?: File | null;
}
