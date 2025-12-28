import React, {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

interface CacheData {
  about?: any;
  home?: { featured: any[]; categories: Record<string, any[]> };
  newsHub?: { featured: any; categories: Record<string, any[]> };
  printMedia?: any[];
  university?: any[];
  local?: any[];
  national?: any[];
  entertainment?: any[];
  scitech?: any[];
  sports?: any[];
  opinion?: any[];
  literary?: any[];
}

interface DataContextType {
  cache: CacheData;
  updateCache: (key: keyof CacheData, data: any) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [cache, setCache] = useState<CacheData>({});

  const updateCache = (key: keyof CacheData, data: any) => {
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
