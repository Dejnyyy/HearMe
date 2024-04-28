import React, { useState, useEffect } from 'react';
import HamburgerMenu from './components/HamburgerMenu';
import  Error from 'next/error';
import Image from 'next/image';
// Updated Vote interface to be used
interface Vote {
  createdAt: string;
  song: string;
  artist: string;
  voteType: string;
  imageUrl?: string;
  userId: string;
}

const Explore: React.FC = () => {
  const [votes, setVotes] = useState<Vote[]>([]); // Use Vote[] instead of any[]
  const [sortByDateDesc, setSortByDateDesc] = useState(true); // No change needed
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null); // No change needed

  useEffect(() => {
    const fetchVotes = async () => {
      try {
        const response = await fetch('/api/getVotes');
        if (!response.ok) {
          console.log('Votes fetch failed');
        }
        const votesData: Vote[] = await response.json();
        const votesWithUserDetails = await Promise.all(
          votesData.map(async (vote: Vote) => ({
            ...vote,
            ...await fetchUserDetails(vote.userId),
          }))
        );
        setVotes(votesWithUserDetails);
      } catch (error) {
        console.error('Error fetching votes:', error);
      }
    };
  
    fetchVotes().catch((error: Error) => console.error('Failed to fetch votes:', error));
  }, []);
  

  // Function to formate Date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const formattedDate = date.toLocaleString('cz-CS', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
    return formattedDate.replace(',', ', ');
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
  const fetchUserDetails = async (userId: string) => {
  try {
    const res = await fetch(`/api/getUserByUserId?userId=${userId}`);
    if (!res.ok) {
      console.log('User fetch failed');
      return { name: 'Unknown', image: '/default-profile.png' }; // Use a default image if fetch fails
    }
    const userData = await res.json();
    return { name: userData.name, image: userData.image };
  } catch (error) {
    console.error('fetchUserDetails error:', error);
    return { name: 'Unknown', image: '/default-profile.png' }; // Provide a fallback name and image
  }
};

  // Determine text for sorting button
  const sortingButtonText = sortByDateDesc ? "Descendant" : "Ascendant";

  return (
    <div>
      <HamburgerMenu />
      <main className="flex min-h-screen flex-col text-white  text-lg font-mono font-semibold" style={{background: 'radial-gradient(circle, #777, #000)'}}>
        <section className="flex justify-end mt-10 mr-10">
          <div className=''>
            <button className='bg-gray-700 px-4 py-2 rounded-lg shadow-lg' onClick={toggleSortingOrder}> Date {sortingButtonText}</button>
          </div>
        </section>
        <section className='justify-center items-center'>
          <div className='text-center justify-center'>
            <h1 className='text-5xl'>Explore</h1>
          </div>
          <div className='justify-center items-center '>
            <h2 className='text-center text-xl'>All Votes:</h2>
            <div style={{ maxHeight: '80vh', overflowY: 'auto' }}>
            <ul className=''>
              {sortedVotes.map((vote, index) => (
                <div key={index} className="bg-gray-700 mx-auto w-3/4 sm:w-2/3 lg:w-1/2 xl:w-1/4 rounded-xl px-4 py-2 m-2" onClick={() => toggleExpanded(index)}>
                  <li className='cursor-pointer'>
                    <div className='flex flex-row'>
                      <Image 
                        src={vote.image || '/default-profile.png'} // Use the user image or a default
                        alt='Profile Picture'
                        width={50}
                        height={50}
                        className="rounded-full w-12 h-12"
                      />
                      <p className='my-auto ml-4'>{vote.name}</p>
                  </div>
                   
                  <div className="flex flex-row">
                      <img src={vote.imageUrl} alt={`Cover for ${vote.song}`} className="my-2 rounded-lg ml-1" />
                    <a href={`https://open.spotify.com/search/${encodeURIComponent(vote.song)}`} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className='ml-4 text-start my-auto'>
                       <p className='ml-4 text-start my-auto hover:underline'>{vote.song}</p>
                    </a>
                  </div>
          {expandedIndex === index && (
          <>
            <p>Artist: {vote.artist}</p>
            <p className={vote.voteType === '+' ? 'vote-positive' : 'vote-negative'}>+/-: {vote.voteType}</p>
            <p>{formatDate(vote.createdAt)}</p>
          </>
        )}
      </li>
    </div>
  ))}
</ul>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Explore;
