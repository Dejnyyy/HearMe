// pages/vote.tsx
import Link from 'next/link';
import SearchForm from './SearchForm';
import { useState } from 'react';

const Vote: React.FC = () => {
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const handleSearch = (results: any[]) => {
    setSearchResults(results);
  };

  return (
    <div>
      <main className="flex min-h-screen flex-col text-white items-center justify-center bg-black text-lg font-mono font-semibold">
        <Link href="/" className="absolute right-10 top-5">
          back
        </Link>
        <section>
          <div>
            <h1>Vote</h1>
          </div>
        </section>
        <div className="w-96 h-96 my-2 shadow-md shadow-white rounded-lg">
          <SearchForm onSearch={handleSearch} />
        </div>
        {/* Display search results */}
        <ul>
          {searchResults.map((track) => (
            <li key={track.id}>{track.name}</li>
          ))}
        </ul>
      </main>
    </div>
  );
};

export default Vote;
