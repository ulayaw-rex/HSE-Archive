import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import axios from "../AxiosInstance";
import type { User } from "../types/User";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  checkAuth: () => Promise<User | null>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = async (): Promise<User | null> => {
    try {
      const response = await axios.get("/me");
      const userData = response.data.user;
      setUser(userData);
      return userData;
    } catch (error: any) {
      if (error.response && error.response.status === 401) {
        setUser(null);
      } else {
        console.error("Auth check failed", error);
        setUser(null);
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

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

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
