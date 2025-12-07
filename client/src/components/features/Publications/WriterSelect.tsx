import React, { useState, useEffect, useRef } from "react";
import AxiosInstance from "../../../AxiosInstance";

interface User {
  id: number;
  name: string;
}

interface WriterSelectProps {
  onSelect: (id: number | null, name: string) => void;
  initialValue?: string;
  initialId?: number | null;
}

const WriterSelect: React.FC<WriterSelectProps> = ({
  onSelect,
  initialValue = "",
  initialId = null,
}) => {
  const [query, setQuery] = useState(initialValue);
  const [suggestions, setSuggestions] = useState<User[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const isSelectionLocked = useRef(false);

  const [isValidUser, setIsValidUser] = useState<boolean>(!!initialId);

  useEffect(() => {
    setQuery(initialValue);

    if (isSelectionLocked.current) {
      isSelectionLocked.current = false;
      setIsValidUser(true);
    } else {
      setIsValidUser(!!initialId);
    }
  }, [initialValue, initialId]);

  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (query.length > 1 && !isValidUser) {
        setLoading(true);
        try {
          const response = await AxiosInstance.get(
            `/users/search?query=${query}`
          );
          setSuggestions(response.data);
          setIsOpen(true);
        } catch (error) {
          console.error("Search error:", error);
        }
        setLoading(false);
      } else if (query.length <= 1) {
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, isValidUser]);

  const handleSelect = (user: User) => {
    isSelectionLocked.current = true;

    setQuery(user.name);
    setSuggestions([]);
    setIsOpen(false);
    setIsValidUser(true);

    onSelect(user.id, user.name);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setQuery(newValue);

    setIsValidUser(false);
    isSelectionLocked.current = false;

    if (!isOpen) setIsOpen(true);

    onSelect(null, newValue);
  };

  return (
    <div className="relative col-span-1">
      <input
        type="text"
        placeholder="Search Writer..."
        value={query}
        onChange={handleInputChange}
        className={`w-full p-3 rounded-md border focus:outline-none focus:ring-2 
                    ${
                      query.length > 0 && !isValidUser
                        ? "border-red-500 text-red-600 focus:ring-red-500"
                        : "border-gray-700 focus:ring-green-600"
                    }`}
        required
      />

      {query.length > 0 && !isValidUser && !loading && (
        <p className="text-red-500 text-xs mt-1 absolute -bottom-5 left-0">
          User not registered
        </p>
      )}

      {loading && (
        <div className="absolute right-3 top-3 text-xs text-gray-500">...</div>
      )}

      {isOpen && suggestions.length > 0 && (
        <ul className="absolute z-50 left-0 w-full bg-white border border-gray-300 mt-1 max-h-48 overflow-y-auto shadow-lg rounded-md text-sm">
          {suggestions.map((user) => (
            <li
              key={user.id}
              onClick={() => handleSelect(user)}
              className="p-2 hover:bg-green-100 cursor-pointer text-gray-800 border-b border-gray-100 last:border-0"
            >
              {user.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default WriterSelect;
