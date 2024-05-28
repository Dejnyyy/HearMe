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
  voteCount: number; // Assuming you have vote count in your vote object
}

const Ranking: React.FC = () => {
  const { data: sessionData } = useSession();
  const [votes, setVotes] = useState<Vote[]>([]);
  const [sortByDateDesc, setSortByDateDesc] = useState(true);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [shownType, setShownType] = useState(true); // World or friends view
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

  // Sort votes by vote count
  const sortedVotes = [...votes].sort((a, b) => b.voteCount - a.voteCount);
  const topVotes = sortedVotes.slice(0, 3);
  const remainingVotes = sortedVotes.slice(3);

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
      setVotes(prevVotes => prevVotes.filter(vote => vote.id !== voteId));
    } catch (error) {
      console.error('Error deleting vote:', error);
    }
  };

  return (
    <div>
      <HamburgerMenu />
      <main className="flex min-h-screen flex-col text-white text-lg font-mono font-semibold" style={{ background: 'radial-gradient(circle, #777, #000)' }}>
        <section className="ml-auto mt-12 mr-10 ">
          <button className='bg-gray-700 hover:bg-gray-800 mx-auto px-4 py-2 rounded-lg shadow-lg' onClick={toggleTypeShown}>
            Showing: {feedType}
          </button>
        </section>
        <section className='justify-center items-center'>
          <h1 className='text-5xl mt-2 text-center'>Ranking</h1>
          <h2 className='text-center text-xl'>Top 3 Most Voted Songs:</h2>
          <div className="md:flex justify-center items-center" style={{ maxHeight: '40vh', overflowY:`auto`}}>
            {topVotes.map((vote, index) => (
              <div key={index} className="mx-auto w-64 sm:w-80 md:w-96">
				<div className='md:grid md:grid-cols-1 mx-auto'>
					<div className='text-2xl font-bold mx-auto'>#{index + 1}</div>
				</div>
                <div className="bg-gradient-to-b from-[#636363] to-[#ffffe6] rounded-xl px-4 py-2 m-2">
                  <div className='flex flex-col'>
                    <div className='flex flex-row'>
                      <Image
                        src={vote.image || '/default-userimage.png'}
                        alt='Profile Picture'
                        width={50}
                        height={50}
                        className="rounded-full w-12 h-12"
                      />
                      <p className='my-auto ml-4'>{vote.name}</p>
                    </div>
                  </div>
                  <div className='flex flex-col items-center'>
                    <img src={vote.imageUrl} alt={`Cover for ${vote.song}`} className="my-2 rounded-lg" />
                    <a href={`https://open.spotify.com/search/${encodeURIComponent(vote.song)}`} target="_blank" rel="noopener noreferrer">
                      <p className='hover:underline'>{vote.song}</p>
                    </a>
                    <a href={`https://open.spotify.com/search/${encodeURIComponent(vote.artist)}`} target="_blank" rel="noopener noreferrer">
                      <p className='hover:underline text-gray-400'>{vote.artist}</p>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <h2 className='text-center text-xl mt-8'>All Other Votes:</h2>
          <div className="overflow-y-auto"style={{ maxHeight: '40vh' }}>
            <ul>
              {remainingVotes.map((vote, index) => (
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
                          className="hover:bg-red-800 text-white font-bold px-4 py-2 h-1/2 rounded-full ml-auto"
                          onClick={(e) => {
                            e.stopPropagation(); 
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
                          <p className='hover:underline'>{vote.song}</p>
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

export default Ranking;
