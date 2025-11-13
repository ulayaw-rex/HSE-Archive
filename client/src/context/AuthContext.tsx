import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import axios from "../AxiosInstance";

// --- Types ---
interface User {
  id: number;
  name: string;
  email?: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  checkAuth: () => Promise<void>;
  logout: () => Promise<void>;
}

// Create the Context with a default undefined value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- Provider Component ---
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // The function that asks the backend: "Who is this?"
  const checkAuth = async () => {
    try {
      // If this succeeds, we are logged in
      const response = await axios.get("/me");
      setUser(response.data.user);
    } catch (error) {
      // If Laravel returns 401 (Unauthorized), it means we are not logged in.
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Run checkAuth once when the app starts
  useEffect(() => {
    checkAuth();
  }, []);

  // In src/context/AuthContext.tsx

  const logout = async () => {
    try {
      await axios.post("/logout");
    } catch (error) {
      console.log("Logout request failed, but forcing local logout.");
    } finally {
      setUser(null);

      window.location.href = "/";
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, checkAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// --- Custom Hook for easy access ---
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
