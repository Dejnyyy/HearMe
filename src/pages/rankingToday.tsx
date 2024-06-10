import React, { useState, useEffect } from 'react';
import HamburgerMenu from "./components/HamburgerMenu";
import Image from 'next/image';
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from 'next/router';
import Loading from "./components/Loading";


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

interface VoteWithCount extends Vote {
  voteCount: number;
}

const RankingToday: React.FC = () => {
  const { data: sessionData } = useSession();
  const [votes, setVotes] = useState<VoteWithCount[]>([]);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [shownType, setShownType] = useState(true); // World or friends view
  const [loading, setLoading] = useState(true); // Loading state
  const isAdmin = sessionData?.user?.isAdmin;
  const router = useRouter();

  useEffect(() => {
    const fetchVotes = async () => {
      setLoading(true); // Set loading to true before fetching data
      const apiEndpoint = shownType ? '/api/getVotesCountToday' : '/api/findMineFriendsVotesCount';
      try {
        const response = await fetch(apiEndpoint);
        if (!response.ok) {
          console.log('Votes fetch failed');
          setLoading(false); // Set loading to false in case of error
          return;
        }
        const votesData: VoteWithCount[] = await response.json();
        const votesWithUserDetails = await Promise.all(
          votesData.map(async (vote: VoteWithCount) => ({
            ...vote,
            ...await fetchUserDetails(vote.userId),
          }))
        );
        setVotes(votesWithUserDetails);
      } catch (error) {
        console.error('Error fetching votes:', error);
      } finally {
        setLoading(false); // Set loading to false after data is fetched
      }
    };

    fetchVotes().catch((error: Error) => {
      console.error('Failed to fetch votes:', error);
      setLoading(false); // Set loading to false in case of error
    });
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

  const toggleTypeShown = () => setShownType(!shownType);
  const toggleExpanded = (index: number) => setExpandedIndex(expandedIndex === index ? null : index);

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

  const handleUserClick = (userId: string) => {
    router.push(`/profile/${userId}`);
  };

  const sortedVotes = [...votes].sort((a, b) => b.voteCount - a.voteCount);
  const topVotes = sortedVotes.slice(0, 3);
  const remainingVotes = sortedVotes.slice(3);

  const getGradientClass = (index: number) => {
    switch (index) {
      case 0:
        return 'from-[#ffd700] to-[#ffffe6]'; // Gold gradient
      case 1:
        return 'from-[#c0c0c0] to-[#ffffe6]'; // Silver gradient
      case 2:
        return 'from-[#cd7f32] to-[#ffffe6]'; // Bronze gradient
      default:
        return 'from-[#636363] to-[#ffffe6]'; // Default gradient
    }
  };

  return (
    <div>
      <HamburgerMenu />
      <main className="flex min-h-screen flex-col text-white text-lg font-mono font-semibold" style={{ background: 'url("/cssBackground4.png")', backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <section className="ml-auto mt-12 mr-10">
          <button className='bg-gray-700 hover:bg-gray-800 mx-auto px-4 py-2 rounded-lg shadow-lg' onClick={toggleTypeShown}>
            Showing: {feedType}
          </button>
        </section>
        <section className='justify-center items-center'>
          <h1 className='text-5xl mt-2 text-center'>Ranking</h1>
          {loading ? (
             <Loading />
          ) : votes.length === 0 ? (
            <div className="flex flex-col items-center mt-10">
              <p className="text-center">No Votes Today Yet</p>
              <Link href="/vote" className='underline text-2xl mt-20'>Vote</Link>
            </div>
          ) : (
            <>
              <h2 className='text-center text-xl'>Top 3:</h2>
              <div className="md:flex justify-center items-center mt-4" style={{ maxHeight: '40vh', overflowY: 'auto' }}>
                {topVotes.map((vote, index) => (
                  <div key={index} className="mx-auto w-64 sm:w-80 md:w-96">
                    <div className='md:grid md:grid-cols-1 mx-auto'>
                      <div className='text-2xl font-bold mx-auto'>#{index + 1}</div>
                    </div>
                    <div className={`bg-gradient-to-b ${getGradientClass(index)} rounded-xl px-4 py-2 m-2`}>
                      <div className='flex flex-col'>
                        <div className='flex flex-row'>
                          <Image
                            src={vote.image || '/default-userimage.png'}
                            alt='Profile Picture'
                            width={50}
                            height={50}
                            className="rounded-full w-12 h-12 cursor-pointer"
                            onClick={() => handleUserClick(vote.userId)}
                          />
                          <p className='my-auto ml-4 cursor-pointer' onClick={() => handleUserClick(vote.userId)}>{vote.name}</p>
                        </div>
                      </div>
                      <div className='flex flex-col items-center'>
                        <img src={vote.imageUrl} alt={`Cover for ${vote.song}`} className="my-2 rounded-lg" />
                        <a href={`https://open.spotify.com/search/${encodeURIComponent(vote.song)}`} target="_blank" rel="noopener noreferrer">
                          <p className='hover:underline text-black'>{vote.song}</p>
                        </a>
                        <a href={`https://open.spotify.com/search/${encodeURIComponent(vote.artist)}`} target="_blank" rel="noopener noreferrer">
                          <p className='hover:underline text-gray-600'>{vote.artist}</p>
                        </a>
                        <p className="mt-2 text-lg text-black font-bold">Votes: {vote.voteCount}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <h2 className='text-center text-xl mt-8'>All Other Votes:</h2>
              <div className="" style={{ overflowY: 'auto', maxHeight: '40vh' }}>
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
                            onClick={() => handleUserClick(vote.userId)}
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
                            <img src={vote.imageUrl} alt={`Cover for ${vote.song}`} className="mx-auto sm:ml-1 text-center my-2 rounded-lg" />
                          </div>
                          <div className='ml-4 text-center sm:text-start my-auto'>
                            <a href={`https://open.spotify.com/search/${encodeURIComponent(vote.song)}`} target="_blank" rel="noopener noreferrer" className=''>
                              <p className='hover:underline'>{vote.song}</p>
                            </a>
                            <a href={`https://open.spotify.com/search/${encodeURIComponent(vote.artist)}`} target="_blank" rel="noopener noreferrer" className=''>
                              <p className='hover:underline text-gray-400'>{vote.artist}</p>
                            </a>
                            <p className="mt-2 text-lg font-bold">Votes: {vote.voteCount}</p>
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
            </>
          )}
        </section>
      </main>
    </div>
  );
};

export default RankingToday;
