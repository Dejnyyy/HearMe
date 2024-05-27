import React, { useState, useEffect } from 'react';

interface SearchBarProps {
  onSearch: (searchTerm: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');

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
    <div className="flex items-center mb-4 w-full bg-gray-500 rounded-lg text-center">
      <input
        type="text"
        value={searchTerm}
        onChange={handleInputChange}
        placeholder="Search users..."
        className="p-2 border rounded-md ml-auto font-mono w-full"
      />
    </div>
  );
};

export default SearchBar;
