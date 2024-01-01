// SearchForm.tsx
import React, { useState, FormEvent } from 'react';
import axios from 'axios';

interface SearchFormProps {
  onSearch: (results: any[]) => void;
}

const SearchForm: React.FC<SearchFormProps> = ({ onSearch }) => {
  const [query, setQuery] = useState<string>('');

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();

    try {
      const response = await axios.get('/api/spotify/search', {
        params: {
          query,
        },
      });

      const results = response.data;
      onSearch(results);
    } catch (error) {
      console.error('Error searching songs:', error);
    }
  };

  return (
    <form onSubmit={handleSearch}>
      <input
        className='text-black rounded-md m-2 p-1'
        type="text"
        placeholder="Search for songs..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button type="submit">Search</button>
    </form>
  );
};

export default SearchForm;
