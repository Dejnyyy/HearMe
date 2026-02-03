import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";

interface SearchBarProps {
  onSearch: (searchTerm: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      onSearch(searchTerm);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, onSearch]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  return (
    <div className="relative w-full">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <Search className="h-4 w-4 text-gray-400" />
      </div>
      <input
        type="text"
        value={searchTerm}
        onChange={handleInputChange}
        placeholder="Search users..."
        className="focus:border-gold-500 dark:focus:border-gold-500 focus:ring-gold-500 dark:focus:ring-gold-500 w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 transition-all focus:outline-none focus:ring-1 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
      />
    </div>
  );
};

export default SearchBar;
