export interface User {
  id: number;
  name: string;
  email: string;
  role: "hillsider" | "alumni" | "admin";
  created_at: string;
  course?: string;
  position?: string;
  status?: "pending" | "approved" | "rejected";
}

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role: "hillsider" | "alumni" | "admin";
  course?: string;
  position?: string;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  password?: string;
  role?: "hillsider" | "alumni" | "admin";
  course?: string;
  position?: string;
}
