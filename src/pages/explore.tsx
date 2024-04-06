import React, { useState, useEffect } from 'react';
import HamburgerMenu from './components/HamburgerMenu';

interface Vote {
  createdAt: string;
  song: string;
  artist: string;
  voteType: string;
  imageUrl: string; // Assuming this field exists
}


const Explore: React.FC = () => {
  const [votes, setVotes] = useState<any[]>([]);
  const [sortByDateDesc, setSortByDateDesc] = useState(true); // State to track sorting order
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  useEffect(() => {
    const fetchVotes = async () => {
      try {
        const response = await fetch('/api/getVotes');
        if (!response.ok) {
          throw new Error('Failed to fetch votes');
        }
        const votesData = await response.json();
        setVotes(votesData);
      } catch (error) {
        console.error('Error fetching votes:', error);
      }
    };

    fetchVotes();
  }, []);

  // Funkce pro formátování data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const formattedDate = date.toLocaleString('cz-CS', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
    return formattedDate.replace(',', ', '); // Přidání mezer po čárce
  };

  // Sort votes by date
  const sortedVotes = [...votes].sort((a, b) => {
    if (sortByDateDesc) {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }
  });
  // Toggle sorting order
  const toggleSortingOrder = () => {
    setSortByDateDesc(!sortByDateDesc);
  };
  // Toggle expanded view for an item
  const toggleExpanded = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };
  // Determine text for sorting button
  const sortingButtonText = sortByDateDesc ? "Descendant" : "Ascendant";

  return (
    <div>
      <HamburgerMenu />
      <main className="flex min-h-screen flex-col text-white bg-gray-950 text-lg font-mono font-semibold">
        <section className="flex justify-end mt-10 mr-10">
          <div className=''>
            <button className='border border-white px-4 py-2 rounded-lg shadow-lg' onClick={toggleSortingOrder}> Date {sortingButtonText}</button>
          </div>
        </section>
        <section className='justify-center items-center'>
          <div className='text-center justify-center'>
            <h1>Explore</h1>
          </div>
          <div className='justify-center items-center '>
            <h2 className='text-center'>All Votes:</h2>
            <ul>
              {sortedVotes.map((vote, index) => (
                <div key={index} className="border-white border mx-auto w-1/2 xl:w-1/4 rounded-md px-4 py-2 m-2" onClick={() => toggleExpanded(index)}>
                  <li className='cursor-pointer'>
                    <div className="flex flex-row">
                    <img src={vote.imageUrl} alt={`Cover for ${vote.song}`} className="mx-auto my-2" />
                    <p className='text-start my-auto'>Song: {vote.song}</p>
                    </div>
                    <p>{formatDate(vote.createdAt)}</p>
                    
                    {expandedIndex === index && (
                      <>
                        <p>+/-: {vote.voteType}</p>
                        <p>Artist: {vote.artist}</p>
                        <p>Voted: {vote.userId}</p>
                      </>
                    )}
                  </li>
                </div>
              ))}
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Explore;
