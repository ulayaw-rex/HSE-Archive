import React, {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";
import type { Publication } from "../types/Publication";
import type { User } from "../types/User";
import type { PrintMedia } from "../types/PrintMedia";

interface AboutMember {
  id: number;
  name: string;
  position: string;
  course: string;
  role: string;
  year_graduated?: string;
}

interface AboutData {
  members: AboutMember[];
  photo: string | null;
  text: string | null;
}

interface HomeData {
  featured: Publication[];
  categories: Record<string, Publication[]>;
}

interface NewsHubData {
  featured: Publication | null;
  categories: Record<string, Publication[]>;
}

interface CacheData {
  about?: AboutData;
  home?: HomeData;
  newsHub?: NewsHubData;
  printMedia?: PrintMedia[];
  university?: Publication[];
  local?: Publication[];
  national?: Publication[];
  entertainment?: Publication[];
  scitech?: Publication[];
  sports?: Publication[];
  opinion?: Publication[];
  literary?: Publication[];
  members?: User[];
}

interface DataContextType {
  cache: CacheData;
  updateCache: <K extends keyof CacheData>(key: K, data: CacheData[K]) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [cache, setCache] = useState<CacheData>({});

  const updateCache = <K extends keyof CacheData>(key: K, data: CacheData[K]) => {
    setCache((prev) => ({
      ...prev,
      [key]: data,
    }));
  };

  return (
    <DataContext.Provider value={{ cache, updateCache }}>
      {children}
    </DataContext.Provider>
  );
};

export const useDataCache = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useDataCache must be used within a DataProvider");
  }
  return context;
};
