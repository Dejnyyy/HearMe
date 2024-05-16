import React, { useState, useEffect } from 'react';
import HamburgerMenu from './components/HamburgerMenu';
import Image from 'next/image';
import { useSession } from "next-auth/react";

interface Vote {
  id: number;
  createdAt: string;
  song: string;
  artist: string;
  voteType: string;
  imageUrl?: string;
  userId: string;
  name?: string;
  image?: string;
}

const Explore: React.FC = () => {
  const { data: sessionData } = useSession();
  const [votes, setVotes] = useState<Vote[]>([]);
  const [sortByDateDesc, setSortByDateDesc] = useState(true);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [shownType, setShownType] = useState(true); // true for all votes, false for only mine and friends
  const isAdmin = sessionData?.user?.isAdmin;

  useEffect(() => {
    const fetchVotes = async () => {
      const apiEndpoint = shownType ? '/api/getVotes' : '/api/findMineAndFriendsVotes';
      try {
        const response = await fetch(apiEndpoint);
        if (!response.ok) {
          console.log('Votes fetch failed');
          return;
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
  }, [shownType]);

  const fetchUserDetails = async (userId: string) => {
    try {
      const res = await fetch(`/api/getUserByUserId?userId=${userId}`);
      if (!res.ok) {
        console.log('User fetch failed');
        return { name: 'Unknown', image: '/default-profile.png' };
      }
      const userData = await res.json();
      return { name: userData.name, image: userData.image };
    } catch (error) {
      console.error('fetchUserDetails error:', error);
      return { name: 'Unknown', image: '/default-profile.png' };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('cz-CS', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).replace(',', ', ');
  };

  const sortedVotes = [...votes].sort((a, b) => sortByDateDesc ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime() : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  const toggleSortingOrder = () => setSortByDateDesc(!sortByDateDesc);
  const toggleTypeShown = () => setShownType(!shownType);
  const toggleExpanded = (index: number) => setExpandedIndex(expandedIndex === index ? null : index);

  const sortingButtonText = sortByDateDesc ? "Descendant" : "Ascendant";
  const feedType = shownType ? "World" : "Friends";

  const handleDeleteClick = async (voteId: number) => {
    try {
      const response = await fetch(`/api/deleteVote?voteId=${voteId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        console.error('Failed to delete vote');
        return;
      }
      // Remove the vote from the state
      setVotes(prevVotes => prevVotes.filter(vote => vote.id !== voteId));
    } catch (error) {
      console.error('Error deleting vote:', error);
    }
  };

  return (
    <div>
      <HamburgerMenu />
      <main className="flex min-h-screen flex-col text-white text-lg font-mono font-semibold" style={{ background: 'radial-gradient(circle, #777, #000)' }}>
        <section className="flex justify-end mt-12 mr-10 ml-10">
          <button className='bg-gray-700 hover:bg-gray-800 mx-auto px-4 py-2 rounded-lg shadow-lg' onClick={toggleSortingOrder}>
            Date {sortingButtonText}
          </button>
          <button className='bg-gray-700 hover:bg-gray-800 mx-auto px-4 py-2 rounded-lg shadow-lg' onClick={toggleTypeShown}>
            Showing: {feedType}
          </button>
        </section>
        <section className='justify-center items-center'>
          <h1 className='text-5xl mt-2 text-center'>Explore</h1>
          <h2 className='text-center text-xl'>All {feedType} Votes:</h2>
          <div style={{ maxHeight: '80vh', overflowY: 'auto' }}>
            <ul>
              {sortedVotes.map((vote, index) => (
                <div key={index} className="bg-gray-700 mx-auto w-3/4 sm:w-2/3 lg:w-1/2 xl:w-1/3 rounded-xl px-4 py-2 m-2" onClick={() => toggleExpanded(index)}>
                  <li className='cursor-pointer'>
                    <div className='flex flex-row'>
                      <Image
                        src={vote.image || '/default-userimage.png'}
                        alt='Profile Picture'
                        width={50}
                        height={50}
                        className="rounded-full w-12 h-12"
                      />
                      <p className='my-auto ml-4'>{vote.name}</p>
                      {isAdmin && (
                        <button 
                          className="bg-red-700 hover:bg-red-800 text-white font-bold py-2 px-4 rounded ml-auto"
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent the outer click handler from firing
                            handleDeleteClick(vote.id);
                          }}
                        >
                          x
                        </button>
                      )}
                    </div>

                    <div className="sm:flex sm:flex-row">
                      <div className='mx-auto sm:mx-0 text-center sm:text-center'>
                        <img src={vote.imageUrl} alt={`Cover for ${vote.song}`}
                          className="mx-auto sm:ml-1 text-center my-2 rounded-lg" />
                      </div>
                      <div className='ml-4 text-center sm:text-start my-auto'>
                        <a href={`https://open.spotify.com/search/${encodeURIComponent(vote.song)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className=''>
                          <p className=' hover:underline'>{vote.song}</p>
                        </a>
                        <a href={`https://open.spotify.com/search/${encodeURIComponent(vote.artist)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className=''>
                          <p className='hover:underline text-gray-400'>{vote.artist}</p>
                        </a>
                      </div>
                    </div>
                    {expandedIndex === index && (
                      <>
                        <p className={vote.voteType === '+' ? 'vote-positive' : 'vote-negative'}>Type of vote: {vote.voteType}</p>
                        <p>{formatDate(vote.createdAt)}</p>
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
