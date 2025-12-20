import React, { useState, useEffect, useRef } from "react";
import AxiosInstance from "../../../AxiosInstance";
import { FaTimes } from "react-icons/fa";

interface User {
  id: number;
  name: string;
}

interface WriterSelectProps {
  selectedIds: number[];
  onSelectionChange: (ids: number[]) => void;
  initialUsers?: User[];
}

const WriterSelect: React.FC<WriterSelectProps> = ({
  selectedIds,
  onSelectionChange,
  initialUsers = [],
}) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialUsers.length > 0 && selectedUsers.length === 0) {
      setSelectedUsers(initialUsers);
    }
  }, [initialUsers]);

  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (query.length > 1) {
        setLoading(true);
        try {
          const response = await AxiosInstance.get(
            `/users/search?query=${query}`
          );

          const filtered = response.data.filter(
            (u: User) => !selectedIds.includes(u.id)
          );
          setSuggestions(filtered);
          setIsOpen(true);
        } catch (error) {
          console.error("Search error:", error);
        }
        setLoading(false);
      } else {
        setSuggestions([]);
        setIsOpen(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, selectedIds]);

  const handleSelect = (user: User) => {
    const newIds = [...selectedIds, user.id];
    onSelectionChange(newIds);

    setSelectedUsers([...selectedUsers, user]);

    setQuery("");
    setSuggestions([]);
    setIsOpen(false);
  };

  const handleRemove = (userId: number) => {
    const newIds = selectedIds.filter((id) => id !== userId);
    onSelectionChange(newIds);

    const newUsers = selectedUsers.filter((u) => u.id !== userId);
    setSelectedUsers(newUsers);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={wrapperRef}>
      {selectedUsers.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {selectedUsers.map((user) => (
            <span
              key={user.id}
              className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full flex items-center gap-2 border border-green-200"
            >
              {user.name}
              <button
                type="button"
                onClick={() => handleRemove(user.id)}
                className="text-green-600 hover:text-green-900 focus:outline-none flex items-center justify-center"
              >
                <FaTimes size={12} />
              </button>
            </span>
          ))}
        </div>
      )}

      <input
        type="text"
        placeholder={
          selectedUsers.length > 0
            ? "Add another writer..."
            : "Search writers..."
        }
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full h-[50px] p-3 rounded-md border border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-600"
      />

      {loading && (
        <div className="absolute right-3 top-14 text-xs text-gray-500">...</div>
      )}

      {isOpen && suggestions.length > 0 && (
        <ul className="absolute z-50 left-0 w-full bg-white border border-gray-300 mt-1 max-h-48 overflow-y-auto shadow-lg rounded-md text-sm">
          {suggestions.map((user) => (
            <li
              key={user.id}
              onClick={() => handleSelect(user)}
              className="p-3 hover:bg-green-50 cursor-pointer text-gray-800 border-b border-gray-100 last:border-0 flex justify-between"
            >
              <span>{user.name}</span>
            </li>
          ))}
        </ul>
      )}

      {isOpen && suggestions.length === 0 && query.length > 1 && !loading && (
        <div className="absolute z-50 left-0 w-full bg-white border border-gray-300 mt-1 p-3 text-red-500 text-sm shadow-lg rounded-md">
          User not found
        </div>
      )}
    </div>
  );
};

export default WriterSelect;
