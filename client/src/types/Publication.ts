export interface Publication {
  id: number;
  title: string;
  byline: string;
  body: string;
  category: string;
  image?: string;
  photo_credits?: string;
  created_at: string;
  updated_at: string;
}

export interface CreatePublicationData {
  title: string;
  byline: string;
  body: string;
  category: string;
  image?: File | null;
  photo_credits?: string;
}
