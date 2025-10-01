export interface User {
  id: number;
  name: string;
  email: string;
  role: "hillsider" | "alumni" | "admin";
  created_at: string;
}

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role: "hillsider" | "alumni" | "admin";
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  password?: string;
  role?: "hillsider" | "alumni" | "admin";
}
